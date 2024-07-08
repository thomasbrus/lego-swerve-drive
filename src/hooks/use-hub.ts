import { Message } from "@/utils/message";
import { useBluetooth } from "./use-bluetooth";
import { JSONBuffer } from "@/utils/json-buffer";
import { useEffect, useState } from "react";
import { logIncomingHubMessage, logOutgoingHubMessage } from "@/utils/log-message";

const pybricksServiceUUID = "c5f50001-8280-46da-89f4-6d8051e4aeef";
const pybricksCharUUID = "c5f50002-8280-46da-89f4-6d8051e4aeef";

const STOP_USER_PROGRAM_COMMAND = "\x00";
const START_USER_PROGRAM_COMMAND = "\x01";
const WRITE_STDIN_COMMAND = "\x06";

const STATUS_REPORT_EVENT = "\x00";
const WRITE_STDOUT_EVENT = "\x01";

const USER_PROGRAM_RUNNING_STATUS_FLAG = 1 << 6;

const jsonBuffer = new JSONBuffer();

export interface Hub {
  isConnected: boolean;
  isConnecting: boolean;
  isUserProgramRunning: boolean;
  connect: () => Promise<{
    device: BluetoothDevice;
    server: BluetoothRemoteGATTServer;
    primaryService: BluetoothRemoteGATTService;
    characteristic: BluetoothRemoteGATTCharacteristic;
  }>;
  disconnect: () => void;
  sendCode: (source: string, opts?: { log: boolean }) => Promise<void>;
  waitForMessage: (type: string) => Promise<Message>;
  startUserProgram: () => Promise<void>;
  stopUserProgram: () => Promise<void>;
}

export function useHub({ onMessage }: { onMessage: (message: Message) => void }) {
  const {
    isConnecting,
    isConnected,
    connect: connectBluetooth,
    disconnect: disconnectBluetooth,
    write: writeBluetooth,
  } = useBluetooth({
    onMessage: handleMessage,
  });

  const [isUserProgramRunning, setIsUserProgramRunning] = useState(false);

  useEffect(() => {
    jsonBuffer.setCallback(handleJson);
    return () => jsonBuffer.removeCallback();
  }, [onMessage]);

  function handleMessage(data: string) {
    switch (data[0]) {
      case STATUS_REPORT_EVENT:
        handleStatusReport(data.slice(1));
        break;
      case WRITE_STDOUT_EVENT:
        handleStdout(data.slice(1));
        break;
    }
  }

  function handleStatusReport(data: string) {
    const bitmask = data.charCodeAt(0);
    const isRunning = !!(bitmask & USER_PROGRAM_RUNNING_STATUS_FLAG);

    if (isUserProgramRunning !== isRunning) {
      setIsUserProgramRunning(isRunning);
    }
  }

  function handleStdout(data: string) {
    jsonBuffer.feed(data);
  }

  async function connect() {
    return connectBluetooth({
      primaryServiceId: pybricksServiceUUID,
      charId: pybricksCharUUID,
    });
  }

  function handleJson(jsonString: string) {
    const message = Message.parse(jsonString);
    logIncomingHubMessage(message);
    onMessage(message);
  }

  async function sendCode(source: string, opts = { log: true }) {
    const message = new Message("sendCode", source);

    if (opts.log) logOutgoingHubMessage(message);

    await writeBluetooth(WRITE_STDIN_COMMAND + source + "\n");
  }

  async function waitForMessage(type: string) {
    return new Promise<Message>((resolve) => {
      const callback = (jsonString: string) => {
        const message = Message.parse(jsonString);
        if (message.type === type) resolve(message);
      };

      jsonBuffer.setOnceCallback(callback);
    });
  }

  async function startUserProgram() {
    jsonBuffer.clear();
    return await writeBluetooth(START_USER_PROGRAM_COMMAND);
  }

  async function stopUserProgram() {
    return await writeBluetooth(STOP_USER_PROGRAM_COMMAND);
  }

  const hub: Hub = {
    isConnected,
    isConnecting,
    isUserProgramRunning,
    connect,
    disconnect: disconnectBluetooth,
    sendCode,
    waitForMessage,
    startUserProgram,
    stopUserProgram,
  };

  return hub;
}

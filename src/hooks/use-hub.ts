import { useBluetooth } from "./use-bluetooth";
import { useRef, useState } from "react";
import { logIncomingHubMessage, logOutgoingHubMessage } from "@/utils/log-message";

const pybricksServiceUUID = "c5f50001-8280-46da-89f4-6d8051e4aeef";
const pybricksCharUUID = "c5f50002-8280-46da-89f4-6d8051e4aeef";

const STOP_USER_PROGRAM_COMMAND = "\x00";
const START_USER_PROGRAM_COMMAND = "\x01";
const WRITE_STDIN_COMMAND = "\x06";

const STATUS_REPORT_EVENT = "\x00";
const WRITE_STDOUT_EVENT = "\x01";

const USER_PROGRAM_RUNNING_STATUS_FLAG = 1 << 6;

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
  sendMessage: (message: string, opts?: { log: boolean }) => Promise<void>;
  startUserProgram: () => Promise<void>;
  stopUserProgram: () => Promise<void>;
}

export function useHub({ onMessage }: { onMessage: (message: string) => void }) {
  const readyRef = useRef(true);

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

  function handleMessage(data: string) {
    switch (data[0]) {
      case STATUS_REPORT_EVENT:
        handleStatusReport(data.slice(1));
        break;
      case WRITE_STDOUT_EVENT:
        const message = data.slice(1);
        logIncomingHubMessage(message);
        onMessage(message);
        if (message === "ack") readyRef.current = true;
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

  async function connect() {
    return connectBluetooth({
      primaryServiceId: pybricksServiceUUID,
      charId: pybricksCharUUID,
    });
  }

  async function sendMessage(message: string, opts = { log: true }) {
    if (!readyRef.current) {
      console.info("Not ready to send message:", message);
      return;
    }

    if (opts.log) logOutgoingHubMessage(message);

    readyRef.current = false;

    await writeBluetooth(WRITE_STDIN_COMMAND + message + "\n");
  }

  async function startUserProgram() {
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
    sendMessage,
    startUserProgram,
    stopUserProgram,
  };

  return hub;
}

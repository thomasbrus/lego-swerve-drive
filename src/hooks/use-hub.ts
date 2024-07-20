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
  sendMessage: (command: string, args: string[] | number[], opts?: { log: boolean; guarantueed: boolean }) => Promise<void>;
  startUserProgram: () => Promise<void>;
  stopUserProgram: () => Promise<void>;
}

export function useHub({ onMessage }: { onMessage: (message: string) => void }) {
  const readyRef = useRef(true);
  const commandQueueRef = useRef<string[]>([]);

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
        if (message === "ack") {
          // Deal with queued commands if ack is received until the queue is empty
          if (commandQueueRef.current.length > 0) {
            sendCommand(commandQueueRef.current.shift()!);
          } else {
            readyRef.current = true;
          }
        }
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

  async function sendMessage(
    command: string,
    args: string[] | number[],
    opts: { log: boolean; guarantueed: boolean } = { log: true, guarantueed: false }
  ) {
    opts.log = opts.log ?? true;
    opts.guarantueed = opts.guarantueed ?? false;

    // If not ready and not guaranteed delivery, drop the message.
    if (!readyRef.current && !opts.guarantueed) return;

    return await sendCommand(WRITE_STDIN_COMMAND + [command, args].join(",") + "\n", { log: opts.log });
  }

  async function sendCommand(command: string, opts: { log: boolean } = { log: true }) {
    if (opts.log) logOutgoingHubMessage(command);

    console.log("sendMessage", command, opts, readyRef);

    if (readyRef.current) {
      readyRef.current = false;
      return await writeBluetooth(command);
    } else {
      commandQueueRef.current.push(command);
    }
  }

  async function startUserProgram() {
    return await sendCommand(START_USER_PROGRAM_COMMAND);
  }

  async function stopUserProgram() {
    return await sendCommand(STOP_USER_PROGRAM_COMMAND);
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

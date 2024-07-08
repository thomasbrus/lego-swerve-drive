import { Message } from '@/message.mjs';
import { useBluetooth } from './use-bluetooth';
import { JSONBuffer } from '@/json-buffer.mjs';
import { useEffect, useState } from 'react';
import { logIncomingHubMessage, logOutgoingHubMessage } from '@/utils/log-message';

const pybricksServiceUUID = 'c5f50001-8280-46da-89f4-6d8051e4aeef';
const pybricksCharUUID = 'c5f50002-8280-46da-89f4-6d8051e4aeef';

const STOP_USER_PROGRAM_COMMAND = '\x00';
const START_USER_PROGRAM_COMMAND = '\x01';
const WRITE_STDIN_COMMAND = '\x06';

const STATUS_REPORT_EVENT = '\x00';
const WRITE_STDOUT_EVENT = '\x01';

const USER_PROGRAM_RUNNING_STATUS_FLAG = 1 << 6;

const jsonBuffer = new JSONBuffer();

export function useHub({ onMessage }) {
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
    window.jsonBuffer = jsonBuffer;
    jsonBuffer.setCallback(handleJson);
    return () => jsonBuffer.removeCallback();
  }, [onMessage]);

  function handleMessage(data) {
    switch (data[0]) {
      case STATUS_REPORT_EVENT:
        handleStatusReport(data.slice(1));
        break;
      case WRITE_STDOUT_EVENT:
        handleStdout(data.slice(1));
        break;
    }
  }

  function handleStatusReport(data) {
    const bitmask = data.charCodeAt(0);
    const isRunning = bitmask & USER_PROGRAM_RUNNING_STATUS_FLAG;

    if (isUserProgramRunning !== isRunning) {
      setIsUserProgramRunning(isRunning);
    }
  }

  function handleStdout(data) {
    jsonBuffer.feed(data);
  }

  async function connect() {
    return connectBluetooth({
      primaryServiceId: pybricksServiceUUID,
      charId: pybricksCharUUID,
    });
  }

  function handleJson(jsonString) {
    const message = Message.parse(jsonString);
    logIncomingHubMessage(message);
    onMessage(message);
  }

  async function sendCode(source, opts = { log: true }) {
    const message = new Message('sendCode', source);

    if (opts.log) logOutgoingHubMessage(message);

    await writeBluetooth(WRITE_STDIN_COMMAND + source + '\n');
  }

  async function waitForMessage(type) {
    return new Promise((resolve) => {
      const callback = (jsonString) => {
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

  return {
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
}

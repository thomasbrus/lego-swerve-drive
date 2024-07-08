import { useEffect, useState } from 'react';
const deviceInformationServiceUUID = 0x180a;

export function useBluetooth({ onMessage }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [server, setServer] = useState(null);
  const [characteristic, setCharacteristic] = useState(null);

  async function connect({ primaryServiceId, charId }) {
    let options = {
      filters: [{ services: [primaryServiceId] }],
      optionalServices: [primaryServiceId, charId, deviceInformationServiceUUID],
    };

    const device = await navigator.bluetooth.requestDevice(options);
    device.addEventListener('gattserverdisconnected', handleDisconnect);

    setIsConnecting(true);

    const server = await device.gatt.connect();
    const primaryService = await server.getPrimaryService(primaryServiceId);
    const characteristic = await primaryService.getCharacteristic(charId);

    characteristic.startNotifications();

    setIsConnecting(false);
    setIsConnected(true);
    setServer(server);
    setCharacteristic(characteristic);

    return { device, server, primaryService, characteristic };
  }

  function disconnect() {
    server.disconnect();
    setIsConnected(false);
    setServer(null);
  }

  async function write(rawMessage) {
    const encoder = new TextEncoder();
    const data = encoder.encode(rawMessage);

    return await characteristic.writeValueWithResponse(data);
  }

  useEffect(() => {
    if (!characteristic) return;

    characteristic.addEventListener('characteristicvaluechanged', handleMessage);

    return () => characteristic.removeEventListener('characteristicvaluechanged', handleMessage);
  }, [characteristic, onMessage]);

  function handleMessage(event) {
    const value = event.target.value;
    const rawMessage = new TextDecoder().decode(value);

    onMessage(rawMessage);
  }

  function handleDisconnect() {
    setIsConnected(false);
    setServer(null);
  }

  return { isConnecting, isConnected, connect, disconnect, write };
}

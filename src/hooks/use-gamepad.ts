import { useEffect, useRef, useState } from "react";

export interface Gamepad {
  isConnected: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface GamepadUpdate {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function useGamepad({ fps = 60, onUpdate }: { fps: number; onUpdate: (gamepad: GamepadUpdate) => void }) {
  const timer = useRef<number>();

  const [isConnected, setIsConnected] = useState(false);
  const [x1, setX1] = useState(0);
  const [y1, setY1] = useState(0);
  const [x2, setX2] = useState(0);
  const [y2, setY2] = useState(0);

  function handleGamepadConnected() {
    setIsConnected(true);
  }

  function handleGamepadDisconnected() {
    setIsConnected(false);
  }

  useEffect(() => {
    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected);
    };
  }, []);

  useEffect(() => {
    timer.current = window.setTimeout(updateLoop, 0);
    return () => window.clearTimeout(timer.current);
  }, [isConnected]);

  function updateLoop() {
    if (!isConnected) return;

    const gamepad = navigator.getGamepads()[0];

    if (!gamepad) return;

    const x1 = gamepad.axes[0] * 100;
    const y1 = gamepad.axes[1] * 100;
    const x2 = gamepad.axes[2] * 100;
    const y2 = gamepad.axes[3] * 100;

    setX1(x1);
    setY1(y1);
    setX2(x2);
    setY2(y2);

    onUpdate({ x1, y1, x2, y2 });

    timer.current = window.setTimeout(updateLoop, 1000 / fps);
  }

  const gamepad: Gamepad = {
    isConnected,
    x1,
    y1,
    x2,
    y2,
  };

  return gamepad;
}

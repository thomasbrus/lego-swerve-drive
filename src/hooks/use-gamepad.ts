import { useEffect, useRef, useState } from "react";

export interface Gamepad {
  isConnected: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  buttons: readonly GamepadButton[];
  calibrate: () => void;
}

export interface AxisUpdate {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function useGamepad({
  fps = 60,
  onAxisUpdate,
  onButtonPress,
}: {
  fps: number;
  onAxisUpdate: (gamepad: AxisUpdate) => void;
  onButtonPress: (index: number) => void;
}) {
  const timer = useRef<number>();
  const [isConnected, setIsConnected] = useState(false);
  const [x1, setX1] = useState(0);
  const [y1, setY1] = useState(0);
  const [x2, setX2] = useState(0);
  const [y2, setY2] = useState(0);
  const [centerX1, setCenterX1] = useState(0);
  const [centerY1, setCenterY1] = useState(0);
  const [centerX2, setCenterX2] = useState(0);
  const [centerY2, setCenterY2] = useState(0);
  const [deadzone, setDeadzone] = useState(0);
  const [buttons, setButtons] = useState<readonly GamepadButton[]>([]);

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
    timer.current = window.setTimeout(
      updateLoop,
      0,
      isConnected,
      x1,
      y1,
      x2,
      y2,
      centerX1,
      centerY1,
      centerX2,
      centerY2,
      deadzone,
      buttons
    );
    return () => window.clearTimeout(timer.current);
  }, [isConnected, x1, y1, x2, y2, centerX1, centerY1, centerX2, centerY2, deadzone, buttons]);

  function updateLoop(
    isConnected: boolean,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    centerX1: number,
    centerY1: number,
    centerX2: number,
    centerY2: number,
    deadzone: number,
    buttons: readonly GamepadButton[]
  ) {
    if (!isConnected) return;

    const gamepad = navigator.getGamepads()[0];

    if (!gamepad) return;

    function normalizeAxisValue(value: number, center: number, deadzone: number) {
      const normalizedValue = (100 * (value - center)) / (100 + (value > center ? -center : center));
      return Math.abs(normalizedValue) < deadzone ? 0 : Math.round(normalizedValue);
    }

    const newX1 = normalizeAxisValue(gamepad.axes[0] * 100, centerX1, deadzone);
    const newY1 = normalizeAxisValue(-gamepad.axes[1] * 100, centerY1, deadzone);
    const newX2 = normalizeAxisValue(gamepad.axes[2] * 100, centerX2, deadzone);
    const newY2 = normalizeAxisValue(-gamepad.axes[3] * 100, centerY2, deadzone);

    if (newX1 !== x1 || newY1 !== y1 || newX2 !== x2 || newY2 !== y2) {
      setX1(newX1);
      setY1(newY1);
      setX2(newX2);
      setY2(newY2);

      onAxisUpdate({ x1: newX1, y1: newY1, x2: newX2, y2: newY2 });
    }

    const currentButtons = gamepad.buttons;

    for (let i = 0; i < buttons.length; i++) {
      if (!buttons[i].pressed && currentButtons[i].pressed) {
        onButtonPress(i);
      }
    }

    setButtons(currentButtons);

    timer.current = window.setTimeout(
      updateLoop,
      1000 / fps,
      isConnected,
      newX1,
      newY1,
      newX2,
      newY2,
      centerX1,
      centerY1,
      centerX2,
      centerY2,
      deadzone,
      buttons
    );
  }

  function calibrate() {
    if (!isConnected) return;
    const gamepad = navigator.getGamepads()[0];

    if (!gamepad) return;

    setCenterX1(gamepad.axes[0] * 100);
    setCenterY1(-gamepad.axes[1] * 100);
    setCenterX2(gamepad.axes[2] * 100);
    setCenterY2(-gamepad.axes[3] * 100);
    setDeadzone(10);
  }

  const gamepad: Gamepad = {
    isConnected,
    x1,
    y1,
    x2,
    y2,
    buttons,
    calibrate,
  };

  return gamepad;
}

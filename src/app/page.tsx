"use client";

import Page from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader as _CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Hub, useHub } from "@/hooks/use-hub";
import { Input } from "@/components/ui/input";
import { useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useGamepad, Gamepad, AxisUpdate } from "@/hooks/use-gamepad";
import Image from "next/image";

export default function Home() {
  const frontHub = useHub({ onMessage: () => {} });
  const rearHub = useHub({ onMessage: () => {} });

  return (
    <Page title="Dashboard">
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <FrontHubCard frontHub={frontHub} />
        <RearHub rearHub={rearHub} />
        <GamepadCard frontHub={frontHub} rearHub={rearHub} />
        <TelemetryCard />
      </div>
    </Page>
  );
}

function CardHeader({
  title,
  badge,
  description,
  actions,
}: {
  title: string;
  badge?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <_CardHeader className="flex-row items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CardTitle>{title}</CardTitle>
          {badge}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </div>
      {actions}
    </_CardHeader>
  );
}

function FrontHubCard({ frontHub }: { frontHub: Hub }) {
  const fields = [
    { name: "vx", label: "Velocity x-axis", defaultValue: 0 },
    { name: "vy", label: "Velocity y-axis", defaultValue: 0 },
    { name: "omega", label: "Angular velocity", defaultValue: 0 },
  ];

  function handleSubmit(data: any) {
    const { vx, vy, omega } = data;
    frontHub.sendMessage("drive", [vx, vy, omega]);
  }

  return (
    <Card>
      <CardHeader
        title="Front Hub"
        badge={<HubBadge hub={frontHub} />}
        description="Hub that controls the front left and right swerve modules."
        actions={<HubActions hub={frontHub} />}
      />
      <CardContent>
        <HubForm hub={frontHub} fields={fields} onSubmit={handleSubmit} />
      </CardContent>
    </Card>
  );
}

function RearHub({ rearHub }: { rearHub: Hub }) {
  const fields = [
    { name: "vx", label: "Velocity x-axis", defaultValue: 0 },
    { name: "vy", label: "Velocity y-axis", defaultValue: 0 },
    { name: "omega", label: "Angular velocity", defaultValue: 0 },
  ];

  function handleSubmit(data: any) {
    const { vx, vy, omega } = data;
    rearHub.sendMessage("drive", [vx, vy, omega]);
  }

  return (
    <Card>
      <CardHeader
        title="Rear Hub"
        badge={<HubBadge hub={rearHub} />}
        description="Hub that controls the rear left and right swerve modules."
        actions={<HubActions hub={rearHub} />}
      />
      <CardContent>
        <HubForm hub={rearHub} fields={fields} onSubmit={handleSubmit} />
      </CardContent>
    </Card>
  );
}

function HubBadge({ hub }: { hub: Hub }) {
  return (
    <Badge variant={hub.isConnected ? "default" : "outline"}>
      {hub.isConnected ? (hub.isUserProgramRunning ? "Running" : "Connected") : "Not connected"}
    </Badge>
  );
}

function HubActions({ hub }: { hub: Hub }) {
  return (
    <div className="flex gap-2">
      {!hub.isConnected && (
        <Button variant="secondary" onClick={() => hub.connect()} disabled={hub.isConnecting}>
          Connect
        </Button>
      )}
      {hub.isConnected && (
        <Button variant="outline" onClick={() => hub.disconnect()}>
          Disconnect
        </Button>
      )}
      {hub.isConnected && !hub.isUserProgramRunning && (
        <Button variant="secondary" onClick={() => hub.startUserProgram()}>
          Start Program
        </Button>
      )}
      {hub.isConnected && hub.isUserProgramRunning && (
        <Button variant="secondary" onClick={() => hub.stopUserProgram()}>
          Stop Program
        </Button>
      )}
    </div>
  );
}

export function HubForm({
  hub,
  fields,
  onSubmit,
}: {
  hub: Hub;
  fields: { name: string; label: string }[];
  onSubmit: (data: z.infer<typeof FormSchema>) => void;
}) {
  const FormSchema = z.object(fields.reduce((acc, { name }) => ({ ...acc, [name]: z.string() }), {}));

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: fields.reduce((acc, { name }) => ({ ...acc, [name]: "0" }), {}),
  });

  const isDisabled = !hub.isUserProgramRunning;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 grid-cols-2 bg-muted/50 rounded-md p-4">
          {fields.map(({ name, label }) => (
            <FormField
              key={name}
              type="number"
              control={form.control}
              // @ts-ignore
              name={name}
              disabled={isDisabled}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <div className="col-span-2">
            <Button type="submit" disabled={isDisabled}>
              Apply
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

function GamepadCard({ frontHub, rearHub }: { frontHub: Hub; rearHub: Hub }) {
  const gamepad = useGamepad({ fps: 60, onAxisUpdate: handleAxisUpdate, onButtonPress: handleButtonPress });

  function handleAxisUpdate(axisUpdate: AxisUpdate) {
    let { x1, y1, x2, y2: _ } = axisUpdate;

    // Scale angular velocity joystick down a bit
    x2 *= 100 / Math.sqrt(Math.pow(100, 2) + Math.pow(100, 2));

    frontHub.sendMessage("drive", [x1, y1, x2]);
    rearHub.sendMessage("drive", [x1, y1, x2]);
  }

  function handleButtonPress(index: number) {
    if (index === 1) {
      frontHub.stopUserProgram();
      rearHub.stopUserProgram();
    }
  }

  function formatAxisValue(value: number) {
    return `${Math.round(value)}%`;
  }

  return (
    <Card>
      <CardHeader
        title="Gamepad"
        description="Connect controller via Bluetooth, press calibrate to center."
        badge={<GamepadBadge gamepad={gamepad} />}
        actions={<GamepadActions gamepad={gamepad} />}
      />
      <CardContent>
        <div className="bg-muted/50 rounded-md pt-8 px-4 flex flex-col items-center overflow-clip relative">
          <div className="h-[12rem] w-[32rem] relative">
            <Image
              src="/images/xbox-controller.png"
              fill
              alt="XBOX Controler"
              className="absolute inset-0 object-cover object-top mix-blend-luminosity opacity-75 drop-shadow-[0_0_24px_hsl(223deg_84%_5%_/_50%)]"
            />
            {gamepad.isConnected && (
              <svg viewBox="0 0 32 12" xmlns="http://www.w3.org/2000/svg" className="inset-0 absolute">
                <GamepadThumbstick x={gamepad.x1} y={gamepad.y1} transform="translate(-5.9 -0.6) scale(0.2)" />
                <GamepadThumbstick x={gamepad.x2} y={gamepad.y2} transform="translate(3.04 2.82) scale(0.2)" />
              </svg>
            )}
          </div>

          {gamepad.isConnected && (
            <>
              <div className="absolute left-4 top-4 space-y-1 text-left">
                <div className="text-muted-foreground tracking-tight text-sm font-medium">Left stick</div>
                <div className="text-xl font-bold drop-shadow-[0_0_8px_hsl(223deg_84%_5%_/_100%)]">
                  ({formatAxisValue(gamepad.x1)}, {formatAxisValue(gamepad.y1)})
                </div>
              </div>
              <div className="absolute right-4 top-4 space-y-1 text-right">
                <div className="text-muted-foreground tracking-tight text-sm font-medium">Right stick</div>
                <div className="text-xl font-bold drop-shadow-[0_0_8px_hsl(223deg_84%_5%_/_100%)]">
                  ({formatAxisValue(gamepad.x2)}, {formatAxisValue(gamepad.y2)})
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function GamepadThumbstick({ x, y, transform }: { x: number; y: number; transform: string }) {
  const cx = 16 + (x / 100) * 4;
  const cy = 6 + (-y / 100) * 4;

  return (
    <g transform={transform} style={{ transformOrigin: "50% 50%" }}>
      <line x1={cx} y1="2" x2={cx} y2="10" stroke="white" strokeWidth="0.2" strokeLinecap="round" opacity={0.5} />
      <line x1="12" y1={cy} x2="20" y2={cy} stroke="white" strokeWidth="0.2" strokeLinecap="round" opacity={0.5} />
      <circle cx={cx} cy={cy} r="2" stroke="white" strokeWidth="0.2" fill="transparent" opacity={0.75} />
      <circle cx={cx} cy={cy} r="1" fill="white" opacity={0.75} />
    </g>
  );
}

function GamepadBadge({ gamepad }: { gamepad: Gamepad }) {
  return <Badge variant={gamepad.isConnected ? "default" : "outline"}>{gamepad.isConnected ? "Connected" : "Not connected"}</Badge>;
}

function GamepadActions({ gamepad }: { gamepad: Gamepad }) {
  function handleCalibrateClick() {
    gamepad.calibrate();
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={handleCalibrateClick} disabled={!gamepad.isConnected}>
        Calibrate
      </Button>
    </div>
  );
}

function TelemetryCard() {
  return (
    <Card>
      <CardHeader title="Telemetry" description="Real-time data from the robot." />
      <CardContent>
        <div className="bg-muted/50 rounded-md p-4 flex flex-col items-center justify-center flex-grow h-[560px]">
          <Image
            src="/images/swerve-drive.png"
            width={320}
            height={320}
            alt="LEGO Swerve Drive"
            className="mix-blend-luminosity opacity-75 drop-shadow-[0_0_24px_hsl(223deg_84%_5%_/_50%)] rotate-45"
          />
        </div>
      </CardContent>
    </Card>
  );
}

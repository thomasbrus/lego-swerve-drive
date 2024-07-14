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
import { useGamepad, Gamepad, GamepadUpdate } from "@/hooks/use-gamepad";

const DEADZONE = 15;

export default function Home() {
  const frontHub = useHub({ onMessage: () => {} });
  const rearHub = useHub({ onMessage: () => {} });

  return (
    <Page title="Dashboard">
      <div className="grid gap-4 grid-cols-2">
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
    frontHub.sendMessage([vx, vy, omega].join(","));
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
    rearHub.sendMessage([vx, vy, omega].join(","));
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
  const cachedHandleUpdate = useCallback(handleUpdate, [frontHub.isUserProgramRunning, rearHub.isUserProgramRunning]);
  const gamepad = useGamepad({ fps: 60, onUpdate: cachedHandleUpdate });

  function handleUpdate(gamepadUpdate: GamepadUpdate) {
    let { x1, y1, x2, y2: _ } = gamepadUpdate;

    // Scale angular velocity joystick down a bit
    x2 *= 100 / Math.sqrt(Math.pow(100, 2) + Math.pow(100, 2));

    if (frontHub.isUserProgramRunning) frontHub.sendMessage([x1, y1, x2].join(","));
    if (rearHub.isUserProgramRunning) rearHub.sendMessage([x1, y1, x2].join(","));
  }

  function formatAxisValue(value: number) {
    return `${Math.round(value)}%`;
  }

  return (
    <Card>
      <CardHeader
        title="Gamepad"
        description="Connect any controller via Bluetooth."
        badge={<GamepadBadge gamepad={gamepad} />}
        actions={<GamepadActions gamepad={gamepad} />}
      />
      <CardContent>
        <div className="grid gap-6 grid-cols-2 bg-muted/50 rounded-md p-4">
          <div className="space-y-2">
            <div className="tracking-tight text-sm font-medium">Left x-axis</div>
            <div className="text-2xl font-bold">{formatAxisValue(gamepad.x1)}</div>
          </div>
          <div className="space-y-2">
            <div className="tracking-tight text-sm font-medium">Left y-axis</div>
            <div className="text-2xl font-bold">{formatAxisValue(gamepad.y1)}</div>
          </div>
          <div className="space-y-2">
            <div className="tracking-tight text-sm font-medium">Right x-axis</div>
            <div className="text-2xl font-bold">{formatAxisValue(gamepad.x2)}</div>
          </div>
          <div className="space-y-2">
            <div className="tracking-tight text-sm font-medium">Right y-axis</div>
            <div className="text-2xl font-bold">{formatAxisValue(gamepad.y2)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
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
      <CardHeader title="Telemetry" />
      <CardContent>...</CardContent>
    </Card>
  );
}

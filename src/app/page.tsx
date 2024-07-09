"use client";

import Page from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader as _CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hub, useHub } from "@/hooks/use-hub";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useGamepad, Gamepad, GamepadUpdate } from "@/hooks/use-gamepad";
import { normalizeSwerveSpeed, swerveDrive } from "@/utils/swerve";
import { Vector2 } from "@/utils/vector";

export default function Home() {
  const steerHub = useHub({ onMessage: () => {} });
  const driveHub = useHub({ onMessage: () => {} });

  return (
    <Page title="Dashboard">
      <div className="grid gap-4 grid-cols-2">
        <SteerHubCard steerHub={steerHub} />
        <DriveHubCard driveHub={driveHub} />
        <GamepadCard steerHub={steerHub} driveHub={driveHub} />
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

function SteerHubCard({ steerHub }: { steerHub: Hub }) {
  const fields = [
    { name: "frontLeftAngle", label: "Front Left Angle", defaultValue: 0 },
    { name: "frontRighAngle", label: "Front Right Angle", defaultValue: 0 },
    { name: "rearLeftAngle", label: "Rear Left Angle", defaultValue: 0 },
    { name: "rearRightAngle", label: "Rear Right Angle", defaultValue: 0 },
  ];

  function handleSubmit(data: any) {
    const { frontLeftAngle, frontRighAngle, rearLeftAngle, rearRightAngle } = data;
    steerHub.sendMessage([frontLeftAngle, frontRighAngle, rearLeftAngle, rearRightAngle].join(","));
  }

  return (
    <Card>
      <CardHeader
        title="Steer Hub"
        badge={<HubBadge hub={steerHub} />}
        description="The hub that controls the swerve drive wheel angles."
        actions={<HubActions hub={steerHub} />}
      />
      <CardContent>
        <HubForm hub={steerHub} fields={fields} onSubmit={handleSubmit} />
      </CardContent>
    </Card>
  );
}

function DriveHubCard({ driveHub }: { driveHub: Hub }) {
  const fields = [
    { name: "frontLeftSpeed", label: "Front Left Speed", defaultValue: 0 },
    { name: "frontRighSpeed", label: "Front Right Speed", defaultValue: 0 },
    { name: "rearLeftSpeed", label: "Rear Left Speed", defaultValue: 0 },
    { name: "rearRightSpeed", label: "Rear Right Speed", defaultValue: 0 },
  ];

  function handleSubmit(data: any) {
    const { frontLeftSpeed, frontRighSpeed, rearLeftSpeed, rearRightSpeed } = data;
    driveHub.sendMessage([frontLeftSpeed, frontRighSpeed, rearLeftSpeed, rearRightSpeed].join(","));
  }

  return (
    <Card>
      <CardHeader
        title="Drive Hub"
        badge={<HubBadge hub={driveHub} />}
        description="The hub that controls the swerve drive wheel speeds."
        actions={<HubActions hub={driveHub} />}
      />
      <CardContent>
        <HubForm hub={driveHub} fields={fields} onSubmit={handleSubmit} />
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

function GamepadCard({ steerHub, driveHub }: { steerHub: Hub; driveHub: Hub }) {
  const gamepad = useGamepad({ fps: 60, onUpdate: handleUpdate });

  function handleUpdate(gamepadUpdate: GamepadUpdate) {
    const { x1, y1, x2, y2 } = gamepadUpdate;

    const wheelPositions = [
      new Vector2(1, 1), // Left front
      new Vector2(-1, 1), // Right front
      new Vector2(1, -1), // Left back
      new Vector2(-1, -1), // Right back
    ];

    const swerveVectors = wheelPositions.map((wheelPosition) => swerveDrive(x1, y1, x2, wheelPosition.x, wheelPosition.y));
    const swerveSpeeds = swerveVectors.map((vector) => Math.round(normalizeSwerveSpeed(new Vector2(vector.x, vector.y).length())));
    const swerveAngles = swerveVectors.map((vector) => Math.round(new Vector2(vector.x, vector.y).angle()));

    if (steerHub.isUserProgramRunning) steerHub.sendMessage(swerveAngles.join(","));
    if (driveHub.isUserProgramRunning) driveHub.sendMessage(swerveSpeeds.join(","));
  }

  function formAxisValue(value: number) {
    return `${Math.round(value)}%`;
  }

  return (
    <Card>
      <CardHeader title="Gamepad" badge={<GamepadBadge gamepad={gamepad} />} />
      <CardContent>
        <div className="grid gap-6 grid-cols-2 bg-muted/50 rounded-md p-4">
          <div className="space-y-2">
            <div className="tracking-tight text-sm font-medium">Left joystick x-axis</div>
            <div className="text-2xl font-bold">{formAxisValue(gamepad.x1)}</div>
          </div>
          <div className="space-y-2">
            <div className="tracking-tight text-sm font-medium">Left joystick y-axis</div>
            <div className="text-2xl font-bold">{formAxisValue(gamepad.y1)}</div>
          </div>
          <div className="space-y-2">
            <div className="tracking-tight text-sm font-medium">Right joystick x-axis</div>
            <div className="text-2xl font-bold">{formAxisValue(gamepad.x2)}</div>
          </div>
          <div className="space-y-2">
            <div className="tracking-tight text-sm font-medium">Right joystick y-axis</div>
            <div className="text-2xl font-bold">{formAxisValue(gamepad.y2)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GamepadBadge({ gamepad }: { gamepad: Gamepad }) {
  return <Badge variant={gamepad.isConnected ? "default" : "outline"}>{gamepad.isConnected ? "Connected" : "Not connected"}</Badge>;
}

function MessagesCard({ hubs: { steerHub, driveHub } }: { hubs: { steerHub: Hub; driveHub: Hub } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [tabsValue, setTabsValue] = useState<string>("steer");

  function handleSendMessage(message: string) {
    const hubs = { steer: steerHub, drive: driveHub };
    hubs[tabsValue as "steer" | "drive"].sendMessage(message);
    setMessages([...messages, { id: "1", timestamp: Date.now(), source: tabsValue, content: message }]);
    setMessage("");
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setMessage(event.target.value);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleSendMessage(message);
    } else if (event.key === "ArrowUp" && messages.length > 0) {
      setMessage(messages[messages.length - 1].content);
    }
  }

  function handleSendButtonClick() {
    handleSendMessage(message);
  }

  return (
    <Card>
      <CardHeader title="Messages" />
      <CardContent>
        <Tabs value={tabsValue} onValueChange={setTabsValue}>
          <TabsList className="grid w-full grid-cols-2 mt-2 mb-6">
            <TabsTrigger value="steer">Steer Hub</TabsTrigger>
            <TabsTrigger value="drive">Drive Hub</TabsTrigger>
          </TabsList>
          <MessagesCardTabsContent value="steer" />
          <MessagesCardTabsContent value="drive" />
        </Tabs>
      </CardContent>
      <CardFooter className="flex gap-4 justify-between">
        <Input value={message} placeholder="Type your message here." onChange={handleInputChange} onKeyDown={handleInputKeyDown} />
        <Button variant="secondary" onClick={handleSendButtonClick}>
          Send
        </Button>
      </CardFooter>
    </Card>
  );
}

function MessagesCardTabsContent({ value }: { value: string }) {
  return (
    <TabsContent value={value}>
      <DataTableDemo value={value} />
    </TabsContent>
  );
}

const data: Message[] = [];

export type Message = {
  id: string;
  timestamp: number;
  source: string;
  content: string;
};

export const columns: ColumnDef<Message>[] = [
  {
    id: "select",
    header: "Source",
    cell: ({ row }) => row.getValue("source"),
  },
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ row }) => row.getValue("timestamp"),
  },
  {
    accessorKey: "contetn",
    header: "Content",
    cell: ({ row }) => row.getValue("content"),
  },
];

export function DataTableDemo({ value }: { value: string }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No messages for {value} hub.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

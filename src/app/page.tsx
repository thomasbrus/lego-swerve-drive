"use client";

import Page from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader as _CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hub, useHub } from "@/hooks/use-hub";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";
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
        description="The hub that controls the front left and right swerve modules."
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
        description="The hub that controls the rear left and right swerve modules."
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

    if (Math.abs(x1) < DEADZONE) x1 = 0;
    if (Math.abs(y1) < DEADZONE) y1 = 0;
    if (Math.abs(x2) < DEADZONE) x2 = 0;

    if (frontHub.isUserProgramRunning) frontHub.sendMessage([x1, y1, x2].join(","));
    if (rearHub.isUserProgramRunning) rearHub.sendMessage([x1, y1, x2].join(","));
  }

  function formatAxisValue(value: number) {
    return `${Math.round(value)}%`;
  }

  return (
    <Card>
      <CardHeader title="Gamepad" badge={<GamepadBadge gamepad={gamepad} />} />
      <CardContent>
        <div className="grid gap-6 grid-cols-2 bg-muted/50 rounded-md p-4">
          <div className="space-y-2">
            <div className="tracking-tight text-sm font-medium">Left joystick x-axis</div>
            <div className="text-2xl font-bold">{formatAxisValue(gamepad.x1)}</div>
          </div>
          <div className="space-y-2">
            <div className="tracking-tight text-sm font-medium">Left joystick y-axis</div>
            <div className="text-2xl font-bold">{formatAxisValue(gamepad.y1)}</div>
          </div>
          <div className="space-y-2">
            <div className="tracking-tight text-sm font-medium">Right joystick x-axis</div>
            <div className="text-2xl font-bold">{formatAxisValue(gamepad.x2)}</div>
          </div>
          <div className="space-y-2">
            <div className="tracking-tight text-sm font-medium">Right joystick y-axis</div>
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

function MessagesCard({ hubs: { frontHub, rearHub } }: { hubs: { frontHub: Hub; rearHub: Hub } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [tabsValue, setTabsValue] = useState<string>("steer");

  function handleSendMessage(message: string) {
    const hubs = { steer: frontHub, drive: rearHub };
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
            <TabsTrigger value="steer">Front Hub</TabsTrigger>
            <TabsTrigger value="drive">Rear Hub</TabsTrigger>
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

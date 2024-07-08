"use client";

import Page from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader as _CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useDashboard from "@/hooks/use-dashboard";
import { Hub } from "@/hooks/use-hub";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <Page title="Dashboard">
      <div className="grid gap-4 grid-cols-2">
        <HubsCard />
        <GamepadCard />
        <MessagesCard />
      </div>
    </Page>
  );
}

function CardHeader({ title }: { title: string }) {
  return (
    <_CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </_CardHeader>
  );
}

function HubsCard() {
  const { steerHub, driveHub } = useDashboard();

  return (
    <Card>
      <CardHeader title="Hubs" />
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <HubTableRow name="Steer Hub" hub={steerHub} onClickConnectButton={() => steerHub.connect()} />
            <HubTableRow name="Drive Hub" hub={driveHub} onClickConnectButton={() => driveHub.connect()} />
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function HubTableRow({ name, hub, onClickConnectButton }: { name: string; hub: Hub; onClickConnectButton?: () => void }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell>
        <Badge variant={hub.isConnected ? "default" : "outline"}>
          {hub.isConnected ? (hub.isUserProgramRunning ? "Running" : "Connected") : "Not connected"}
        </Badge>
      </TableCell>
      <TableCell>
        {!hub.isConnected && (
          <Button variant="secondary" onClick={onClickConnectButton} disabled={hub.isConnecting}>
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
      </TableCell>
    </TableRow>
  );
}

function GamepadCard() {
  return (
    <Card>
      <CardHeader title="Gamepad" />
      <CardContent>...</CardContent>
    </Card>
  );
}

function MessagesCard() {
  return (
    <Card>
      <CardHeader title="Messages" />
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody></TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex gap-4 justify-between">
        <Input placeholder="Type your message here." />
        <Button variant="secondary">Send</Button>
      </CardFooter>
    </Card>
  );
}

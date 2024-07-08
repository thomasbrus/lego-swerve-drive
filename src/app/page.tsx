"use client";

import Page from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useDashboard from "@/hooks/use-dashboard";
import { Hub } from "@/hooks/use-hub";

export default function Home() {
  return (
    <Page title="Dashboard">
      <div className="grid gap-4 grid-cols-2">
        <HubsCard />
        <GamepadCard />
      </div>
    </Page>
  );
}

function HubsCard() {
  const { steerHub, driveHub } = useDashboard();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Hubs</CardTitle>
      </CardHeader>
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
        <Badge variant={hub.isConnected ? "default" : "outline"}>{hub.isConnected ? "Connected" : "Not connected"}</Badge>
      </TableCell>
      <TableCell>
        {!hub.isConnected && (
          <Button variant="secondary" onClick={onClickConnectButton} disabled={hub.isConnecting}>
            Connect
          </Button>
        )}
        {hub.isConnected && (
          <Button variant="destructive" onClick={() => hub.disconnect()}>
            Disconnect
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

function GamepadCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Gamepad</CardTitle>
      </CardHeader>
      <CardContent>...</CardContent>
    </Card>
  );
}

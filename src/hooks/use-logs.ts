import { useState } from "react";

export function useLogs() {
  const [logs, setLogs] = useState<string[]>([]);

  return { logs };
}

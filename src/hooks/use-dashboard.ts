import { useHub } from "./use-hub";

export default function useDashboard() {
  const steerHub = useHub({ onMessage: () => {} });
  const driveHub = useHub({ onMessage: () => {} });

  return { steerHub, driveHub };
}

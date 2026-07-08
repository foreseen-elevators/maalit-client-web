import { ElevatorTile } from "../ElevatorTile/ElevatorTile";
import { fileKeyForElevator } from "../../lib/api/allConfigScreen";
import styles from "./ElevatorGrid.module.css";

interface ElevatorGridProps {
  clientId: string;
  addressId: string;
  elevatorCount: number;
}

export function ElevatorGrid({
  clientId,
  addressId,
  elevatorCount,
}: ElevatorGridProps) {
  const indices = Array.from({ length: elevatorCount }, (_, i) => i);

  return (
    <div className={styles.grid} data-count={elevatorCount}>
      {indices.map((index) => (
        <ElevatorTile
          key={index}
          clientId={clientId}
          addressId={addressId}
          elevatorIndex={index}
          fileKey={fileKeyForElevator(index)}
        />
      ))}
    </div>
  );
}

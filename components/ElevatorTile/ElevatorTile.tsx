"use client";

import { useElevatorSchedule } from "../../hooks/useElevatorSchedule";
import { useElevatorReferenceEpoch } from "../../hooks/useElevatorReferenceEpoch";
import { useElevatorClock } from "../../hooks/useElevatorClock";
import { DirectionArrow } from "../DirectionArrow/DirectionArrow";
import styles from "./ElevatorTile.module.css";

interface ElevatorTileProps {
  clientId: string;
  addressId: string;
  elevatorIndex: number;
  fileKey: "file1" | "file2" | "file3";
}

// Owns its own data lifecycle end-to-end (schedule fetch, 2-minute epoch
// poll, 1-second tick) independently of any sibling tiles, so one
// elevator's update cycle never re-renders the others.
export function ElevatorTile({
  clientId,
  addressId,
  elevatorIndex,
  fileKey,
}: ElevatorTileProps) {
  const { schedule } = useElevatorSchedule(clientId, addressId, fileKey);
  const { referenceEpoch, isStale } = useElevatorReferenceEpoch(
    addressId,
    elevatorIndex,
  );
  const display = useElevatorClock(schedule, referenceEpoch);

  return (
    <div className={styles.tile}>
      <div className={styles.arrowRow}>
        <DirectionArrow direction={display.direction} />
      </div>
      <div className={`${styles.floor} ${display.valid ? "" : styles.invalid}`}>
        {display.displayText}
      </div>
      <div className={styles.footer}>
        <span className={styles.elevatorLabel}>
          מעלית {elevatorIndex + 1}
        </span>
        {isStale && (
          <span className={styles.staleDot} title="הנתונים עשויים להיות לא מעודכנים" />
        )}
      </div>
    </div>
  );
}

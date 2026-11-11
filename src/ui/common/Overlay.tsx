import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Overlay.module.css";

interface Props {
  label: string;
  onClose: () => void;
  /** Class for the parchment sheet, to set its size and layout. */
  sheetClassName?: string;
  children: ReactNode;
}

/** A modal parchment sheet over the world. Focuses its close button on open. */
export function Overlay({ label, onClose, sheetClassName = "", children }: Props) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => close.current?.focus(), []);
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`parchment ${styles.sheet} ${sheetClassName}`}>
        <button ref={close} className={`close-btn ${styles.close}`} onClick={onClose} aria-label="Close">&times;</button>
        {children}
      </div>
    </div>
  );
}

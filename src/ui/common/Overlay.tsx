import { useEffect, useRef, type ReactNode } from "react";
import type { Side } from "@/content/types";
import styles from "./Overlay.module.css";

interface Props {
  label: string;
  onClose: () => void;
  /** "personal" is a parchment sheet; "pro" is a clean modern card. */
  theme?: Side;
  /** Class for the sheet, to set its size and layout. */
  sheetClassName?: string;
  children: ReactNode;
}

/** A modal sheet over the world. Focuses its close button on open. */
export function Overlay({ label, onClose, theme = "personal", sheetClassName = "", children }: Props) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => close.current?.focus(), []);
  const look = theme === "pro" ? styles.modern : "parchment";
  return (
    <div className={`${styles.backdrop} ${theme === "pro" ? styles.lightBackdrop : ""}`} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${look} ${styles.sheet} ${sheetClassName}`}>
        <button ref={close} className={`close-btn ${styles.close}`} onClick={onClose} aria-label="Close">&times;</button>
        {children}
      </div>
    </div>
  );
}

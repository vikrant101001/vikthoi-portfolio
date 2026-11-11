import { Link } from "react-router";
import styles from "./Hotbar.module.css";

export function Hotbar() {
  return (
    <div className={styles.hotbar}>
      <Link to="/map" className={styles.map}><kbd>M</kbd> World map</Link>
      <span className={styles.hint}><kbd>WASD</kbd> Walk</span>
      <span className={styles.hint}><kbd>Shift</kbd> Run</span>
    </div>
  );
}

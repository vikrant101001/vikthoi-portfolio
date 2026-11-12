import { useEffect, type ReactNode } from "react";
import { Link } from "react-router";
import { profile } from "@/content/profile";
import type { Side } from "@/content/types";
import styles from "./PageShell.module.css";

interface Props {
  title: string;
  back?: { to: string; label: string };
  /** "personal" is parchment on dark; "pro" is a clean modern page. */
  theme?: Side;
  wide?: boolean;
  children: ReactNode;
}

/** A normal scrolling page outside the world: project write-ups, games, errors. */
export function PageShell({ title, back = { to: "/", label: "Back to the world" }, theme = "personal", wide, children }: Props) {
  useEffect(() => {
    document.body.classList.add("scrollable");
    window.scrollTo(0, 0);
    return () => document.body.classList.remove("scrollable");
  }, []);
  const pro = theme === "pro";
  return (
    <div className={`${styles.page} ${pro ? styles.pro : ""}`}>
      <title>{`${title} · ${profile.name}`}</title>
      <nav className={styles.nav}>
        <Link to={back.to} className={styles.back}>&larr; {back.label}</Link>
        <Link to="/" className={styles.home}>{profile.name}</Link>
      </nav>
      <main className={`${pro ? styles.card : "parchment"} ${styles.sheet} ${wide ? styles.wide : ""}`}>{children}</main>
    </div>
  );
}

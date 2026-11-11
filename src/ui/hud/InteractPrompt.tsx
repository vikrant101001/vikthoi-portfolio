import { useNavigate } from "react-router";
import { useGame } from "@/game/store";
import { placeById } from "@/game/places";
import styles from "./InteractPrompt.module.css";

export function InteractPrompt() {
  const near = useGame((s) => s.near);
  const navigate = useNavigate();
  const place = near ? placeById(near) : undefined;
  if (!place) return null;
  const { landmark, section } = place;
  const verb = landmark.secret ? "Touch" : landmark.sprite === "brazier" ? "Rest at" : "Enter";
  return (
    <button className={styles.prompt} onClick={() => navigate(`/${section.slug}`)}>
      <kbd>E</kbd>
      <span>{verb} {section.title}</span>
    </button>
  );
}

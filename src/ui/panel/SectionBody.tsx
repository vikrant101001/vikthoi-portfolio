/* Picks the layout for a section by its type. To add a new section type,
   add it to `Section` in src/content/types.ts and a case here; TypeScript
   reports an error until every type is handled. */
import type { Section } from "@/content/types";
import { Paragraphs } from "./sections/Paragraphs";
import { Letter } from "./sections/Letter";
import { CareerStop } from "./sections/CareerStop";
import { ProjectStop } from "./sections/ProjectStop";
import { SkillStop } from "./sections/SkillStop";
import { GameStop } from "./sections/GameStop";
import { FunStop } from "./sections/FunStop";

export function SectionBody({ section }: { section: Section }) {
  switch (section.type) {
    case "intro": return <Paragraphs body={section.body} />;
    case "letter": return <Letter section={section} />;
    case "career": return <CareerStop section={section} />;
    case "project": return <ProjectStop section={section} />;
    case "skills": return <SkillStop section={section} />;
    case "game": return <GameStop section={section} />;
    case "fun": return <FunStop section={section} />;
    default: return assertNever(section);
  }
}

function assertNever(x: never): never {
  throw new Error(`Unhandled section type: ${JSON.stringify(x)}`);
}

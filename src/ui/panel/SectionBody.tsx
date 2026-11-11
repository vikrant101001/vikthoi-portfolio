/* Picks the layout for a section by its type. To add a new section type,
   add it to `Section` in src/content/types.ts and a case here; TypeScript
   reports an error until every type is handled. */
import type { Section } from "@/content/types";
import { Paragraphs } from "./sections/Paragraphs";
import { CharacterSheet } from "./sections/CharacterSheet";
import { SkillBars } from "./sections/SkillBars";
import { QuestBoard } from "./sections/QuestBoard";
import { Chronicle } from "./sections/Chronicle";
import { Tales } from "./sections/Tales";
import { Ravens } from "./sections/Ravens";

export function SectionBody({ section }: { section: Section }) {
  switch (section.type) {
    case "intro": return <Paragraphs body={section.body} />;
    case "character": return <CharacterSheet section={section} />;
    case "skills": return <SkillBars section={section} />;
    case "projects": return <QuestBoard />;
    case "timeline": return <Chronicle section={section} />;
    case "tales": return <Tales section={section} />;
    case "contact": return <Ravens section={section} />;
    default: return assertNever(section);
  }
}

function assertNever(x: never): never {
  throw new Error(`Unhandled section type: ${JSON.stringify(x)}`);
}

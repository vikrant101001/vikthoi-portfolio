export function Paragraphs({ body }: { body: string[] }) {
  return <>{body.map((p, i) => <p key={i}>{p}</p>)}</>;
}

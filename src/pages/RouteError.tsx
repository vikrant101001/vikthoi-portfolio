import { isRouteErrorResponse, useRouteError } from "react-router";
import { PageShell } from "./PageShell";
import { NotFound } from "./NotFound";

/** Shown when a page throws, so one broken page never blanks the whole site. */
export function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  if (import.meta.env.DEV) console.error(error);
  return (
    <PageShell title="Something broke">
      <small className="kicker">An ill omen</small>
      <h1>Something broke</h1>
      <p>This page hit an error. Reloading usually fixes it.</p>
      {import.meta.env.DEV && <pre style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>{String(error instanceof Error ? error.stack : error)}</pre>}
    </PageShell>
  );
}

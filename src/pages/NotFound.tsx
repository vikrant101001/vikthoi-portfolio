import { Link } from "react-router";
import { PageShell } from "./PageShell";

export function NotFound() {
  return (
    <PageShell title="Uncharted">
      <small className="kicker">404</small>
      <h1>These lands are uncharted</h1>
      <p>No road leads here. The page may have moved, or the link may be mistyped.</p>
      <p><Link to="/">Return to the vale</Link> or <Link to="/map">open the map</Link>.</p>
    </PageShell>
  );
}

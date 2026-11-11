import { useEffect } from "react";
import { Navigate } from "react-router";

export function Redirect({ to }: { to: string }) {
  const external = /^https?:\/\//.test(to);
  useEffect(() => {
    if (external) window.location.replace(to);
  }, [external, to]);
  return external ? null : <Navigate to={to} replace />;
}

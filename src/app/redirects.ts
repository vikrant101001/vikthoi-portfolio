/* Short or old URLs that should land somewhere else. `to` can be a path in
   this site or a full https:// address. */
export const redirects: { from: string; to: string }[] = [
  { from: "/home", to: "/" },
  { from: "/about-me", to: "/about" },
  { from: "/resume", to: "/contact" },
  { from: "/cv", to: "/contact" },
];

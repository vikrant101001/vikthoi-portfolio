/* Short or old URLs that should land somewhere else. `to` can be a path in
   this site or a full https:// address. */
export const redirects: { from: string; to: string }[] = [
  { from: "/home", to: "/" },
  { from: "/about", to: "/letter" },
  { from: "/contact", to: "/letter" },
  { from: "/career", to: "/career-1" },
  { from: "/projects", to: "/project-1" },
  { from: "/skills", to: "/skills-1" },
  { from: "/games", to: "/games-1" },
  { from: "/fun", to: "/fun-1" },
];

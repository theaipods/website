export const siteBrand = {
  name: "TheAIPods",
  tagline: "AI work, coordinated around your business.",
  logo: "/brand/official-logo.jpg",
  demoPath: "/book-demo",
} as const;

const publicSitePaths = [
  "/", "/product", "/solutions", "/docs", "/integrations", "/about",
  "/events", "/book-demo", "/login", "/reset-password", "/news", "/investors", "/agents", "/showreel",
] as const;

export function isPublicSitePath(pathname: string): boolean {
  return publicSitePaths.some(path => path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`));
}

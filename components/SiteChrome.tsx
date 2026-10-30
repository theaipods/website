"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { ProductMenu } from "@/components/ProductMenu";
import { SolutionsMenu } from "@/components/SolutionsMenu";
import { isPublicSitePath, siteBrand } from "@/lib/site-brand";

function openDemoAtTop(event: { preventDefault: () => void }) {
  if (window.location.pathname !== siteBrand.demoPath) return;
  event.preventDefault();
  window.history.replaceState(window.history.state, "", siteBrand.demoPath);
  window.scrollTo({ top: 0, behavior: "instant" });
}

function Brand({ footer = false }: { footer?: boolean }) {
  return <Link href="/" className={`site-brand${footer ? " site-brand-footer" : ""}`} aria-label={`${siteBrand.name} home`}>
    <Image src={footer ? siteBrand.logo : "/brand/header-logo-transparent.png"} width={footer ? 347 : 2169} height={footer ? 58 : 725} alt={siteBrand.name} priority={!footer} />
  </Link>;
}

function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMobileOpen(false), [pathname]);
  const active = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  const close = () => setMobileOpen(false);
  return <header className="site-header">
    <div className="site-header-inner">
      <Brand />
      <nav id="site-navigation" className={`site-navigation${mobileOpen ? " is-open" : ""}`} aria-label="Main navigation">
        <ProductMenu current={active("/product")} />
        <SolutionsMenu current={active("/solutions")} />
        <Link href="/docs" aria-current={active("/docs") ? "page" : undefined} onClick={close}>Docs</Link>
        <Link href="/integrations" aria-current={active("/integrations") ? "page" : undefined} onClick={close}>Integrations</Link>
        <Link href="/events" aria-current={active("/events") ? "page" : undefined} onClick={close}>Events</Link>
        <Link href="/about" aria-current={active("/about") ? "page" : undefined} onClick={close}>About</Link>
      </nav>
      <div className="site-header-actions">
        <Link href="/login" className="site-login" aria-current={active("/login") ? "page" : undefined}>Log in</Link>
        <Link href={siteBrand.demoPath} className="site-demo-button" onClick={close} onNavigate={openDemoAtTop}>Book a demo <ArrowRight size={18} /></Link>
        <button type="button" className="site-mobile-toggle" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} aria-controls="site-navigation" onClick={() => setMobileOpen(value => !value)}>{mobileOpen ? <X size={24}/> : <Menu size={24}/>}</button>
      </div>
    </div>
  </header>;
}

const productLinks = [["Overview", "/product"], ["Solutions", "/solutions"], ["Integrations", "/integrations"], ["Events", "/events"], ["Book a demo", siteBrand.demoPath]] as const;
const resourceLinks = [["Docs", "/docs"], ["Quickstart", "/docs/quickstart"], ["API reference", "/docs/api-reference"], ["Security", "/docs/accounts-security"], ["Troubleshooting", "/docs/troubleshooting"]] as const;
const companyLinks = [["About", "/about"], ["News & media", "/news"], ["Contact", "mailto:contact@theaipods.com"]] as const;

function SiteFooter() {
  const pathname = usePathname();
  const artwork = pathname.startsWith("/book-demo") || pathname.startsWith("/integrations") ? "explorers"
    : pathname.startsWith("/solutions") || pathname.startsWith("/about") ? "aurora"
    : pathname.startsWith("/product") || pathname.startsWith("/agents") ? "neon-skies"
    : pathname.startsWith("/docs") ? "neon-stars"
    : "starry-friends";
  return <footer className="site-footer" style={{"--footer-art": `url("/brand/footers/${artwork}.webp")`} as CSSProperties}><div className="site-footer-inner">
    <div className="site-footer-grid">
      <div className="site-footer-brand"><Brand footer/><div className="site-footer-cta"><h2>Let’s build a more <em>capable way to work.</em></h2><p>Bring specialized AI employees, your tools, and human review together around the work that matters.</p><Link href={siteBrand.demoPath} className="site-demo-button" onNavigate={openDemoAtTop}>Book a demo <ArrowRight size={18}/></Link></div></div>
      <div className="site-footer-links"><h2>Product</h2>{productLinks.map(([label,href])=><Link key={label} href={href} onNavigate={href === siteBrand.demoPath ? openDemoAtTop : undefined}>{label}</Link>)}</div>
      <div className="site-footer-links"><h2>Resources</h2>{resourceLinks.map(([label,href])=><Link key={label} href={href}>{label}</Link>)}</div>
      <div className="site-footer-links"><h2>Company</h2>{companyLinks.map(([label,href])=><Link key={label} href={href}>{label}</Link>)}</div>
    </div>
    <div className="site-footer-bottom"><span>© {new Date().getFullYear()} {siteBrand.name}. All rights reserved.</span><span>{siteBrand.tagline}</span><Link href="/docs/documentation-policy">Documentation policy</Link></div>
  </div></footer>;
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (!isPublicSitePath(pathname)) return <>{children}</>;
  const isLoginPage = ["/login", "/reset-password"].includes(pathname) || pathname.startsWith("/login/");
  return <><SiteHeader/>{children}{!isLoginPage && <SiteFooter/>}</>;
}

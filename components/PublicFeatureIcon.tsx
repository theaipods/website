import { BookOpen, Boxes, Building2, ChartNoAxesCombined, ClipboardCheck, Compass, Eye, Newspaper, Plug, ShieldCheck, Sprout, UsersRound, CalendarDays, Workflow } from "lucide-react";

const icons = {
  "ROLE-SPECIALIZED": UsersRound, OBSERVABLE: Eye, CONTROLLED: ShieldCheck, MEASURABLE: ChartNoAxesCombined,
  "Start here": Compass, "Build your workforce": Boxes, "Operate & review": ClipboardCheck,
  "Connect & extend": Plug, Administration: ShieldCheck, Reference: BookOpen,
  starter: Sprout, founders: Boxes, enterprise: Building2,
  COMPANY: Newspaper, LEARN: BookOpen, EXPLORE: CalendarDays, PRODUCT: Workflow,
} as const;

/** Decorative category cues; the adjacent visible label supplies the meaning. */
export function PublicFeatureIcon({ name, compact = false }: { name: keyof typeof icons; compact?: boolean }) {
  const Icon = icons[name];
  return <span className={`public-feature-icon${compact ? " public-feature-icon--compact" : ""}`} aria-hidden="true"><Icon size={compact ? 19 : 23} strokeWidth={1.75} focusable="false" /></span>;
}

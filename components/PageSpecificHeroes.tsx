"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  ShieldCheck,
  UsersRound,
  CalendarDays,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Search,
  LockKeyhole,
  GitBranch,
  Layers,
  ClipboardCheck,
  FolderOpen,
  ScanLine,
  SlidersHorizontal,
  Mail,
  Target,
  Video,
  Headphones,
  CircleDot,
} from "lucide-react";
import { ToolLogo } from "@/components/tool-logo";
import { workforceHeroStories } from "@/lib/workforce-hero-stories";
import "@/app/page-specific-heroes.css";

type PageKey = Exclude<keyof typeof workforceHeroStories, "home">;
type MotionProps = { motion?: boolean; onToggleMotion?: () => void };
const durations = [700, 850, 950, 900, 1900];

/** Timing is shared; each page owns its composition and animated scene. */
export function useScene({ motion, onToggleMotion }: MotionProps = {}) {
  const ref = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0),
    [paused, setPaused] = useState(false),
    [reduced, setReduced] = useState(false),
    [visible, setVisible] = useState(false),
    [tabActive, setTabActive] = useState(true);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.08 },
    );
    if (ref.current) observer.observe(ref.current);
    const visibility = () => setTabActive(!document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      media.removeEventListener("change", sync);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  const enabled = motion ?? !paused;
  const running = enabled && !reduced && visible && tabActive;
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(
      () => setStage((value) => (value + 1) % 5),
      durations[stage],
    );
    return () => clearTimeout(timer);
  }, [running, stage]);
  const toggle = () =>
    onToggleMotion ? onToggleMotion() : setPaused((value) => !value);
  const select = (value: number) => {
    if (enabled) toggle();
    setStage(value);
  };
  const replay = () => {
    setStage(0);
    if (!enabled && !reduced) toggle();
  };
  return { ref, stage, running, enabled, reduced, toggle, select, replay };
}
type Scene = ReturnType<typeof useScene>;
export function Portrait({
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  return (
    <Image
      className={`ph-portrait ${className}`}
      src={`/ai-workforce/avatars-hd/${id}.png`}
      alt=""
      width={480}
      height={480}
      sizes="(max-width: 700px) 240px, 320px"
      loading="eager"
    />
  );
}
function Copy({
  page,
  title,
  children,
}: {
  page: PageKey;
  title?: ReactNode;
  children?: ReactNode;
}) {
  const data = workforceHeroStories[page];
  return (
    <div className="ph-copy">
      <span className="ph-kicker">
        <i />
        {data.eyebrow}
      </span>
      <h1 id={`${page}-hero-title`}>
        {title ??
          data.title.map((line, i) =>
            i === data.title.length - 1 ? (
              <em key={line}>{line}</em>
            ) : (
              <span key={line}>
                {line}
                <br />
              </span>
            ),
          )}
      </h1>
      <p>{data.description}</p>
      <div className="ph-actions">
        <Link href={data.primary.href} className="ph-primary">
          {data.primary.label}
          <ArrowRight size={18} />
        </Link>
        <Link href={data.secondary.href} className="ph-secondary">
          {data.secondary.label}
          <ArrowUpRight size={17} />
        </Link>
      </div>
      {children}
    </div>
  );
}
export function Controls({
  scene,
  labels,
  showPlayback = true,
}: {
  scene: Scene;
  labels: string[];
  showPlayback?: boolean;
}) {
  return (
    <div className="ph-controls">
      <div role="group" aria-label="Illustrative story stages">
        {labels.map((label, i) => (
          <button
            key={label}
            onClick={() => scene.select(i)}
            aria-label={`Show ${label}`}
            aria-pressed={scene.stage === i}
          >
            <i />
            {scene.stage === i && <span>{label}</span>}
          </button>
        ))}
      </div>
      <button onClick={scene.replay} aria-label="Replay hero story">
        <RotateCcw size={14} />
        <span>Replay</span>
      </button>
      {showPlayback && (
        <button
          onClick={
            scene.reduced
              ? () => scene.select((scene.stage + 1) % 5)
              : scene.toggle
          }
          aria-label={
            scene.reduced
              ? "Next story step"
              : scene.enabled
                ? "Pause hero story"
                : "Play hero story"
          }
        >
          {scene.enabled && !scene.reduced ? (
            <Pause size={14} />
          ) : (
            <Play size={14} />
          )}
          <span>
            {scene.reduced ? "Next step" : scene.enabled ? "Pause" : "Play"}
          </span>
        </button>
      )}
    </div>
  );
}
function Note({ page }: { page: PageKey }) {
  return <p className="ph-note">{workforceHeroStories[page].note}</p>;
}
function CheckRow({
  children,
  ready,
}: {
  children: ReactNode;
  ready: boolean;
}) {
  return (
    <div className={`ph-check-row ${ready ? "is-ready" : ""}`}>
      <span>{ready ? <Check size={14} /> : <CircleDot size={14} />}</span>
      {children}
    </div>
  );
}

export function EmployeeJourneyHero() {
  const scene = useScene();
  const steps = [
    "A new teammate",
    "Welcome pack",
    "Tools & access",
    "First-week plan",
    "Ready for day one",
  ];
  return (
    <section
      ref={scene.ref}
      className="ph ph-employee"
      aria-labelledby="employee-experience-hero-title"
      data-running={scene.running}
      data-stage={scene.stage}
    >
      <div className="ph-shell pe-layout">
        <Copy
          page="employee-experience"
          title={
            <>
              Every new beginning.
              <br />A better <em>employee experience.</em>
            </>
          }
        >
          <div className="pe-promise">
            <UsersRound size={20} />
            <span>
              People at the center.
              <br />
              <b>AI takes care of the handoffs.</b>
            </span>
          </div>
        </Copy>
        <div className="pe-scene">
          <div className="pe-arch" />
          <div className="pe-orbit-word">WELCOME TO YOUR NEXT CHAPTER</div>
          <div className="pe-assistant">
            <Portrait id="hr-employee-assistant" />
            <span>
              <Headphones size={15} /> Employee Assistant
            </span>
          </div>
          <div className={`pe-welcome ${scene.stage >= 1 ? "is-open" : ""}`}>
            <span className="pe-envelope-flap" />
            <div className="pe-letter">
              <span className="pe-letter-icon">
                <Sparkles size={22} />
              </span>
              <small>A GREAT FIRST DAY STARTS HERE</small>
              <h2>
                Welcome aboard,
                <br />
                Alex.
              </h2>
              <p>
                Your people. Your tools.
                <br />A plan to settle in.
              </p>
              <span className="pe-signature">Your people team</span>
            </div>
            <span className="pe-envelope-front">
              <Mail size={22} /> YOUR WELCOME PACK
            </span>
          </div>
          <div
            className={`pe-access ph-floating ${scene.stage >= 2 ? "is-ready" : ""}`}
          >
            <LockKeyhole size={19} />
            <span>
              Tools & access
              <b>
                {scene.stage >= 2
                  ? "Requests prepared"
                  : "Gathering requirements"}
              </b>
            </span>
            <CheckCircle2 size={18} />
          </div>
          <div
            className={`pe-week ph-floating ${scene.stage >= 3 ? "is-ready" : ""}`}
          >
            <CalendarDays size={21} />
            <span>
              Your first week<b>Meet · Learn · Settle in</b>
            </span>
            <div>
              {["M", "T", "W", "T", "F"].map((d, i) => (
                <i key={i} className={scene.stage >= 3 ? "done" : ""}>
                  {d}
                </i>
              ))}
            </div>
          </div>
          <span className="pe-complete" data-ready={scene.stage === 4}>
            <CheckCircle2 size={17} />
            {scene.stage === 4
              ? "Day-one plan ready for HR review"
              : "A thoughtful start, taking shape"}
          </span>
        </div>
        <div className="pe-journey">
          {[
            "Attract",
            "Hire",
            "Onboard",
            "Support",
            "Develop",
            "Retain",
            "Offboard",
          ].map((label, i) => (
            <div key={label} className={i === 2 ? "is-focus" : ""}>
              <span>
                {i === 2 ? (
                  <Sparkles size={16} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <b>{label}</b>
              {i < 6 && <ChevronRight size={14} />}
            </div>
          ))}
        </div>
        <div className="pe-footer">
          <Note page="employee-experience" />
          <Controls scene={scene} labels={steps} />
        </div>
      </div>
    </section>
  );
}

export function FinanceLedgerHero() {
  const scene = useScene();
  const labels = [
    "Invoice arrives",
    "Extract details",
    "Match evidence",
    "Flag exception",
    "Review package",
  ];
  return (
    <section
      ref={scene.ref}
      className="ph ph-finance"
      aria-labelledby="finance-operations-hero-title"
      data-running={scene.running}
      data-stage={scene.stage}
    >
      <div className="pf-grain" />
      <div className="ph-shell pf-layout">
        <Copy
          page="finance-operations"
          title={
            <>
              Bring the numbers
              <br />
              into focus.
              <br />
              <em>Keep control.</em>
            </>
          }
        >
          <div className="pf-assurance">
            <ShieldCheck size={20} />
            <span>
              Every exception has an owner.
              <br />
              Every approval stays with your team.
            </span>
          </div>
        </Copy>
        <div className="pf-desk">
          <div className="pf-desk-head">
            <span>
              <ScanLine size={17} /> THE RECONCILIATION DESK
            </span>
            <small>Fictional invoice · INV–0284</small>
          </div>
          <div className={`pf-invoice ${scene.stage >= 1 ? "scanned" : ""}`}>
            <div className="pf-paper-top">
              <FileText size={22} />
              <b>INVOICE</b>
              <small>Sample document</small>
            </div>
            <p>Northstar Studio</p>
            <div className="pf-paper-lines">
              <i />
              <i />
              <i />
            </div>
            <div className="pf-amount">
              <small>AMOUNT DUE</small>
              <b>$4,800.00</b>
            </div>
            <div className="pf-scan" />
            <span className="pf-stamp">
              <CheckCircle2 size={18} /> Details extracted
            </span>
          </div>
          <div className="pf-ledger">
            <header>
              <span>01 / RECONCILE</span>
              <b>Evidence, side by side.</b>
            </header>
            {[
              ["Invoice amount", "$4,800", "Matched"],
              ["Purchase order", "PO–1042", "Matched"],
              ["Supplier record", "Northstar", "Matched"],
              ["Approval owner", "Unassigned", "Review"],
            ].map(([name, value, status], i) => (
              <div
                key={name}
                className={scene.stage >= (i === 3 ? 3 : 2) ? "revealed" : ""}
              >
                <span>{name}</span>
                <b>{value}</b>
                <small className={i === 3 ? "exception" : ""}>
                  {scene.stage >= (i === 3 ? 3 : 2) ? status : "Checking"}
                </small>
              </div>
            ))}
            <div className="pf-ledger-total">
              <span>Review status</span>
              <b>
                {scene.stage === 4
                  ? "Ready for your team"
                  : "Preparing evidence"}
              </b>
            </div>
          </div>
          <div className="pf-agent">
            <Portrait id="finance-finance-agent" />
            <span>Finance Agent</span>
          </div>
          <div className={`pf-review ${scene.stage >= 3 ? "is-visible" : ""}`}>
            <ShieldCheck size={20} />
            <div>
              <b>One question for your team.</b>
              <p>Confirm the approval owner before proceeding.</p>
            </div>
          </div>
        </div>
        <div className="pf-bottom">
          <span>
            INTAKE <i /> MATCH <i /> EXCEPTIONS <i /> HUMAN REVIEW
          </span>
          <Controls scene={scene} labels={labels} />
        </div>
        <Note page="finance-operations" />
      </div>
    </section>
  );
}

export function CampaignStudioHero() {
  const scene = useScene();
  const [angle, setAngle] = useState(0);
  const themes = [
    "A brighter launch.",
    "Meet what’s next.",
    "Made for your next move.",
  ];
  const labels = [
    "Audience signal",
    "Campaign brief",
    "Creative direction",
    "Outreach draft",
    "Launch review",
  ];
  return (
    <section
      ref={scene.ref}
      className="ph ph-sales"
      aria-labelledby="sales-marketing-hero-title"
      data-running={scene.running}
      data-stage={scene.stage}
    >
      <div className="ph-shell ps-layout">
        <div className="ps-heading">
          <Copy
            page="sales-marketing"
            title={
              <>
                Find the signal.
                <br />
                Create the story.
                <br />
                <em>Start the conversation.</em>
              </>
            }
          >
            <div className="ps-angle">
              <span>TRY A CREATIVE DIRECTION</span>
              {["Launch", "Discovery", "Growth"].map((label, i) => (
                <button
                  key={label}
                  aria-pressed={angle === i}
                  onClick={() => {
                    setAngle(i);
                    scene.replay();
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </Copy>
        </div>
        <div className="ps-studio">
          <div className="ps-studio-label">
            <span>THE CAMPAIGN STUDIO</span>
            <small>Brief → creative → review</small>
          </div>
          <div className="ps-audience">
            <Target size={21} />
            <small>AUDIENCE SIGNAL</small>
            <b>
              {
                [
                  "Teams ready for a simpler way.",
                  "People exploring what’s possible.",
                  "Businesses planning their next chapter.",
                ][angle]
              }
            </b>
            <div className="ps-signal-bars">
              {[35, 58, 43, 78, 61, 93, 75].map((h, i) => (
                <i
                  key={i}
                  style={
                    {
                      height: `${h}%`,
                      "--delay": `${i * 0.1}s`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          </div>
          <article className={`ps-poster ps-angle-${angle}`}>
            <span className="ps-poster-edition">
              CAMPAIGN CONCEPT / 0{angle + 1}
            </span>
            <div className="ps-art-disc">
              <span />
              <span />
              <span />
            </div>
            <h2 key={angle}>{themes[angle]}</h2>
            <span className="ps-poster-cta">
              Discover the possibility <ArrowUpRight size={16} />
            </span>
            <small>Illustrative creative direction</small>
          </article>
          <div className="ps-designer">
            <Portrait id="product-ui-ux-designer" />
            <span>UI/UX Designer</span>
          </div>
          <div className="ps-outreach">
            <Mail size={19} />
            <div>
              <small>OUTREACH DRAFT</small>
              <b>
                {scene.stage >= 3
                  ? "A relevant reason to connect."
                  : "Waiting for the brief…"}
              </b>
              <p>
                {scene.stage >= 3
                  ? "Bring the audience insight into a thoughtful first conversation."
                  : "Research shapes the message."}
              </p>
            </div>
            <span className={scene.stage === 4 ? "ready" : ""}>
              {scene.stage === 4 ? "Ready for review" : "Drafting"}
            </span>
          </div>
          <div className="ps-review-stamp" data-ready={scene.stage === 4}>
            <CheckCircle2 size={18} /> Creative and outreach aligned
          </div>
        </div>
        <div className="ps-bottom">
          <Note page="sales-marketing" />
          <Controls scene={scene} labels={labels} />
        </div>
      </div>
    </section>
  );
}

export function InsuranceEvidenceHero(props: MotionProps) {
  const scene = useScene(props);
  const labels = [
    "Open the case",
    "Policy context",
    "Supporting evidence",
    "Identify a gap",
    "Reviewer handoff",
  ];
  return (
    <section
      ref={scene.ref}
      className="ph ph-insurance"
      aria-labelledby="insurance-hero-title"
      data-running={scene.running}
      data-stage={scene.stage}
    >
      <div className="ph-shell pi-layout">
        <div className="pi-casebook">
          <span className="pi-case-label">
            THE EVIDENCE ROOM / FICTIONAL CASE 024
          </span>
          <div className="pi-folder-back">
            <span>REVIEW FILE</span>
          </div>
          <article className={`pi-policy ${scene.stage >= 1 ? "is-open" : ""}`}>
            <ShieldCheck size={25} />
            <small>01 / POLICY CONTEXT</small>
            <h2>
              The details
              <br />
              behind the decision.
            </h2>
            <div className="pi-text-lines">
              <i />
              <i />
              <i />
              <i />
            </div>
            <span>Source references attached</span>
          </article>
          <article
            className={`pi-evidence ${scene.stage >= 2 ? "is-open" : ""}`}
          >
            <FolderOpen size={23} />
            <small>02 / EVIDENCE</small>
            <b>A clearer case file.</b>
            <CheckRow ready={scene.stage >= 2}>Notice organized</CheckRow>
            <CheckRow ready={scene.stage >= 2}>Documents grouped</CheckRow>
            <CheckRow ready={scene.stage >= 3}>
              Missing information flagged
            </CheckRow>
          </article>
          <div className="pi-folder-front">
            <span>
              <LockKeyhole size={17} /> Authorized review
            </span>
            <b>
              Evidence first.
              <br />
              Judgment with people.
            </b>
            <i />
          </div>
          <div className="pi-owl">
            <Portrait id="legal-compliance-analyst" />
          </div>
          <div className="pi-gap" data-ready={scene.stage >= 3}>
            <Search size={16} />
            {scene.stage === 4
              ? "Reviewer handoff prepared"
              : "One missing detail to clarify"}
          </div>
        </div>
        <Copy
          page="insurance"
          title={
            <>
              Every claim
              <br />
              has a story.
              <br />
              <em>See it clearly.</em>
            </>
          }
        >
          <div className="pi-boundary">
            <ShieldCheck size={22} />
            <p>
              AI organizes the evidence.
              <br />
              <b>Your people make the decision.</b>
            </p>
          </div>
          <Controls scene={scene} labels={labels} showPlayback={false} />
          <Note page="insurance" />
        </Copy>
      </div>
    </section>
  );
}

export function DemoSessionHero() {
  const scene = useScene();
  const [focus, setFocus] = useState(0);
  const labels = [
    "Choose a focus",
    "Scope the objective",
    "Explore the workflow",
    "Discuss review points",
    "Your session agenda",
  ];
  return (
    <section
      ref={scene.ref}
      className="ph ph-demo"
      aria-labelledby="book-demo-hero-title"
      data-running={scene.running}
      data-stage={scene.stage}
    >
      <div className="ph-shell pdh-layout">
        <Copy
          page="book-demo"
          title={
            <>
              Your work.
              <br />
              Your questions.
              <br />
              <em>Let’s explore together.</em>
            </>
          }
        >
          <div className="pdh-focus">
            <small>WHAT WOULD YOU LIKE TO EXPLORE?</small>
            {["Finance", "People", "Customer work"].map((label, i) => (
              <button
                key={label}
                onClick={() => {
                  setFocus(i);
                  scene.replay();
                }}
                aria-pressed={focus === i}
              >
                {label}
                <ArrowUpRight size={14} />
              </button>
            ))}
          </div>
        </Copy>
        <div className="pdh-room">
          <Image
            src="/brand/workforce-demo-suite.webp"
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 55vw"
            preload
          />
          <div className="pdh-room-shade" />
          <span className="pdh-session-tag">
            <Video size={16} /> A PERSONAL WALKTHROUGH
          </span>
          <div className="pdh-presenter">
            <Portrait
              id={
                [
                  "finance-finance-agent",
                  "hr-employee-assistant",
                  "sales-sales-agent",
                ][focus]
              }
            />
            <span>
              {["Finance Agent", "Employee Assistant", "Sales Agent"][focus]}
            </span>
          </div>
          <div className="pdh-agenda">
            <div>
              <span>BUILT AROUND YOUR TEAM</span>
              <h2>
                {
                  [
                    "Your finance workflow.",
                    "Your employee journey.",
                    "Your customer workflow.",
                  ][focus]
                }
              </h2>
            </div>
            {[
              "Start with your objective",
              "See the work take shape",
              "Find your review points",
            ].map((line, i) => (
              <CheckRow key={line} ready={scene.stage >= i + 1}>
                {line}
              </CheckRow>
            ))}
            <footer>
              <CalendarDays size={18} />
              {scene.stage === 4
                ? "Agenda ready. Choose a time below."
                : "A useful conversation starts here."}
            </footer>
          </div>
          <div className="pdh-live-caption">
            <span />
            <b>Explore possibilities.</b>
            <small>No setup needed to book a conversation.</small>
          </div>
        </div>
        <div className="pdh-footer">
          <Note page="book-demo" />
          <Controls scene={scene} labels={labels} />
        </div>
      </div>
    </section>
  );
}

export function IntegrationBridgeHero() {
  const scene = useScene();
  const [tool, setTool] = useState(0);
  const tools = ["Slack", "Google Drive", "Notion", "Salesforce"];
  const labels = [
    "Choose a source",
    "Check access",
    "Discover tools",
    "Prepare context",
    "Review the briefing",
  ];
  return (
    <section
      ref={scene.ref}
      className="ph ph-integrations"
      aria-labelledby="integrations-hero-title"
      data-running={scene.running}
      data-stage={scene.stage}
    >
      <div className="ph-shell pih-layout">
        <Copy
          page="integrations"
          title={
            <>
              Keep your tools.
              <br />
              <em>Connect the possibilities.</em>
            </>
          }
        >
          <div className="pih-principle">
            <LockKeyhole size={18} />
            <span>Your sources. Your permissions. Your control.</span>
          </div>
        </Copy>
        <div className="pih-network">
          <div className="pih-sources">
            <span>YOUR EXISTING STACK</span>
            {tools.map((name, i) => (
              <button
                key={name}
                onClick={() => {
                  setTool(i);
                  scene.replay();
                }}
                aria-pressed={tool === i}
              >
                <ToolLogo name={name} size={25} />
                <b>{name}</b>
                <i />
              </button>
            ))}
          </div>
          <div className="pih-bridge">
            <svg
              viewBox="0 0 500 320"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 40C130 40 90 160 210 160M0 120C130 120 90 160 210 160M0 200C130 200 90 160 210 160M0 280C130 280 90 160 210 160M290 160H500" />
              <path
                className="pih-packet"
                d={`M0 ${40 + tool * 80}C130 ${40 + tool * 80} 90 160 210 160M290 160H500`}
              />
            </svg>
            <div className="pih-gate" data-open={scene.stage >= 1}>
              <ShieldCheck size={27} />
              <b>
                PERMISSION
                <br />
                BOUNDARY
              </b>
              <small>
                {scene.stage >= 1 ? "Scope reviewed" : "Access first"}
              </small>
            </div>
            <div className="pih-protocol">
              <GitBranch size={16} /> MCP · tool discovery
            </div>
          </div>
          <div className="pih-brief">
            <span>
              <FileText size={20} /> THE USEFUL CONTEXT
            </span>
            <h2>
              From {tools[tool]}
              <br />
              to a clearer brief.
            </h2>
            <CheckRow ready={scene.stage >= 2}>Available tool schemas</CheckRow>
            <CheckRow ready={scene.stage >= 3}>
              Approved source context
            </CheckRow>
            <CheckRow ready={scene.stage >= 4}>A reviewable summary</CheckRow>
            <small>Configuration required. No live connection.</small>
          </div>
          <div className="pih-engineer">
            <Portrait id="it-systems-administrator" />
            <span>Systems Administrator</span>
          </div>
        </div>
        <div className="pih-bottom">
          <Note page="integrations" />
          <Controls scene={scene} labels={labels} />
        </div>
      </div>
    </section>
  );
}

export function ProductWorkbenchHero(props: MotionProps) {
  const scene = useScene(props);
  const labels = [
    "Define the goal",
    "Choose specialists",
    "Connect context",
    "Add review",
    "Blueprint ready",
  ];
  return (
    <section
      ref={scene.ref}
      className="ph ph-product"
      aria-labelledby="product-hero-title"
      data-running={scene.running}
      data-stage={scene.stage}
    >
      <div className="ph-shell pp-layout">
        <div className="pp-intro">
          <span className="ph-kicker">
            <i />
            THE WORKFORCE WORKBENCH
          </span>
          <h1 id="product-hero-title">
            Don’t just add AI.
            <br />
            <em>Build a way to work.</em>
          </h1>
          <p>
            Turn an objective into a team, a workflow, and a reviewable result.
            <br /> Your people and controls are part of the design.
          </p>
          <div className="ph-actions">
            <Link href="#lifecycle" className="ph-primary">
              Explore the product
              <ArrowRight size={18} />
            </Link>
            <Link href="/book-demo" className="ph-secondary">
              Book a demo
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
        <div className="pp-workbench">
          <header>
            <span>
              <Layers size={18} /> AI POD BUILDER
            </span>
            <b>Customer onboarding</b>
            <small>
              {scene.stage === 4
                ? "Blueprint ready for review"
                : "Illustrative blueprint"}
            </small>
          </header>
          <div className="pp-board">
            <div className="pp-ruler">
              <span>OBJECTIVE</span>
              <span>WORKFORCE</span>
              <span>CONTEXT</span>
              <span>CONTROL</span>
            </div>
            <svg
              viewBox="0 0 1100 300"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M220 160H320M490 160H590M760 160H860" />
              <path
                className="pp-build-signal"
                d="M220 160H320M490 160H590M760 160H860"
              />
            </svg>
            <button
              className={`pp-block pp-goal ${scene.stage === 0 ? "is-active" : ""}`}
              onClick={() => scene.select(0)}
            >
              <span>
                <Target size={22} /> 01 / DEFINE
              </span>
              <h2>
                A thoughtful
                <br />
                customer welcome.
              </h2>
              <p>Give every handoff a clear owner.</p>
              <small>
                Objective defined <Check size={13} />
              </small>
            </button>
            <button
              className={`pp-block pp-team ${scene.stage === 1 ? "is-active" : ""}`}
              onClick={() => scene.select(1)}
            >
              <span>
                <UsersRound size={20} /> 02 / ASSIGN
              </span>
              <div>
                <Portrait id="ops-business-analyst" />
                <Portrait id="ops-project-manager" />
              </div>
              <b>Specialists with a shared goal.</b>
              <small>
                {scene.stage >= 1 ? "Roles selected" : "Choose the team"}
              </small>
            </button>
            <button
              className={`pp-block pp-context ${scene.stage === 2 ? "is-active" : ""}`}
              onClick={() => scene.select(2)}
            >
              <span>
                <GitBranch size={20} /> 03 / CONNECT
              </span>
              <div>
                {["Notion", "Slack", "Google Drive"].map((name) => (
                  <ToolLogo key={name} name={name} size={27} />
                ))}
              </div>
              <b>The right context.</b>
              <p>Knowledge, tools and scoped access.</p>
              <small>
                {scene.stage >= 2
                  ? "Requirements mapped"
                  : "Configure your sources"}
              </small>
            </button>
            <button
              className={`pp-block pp-control ${scene.stage >= 3 ? "is-active" : ""}`}
              onClick={() => scene.select(3)}
            >
              <span>
                <ShieldCheck size={20} /> 04 / REVIEW
              </span>
              <div>
                <ClipboardCheck size={38} />
              </div>
              <b>
                Your approval.
                <br />
                Built into the flow.
              </b>
              <small>
                {scene.stage === 4
                  ? "Ready for human review"
                  : "A checkpoint before action"}
              </small>
            </button>
          </div>
          <footer>
            <span>
              <SlidersHorizontal size={15} /> Design it around your business.
            </span>
            <b>
              <CheckCircle2 size={16} />
              {scene.stage === 4
                ? "Blueprint prepared · not deployed"
                : "Building the example blueprint"}
            </b>
          </footer>
        </div>
        <div className="pp-bottom">
          <Note page="product" />
          <Controls scene={scene} labels={labels} />
        </div>
      </div>
    </section>
  );
}

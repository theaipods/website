"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  Headphones,
  LockKeyhole,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Controls, Portrait, useScene } from "@/components/PageSpecificHeroes";
import { solutions, solutionHref } from "@/lib/solutions";
import "@/app/solution-hero-scenes.css";

const conversations = [
  {
    name: "Delivery",
    message: "Could you help me check my delivery?",
    source: "Order history + delivery guide",
    context: "Order #2048 · sample tracking update",
    reply:
      "Your delivery is on its way. Here’s the tracking link and what to expect next.",
    review: false,
  },
  {
    name: "Product",
    message: "Will this work with the tools we already use?",
    source: "Approved product knowledge",
    context: "Compatibility guide · supported connections",
    reply:
      "Let’s find the right fit. Here’s the compatibility guide and a checklist for your team.",
    review: false,
  },
  {
    name: "Policy exception",
    message: "Can I return this outside the return window?",
    source: "Return policy + request details",
    context: "Exception found · decision required",
    reply:
      "This needs a person’s review. The request and relevant policy are ready for the support team.",
    review: true,
  },
];

export function CustomerConversationHero() {
  const scene = useScene();
  const [topic, setTopic] = useState(0);
  const sample = conversations[topic];
  const labels = [
    "Listen to the request",
    "Find the context",
    "Check the guidance",
    "Prepare a reply",
    "Ready for review",
  ];
  return (
    <section
      ref={scene.ref}
      className="ph xc-hero"
      data-stage={scene.stage}
      data-running={scene.running}
      aria-labelledby="customer-hero-title"
    >
      <div className="ph-shell xc-layout">
        <div className="ph-copy xc-copy">
          <span className="ph-kicker">
            <i />
            CUSTOMER EXPERIENCE
          </span>
          <h1 id="customer-hero-title">
            Every conversation.
            <br />
            <em>
              A little more
              <br />
              understood.
            </em>
          </h1>
          <p>
            Bring the context into the conversation. Help your team prepare
            thoughtful replies and give every exception a clear human handoff.
          </p>
          <div className="ph-actions">
            <Link className="ph-primary" href="#workflows">
              Explore customer workflows
              <ArrowRight size={18} />
            </Link>
            <Link className="ph-secondary" href="/book-demo">
              Book a demo
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="xc-topics">
            <span>START A SAMPLE CONVERSATION</span>
            <div>
              {conversations.map((item, i) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setTopic(i);
                    scene.replay();
                  }}
                  aria-pressed={topic === i}
                >
                  {item.name}
                  <MessageCircle size={14} />
                </button>
              ))}
            </div>
          </div>
          <div className="xc-promise">
            <Headphones size={20} />
            <span>
              Helpful responses.
              <br />
              <b>A human touch, where it matters.</b>
            </span>
          </div>
        </div>
        <div
          className="xc-conversation"
          aria-label="Fictional conversation preview"
        >
          <div className="xc-disc" />
          <div className="xc-transcript">
            <header>
              <span>
                <MessageCircle size={17} /> A conversation, connected.
              </span>
              <i />
            </header>
            <div className="xc-incoming" key={topic}>
              <span className="xc-person">A</span>
              <div>
                <small>ALEX · SAMPLE CUSTOMER</small>
                <p>{sample.message}</p>
                <span className="xc-received">
                  <Check size={12} /> Request received
                </span>
              </div>
            </div>
            <div className="xc-context" data-ready={scene.stage >= 1}>
              <BookOpen size={17} />
              <div>
                <b>
                  {scene.stage >= 1
                    ? sample.source
                    : "Finding the relevant context"}
                </b>
                <small>
                  {scene.stage >= 2 ? sample.context : "Approved sources only"}
                </small>
              </div>
              <CheckCircle2 size={16} />
            </div>
            <div className="xc-draft" data-ready={scene.stage >= 3}>
              <span>
                <Sparkles size={16} />{" "}
                {sample.review ? "PREPARED HANDOFF" : "RESPONSE DRAFT"}
              </span>
              <p>
                {scene.stage >= 3
                  ? sample.reply
                  : "A useful reply starts with understanding the request."}
              </p>
              <div className="xc-draft-footer">
                <span>
                  {scene.stage === 4
                    ? sample.review
                      ? "For a human decision"
                      : "Ready for your team"
                    : "Preparing with context"}
                </span>
                <Send size={16} />
              </div>
            </div>
          </div>
          <div className="xc-companion">
            <Portrait id="orchestrator" />
            <span>
              <Headphones size={14} /> AI-assisted service
            </span>
          </div>
          <div className="xc-handoff" data-ready={scene.stage === 4}>
            <UsersRound size={22} />
            <div>
              <small>THE NEXT RIGHT STEP</small>
              <b>
                {scene.stage === 4
                  ? sample.review
                    ? "A specialist takes it from here."
                    : "A thoughtful reply, ready to review."
                  : "Your team stays in the conversation."}
              </b>
            </div>
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="xc-bottom">
          <div className="xc-journey">
            {["Listen", "Understand", "Prepare", "Review"].map((label, i) => (
              <span key={label} data-active={scene.stage >= i}>
                <i>{i + 1}</i>
                {label}
                {i < 3 && <ChevronRight size={14} />}
              </span>
            ))}
          </div>
          <Controls scene={scene} labels={labels} />
          <p className="ph-note">
            Fictional requests · approved context requires configuration · no
            customer systems accessed
          </p>
        </div>
      </div>
    </section>
  );
}

const atlas = [
  {
    slug: "employee-experience",
    label: "People",
    title: "Make room for a better workday.",
    id: "hr-employee-assistant",
    accent: "#277b61",
    soft: "#e5f4e9",
    scenario: "A thoughtful start for a new teammate.",
    steps: [
      "Gather approved guidance",
      "Prepare the welcome plan",
      "Route access requests",
    ],
    artifact: "First-week plan",
  },
  {
    slug: "customer-experience",
    label: "Customers",
    title: "Put understanding behind every reply.",
    id: "orchestrator",
    accent: "#5065a6",
    soft: "#e9edfc",
    scenario: "A customer question, with the right context.",
    steps: [
      "Understand the question",
      "Find approved context",
      "Prepare a helpful response",
    ],
    artifact: "Response draft",
  },
  {
    slug: "finance-operations",
    label: "Finance",
    title: "Bring clarity to the close.",
    id: "finance-finance-agent",
    accent: "#956442",
    soft: "#f7ecdf",
    scenario: "An invoice that needs a second look.",
    steps: [
      "Extract invoice details",
      "Compare supporting records",
      "Surface the exception",
    ],
    artifact: "Review package",
  },
  {
    slug: "sales-marketing",
    label: "Growth",
    title: "Turn a good signal into a shared plan.",
    id: "sales-sales-agent",
    accent: "#a25742",
    soft: "#f8e9e1",
    scenario: "A launch with a clear audience and message.",
    steps: [
      "Research the audience",
      "Shape the campaign brief",
      "Prepare outreach for review",
    ],
    artifact: "Campaign brief",
  },
  {
    slug: "healthcare",
    label: "Healthcare",
    title: "Give every handoff a clear next step.",
    id: "it-security-engineer",
    accent: "#247e89",
    soft: "#e2f3f3",
    scenario: "An administrative request, ready for staff.",
    steps: [
      "Organize the request",
      "Flag sensitive information",
      "Prepare the staff handoff",
    ],
    artifact: "Staff review note",
  },
  {
    slug: "insurance",
    label: "Insurance",
    title: "Find the story in the evidence.",
    id: "legal-compliance-analyst",
    accent: "#4b6e8a",
    soft: "#e8eff4",
    scenario: "A claim file with one missing detail.",
    steps: [
      "Collect the claim context",
      "Organize supporting evidence",
      "Flag questions for the reviewer",
    ],
    artifact: "Evidence checklist",
  },
];

export function SolutionsAtlasHero() {
  const scene = useScene();
  const [choice, setChoice] = useState(0);
  const area = atlas[choice];
  const solution = solutions.find((item) => item.slug === area.slug)!;
  return (
    <section
      ref={scene.ref}
      className="ph xa-hero"
      data-stage={scene.stage}
      data-running={scene.running}
      aria-labelledby="solutions-hero-title"
      style={
        { "--xa-accent": area.accent, "--xa-soft": area.soft } as CSSProperties
      }
    >
      <div className="ph-shell xa-layout">
        <div className="xa-heading">
          <div className="ph-copy">
            <span className="ph-kicker">
              <i />
              THE SOLUTIONS COLLECTION
            </span>
            <h1 id="solutions-hero-title">
              Different challenges.
              <br />
              <em>Find your way forward.</em>
            </h1>
          </div>
          <div className="xa-intro">
            <p>
              Start with the work that matters to your team. Explore how
              specialists, context and human review can come together around it.
            </p>
            <div className="ph-actions">
              <Link className="ph-primary" href="#find-solution">
                Find your solution
                <ArrowRight size={18} />
              </Link>
              <Link className="ph-secondary" href="/book-demo">
                Talk to our team
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
        <div className="xa-collection">
          <div
            className="xa-tabs"
            role="tablist"
            aria-label="Explore solution areas"
          >
            {atlas.map((item, i) => (
              <button
                key={item.slug}
                id={`atlas-tab-${i}`}
                role="tab"
                aria-selected={choice === i}
                aria-controls="atlas-chapter"
                tabIndex={choice === i ? 0 : -1}
                onClick={() => {
                  setChoice(i);
                  scene.replay();
                }}
                onKeyDown={(e) => {
                  if (
                    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                  ) {
                    e.preventDefault();
                    const next =
                      e.key === "Home"
                        ? 0
                        : e.key === "End"
                          ? 5
                          : (choice + (e.key === "ArrowRight" ? 1 : 5)) % 6;
                    setChoice(next);
                    scene.replay();
                    document.getElementById(`atlas-tab-${next}`)?.focus();
                  }
                }}
              >
                <span>0{i + 1}</span>
                {item.label}
                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>
          <div
            id="atlas-chapter"
            className="xa-chapter"
            role="tabpanel"
            aria-labelledby={`atlas-tab-${choice}`}
          >
            <div className="xa-chapter-copy" key={area.slug}>
              <span className="xa-chapter-number">
                0{choice + 1} <i /> {solution.title.toUpperCase()}
              </span>
              <h2>{area.title}</h2>
              <p>{area.scenario}</p>
              <Link href={solutionHref(area.slug)}>
                Explore {solution.title}
                <ArrowRight size={18} />
              </Link>
              <div className="xa-stage-track">
                {area.steps.map((step, i) => (
                  <span key={step} data-ready={scene.stage > i}>
                    <i>{scene.stage > i ? <Check size={12} /> : i + 1}</i>
                    {step}
                  </span>
                ))}
              </div>
            </div>
            <div className="xa-chapter-art">
              <span className="xa-large-number" aria-hidden="true">
                0{choice + 1}
              </span>
              <div className="xa-platform" />
              <div className="xa-character" key={area.id}>
                <Portrait id={area.id} />
              </div>
              <div className="xa-artifact" data-ready={scene.stage === 4}>
                <FileText size={24} />
                <div>
                  <small>
                    {scene.stage === 4
                      ? "PREPARED FOR HUMAN REVIEW"
                      : "TAKING SHAPE"}
                  </small>
                  <b>{area.artifact}</b>
                </div>
                <CheckCircle2 size={20} />
              </div>
              <span className="xa-edition">
                ONE OBJECTIVE. A USEFUL PLACE TO START.
              </span>
            </div>
          </div>
        </div>
        <div className="xa-footer">
          <p className="ph-note">
            Six solution areas · illustrative examples · configuration and
            review required
          </p>
          <Controls
            scene={scene}
            labels={[
              "Choose an area",
              "Understand the objective",
              "Organize the context",
              "Prepare the work",
              "Ready for review",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

const careRequests = [
  {
    name: "Appointments",
    title: "A clearer appointment handoff.",
    message: "Please help organize my follow-up visit.",
    context: "Scheduling preferences",
    reference: "Appointment guidance",
    output: "Appointment request",
    time: "09:30",
    day: "MONDAY",
    icon: CalendarDays,
  },
  {
    name: "Documents",
    title: "The right paperwork, together.",
    message: "Which documents should I prepare for my visit?",
    context: "Administrative checklist",
    reference: "Approved visit information",
    output: "Document preparation note",
    time: "10:15",
    day: "TUESDAY",
    icon: FileText,
  },
  {
    name: "Follow-up",
    title: "A next step with a clear owner.",
    message: "Who can help with my follow-up request?",
    context: "Request and contact preference",
    reference: "Staff routing guidance",
    output: "Follow-up handoff",
    time: "14:00",
    day: "WEDNESDAY",
    icon: MessageCircle,
  },
];

export function HealthcareCoordinationHero(props: {
  motion?: boolean;
  onToggleMotion?: () => void;
}) {
  const scene = useScene(props);
  const [request, setRequest] = useState(0);
  const item = careRequests[request];
  const Icon = item.icon;
  return (
    <section
      ref={scene.ref}
      className="ph xh-hero"
      data-stage={scene.stage}
      data-running={scene.running}
      aria-labelledby="healthcare-hero-title"
    >
      <div className="ph-shell xh-layout">
        <div className="ph-copy">
          <span className="ph-kicker">
            <i />
            HEALTHCARE / PEOPLE FIRST
          </span>
          <h1 id="healthcare-hero-title">
            Less in the way.
            <br />
            <em>
              More care in
              <br />
              every handoff.
            </em>
          </h1>
          <p>
            Give administrative work a clear path. Bring requests, documents and
            follow-up into a prepared handoff, so your staff can focus on
            people.
          </p>
          <div className="ph-actions">
            <Link className="ph-primary" href="#healthcare-workflows">
              Explore healthcare
              <ArrowRight size={18} />
            </Link>
            <Link className="ph-secondary" href="/book-demo">
              Book a demo
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="xh-topics">
            <small>EXPLORE AN ADMINISTRATIVE MOMENT</small>
            <div>
              {careRequests.map((option, i) => (
                <button
                  key={option.name}
                  aria-pressed={request === i}
                  onClick={() => {
                    setRequest(i);
                    scene.replay();
                  }}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
          <p className="xh-boundary">
            <ShieldCheck size={19} /> Clinical decisions stay with qualified
            staff.
          </p>
        </div>
        <div className="xh-station">
          <div className="xh-arch" />
          <div className="xh-clock" aria-hidden="true">
            <div className="xh-clock-face">
              {Array.from({ length: 12 }, (_, i) => (
                <i key={i} style={{ rotate: `${i * 30}deg` }} />
              ))}
              <span
                className="xh-clock-hand"
                style={{ rotate: `${scene.stage * 24 - 65}deg` }}
              />
              <span className="xh-clock-short" />
              <b />
            </div>
          </div>
          <div className="xh-date">
            <small>ILLUSTRATIVE SCHEDULE</small>
            <span>{item.day}</span>
            <b>{item.time}</b>
            <i>For staff to confirm</i>
          </div>
          <article className="xh-folio">
            <span className="xh-clip" />
            <header>
              <span>
                <Icon size={24} />
              </span>
              <div>
                <small>CARE COORDINATION</small>
                <h2>{item.title}</h2>
              </div>
            </header>
            <div className="xh-request">
              <MessageCircle size={17} />
              <p>{item.message}</p>
            </div>
            <div className="xh-checklist">
              {[item.context, item.reference, "Sensitive details flagged"].map(
                (label, i) => (
                  <div key={label} data-ready={scene.stage > i}>
                    <span>{scene.stage > i ? <Check size={14} /> : <i />}</span>
                    <b>{label}</b>
                  </div>
                ),
              )}
            </div>
            <footer data-ready={scene.stage === 4}>
              <UsersRound size={20} />
              <span>
                <small>STAFF REVIEW TRAY</small>
                <b>
                  {scene.stage === 4
                    ? item.output + " ready"
                    : "Preparing the handoff"}
                </b>
              </span>
              <ArrowRight size={18} />
            </footer>
          </article>
          <div className="xh-companion">
            <Portrait id="it-security-engineer" />
            <span>
              <LockKeyhole size={13} /> Careful with context.
            </span>
          </div>
          <span className="xh-floor" />
        </div>
        <div className="xh-bottom">
          <div className="xh-route">
            {["Request", "Context", "Privacy", "Staff handoff"].map(
              (label, i) => (
                <span key={label} data-ready={scene.stage > i}>
                  <i>{scene.stage > i ? <Check size={12} /> : i + 1}</i>
                  {label}
                  {i < 3 && <ArrowRight size={15} />}
                </span>
              ),
            )}
          </div>
          <Controls
            scene={scene}
            labels={[
              "Request received",
              "Gather context",
              "Check guidance",
              "Prepare handoff",
              "Staff review ready",
            ]}
            showPlayback={false}
          />
          <p className="ph-note">
            Administrative illustration · no patient data accessed · no
            appointment booked
          </p>
        </div>
      </div>
    </section>
  );
}

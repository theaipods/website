"use client";

// Front-end only state. Everything lives in the browser (localStorage); there is no backend.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { POD_MANAGER, type Role } from "./catalog";

export type Doc = { name: string; size: number; chunks: number };
export type Gist = {
  summary: string;
  facts: string[];
  voice: string;
  suggested: { name: string; objective: string }[];
};
export type Palette = { name: string; primary: string; secondary: string; accent: string };
// Brand guidelines. A company can keep several colour combinations; palettes[0] is the default.
export type Brand = {
  tagline: string;
  palettes: Palette[];
  typography: string;
  tone: string;
  always: string;
  never: string;
  logo: string;
};
export type Company = Brand & {
  id: string;
  name: string;
  website: string;
  industry: string;
  size: string;
  about: string;
  // Mirrors of palettes[0], kept for the deliverable previews.
  primary: string;
  secondary: string;
  docs: Doc[];
  gist: Gist;
};

export const defaultBrand = (): Brand => ({
  tagline: "",
  palettes: [{ name: "Main", primary: "#1F3A93", secondary: "#F5A623", accent: "#2BB673" }],
  typography: "",
  tone: "",
  always: "",
  never: "",
  logo: "",
});
export const brandOf = (c: Company): Brand => ({
  tagline: c.tagline,
  palettes: c.palettes,
  typography: c.typography,
  tone: c.tone,
  always: c.always,
  never: c.never,
  logo: c.logo,
});
// Companies saved before brand guidelines existed only have two colours.
const upgrade = (c: Company): Company => ({
  ...c,
  palettes: c.palettes?.length ? c.palettes : [{ name: "Main", primary: c.primary, secondary: c.secondary, accent: "#2BB673" }],
  typography: c.typography ?? "",
  always: c.always ?? "",
  never: c.never ?? "",
  logo: c.logo ?? "",
});
export type TaskStatus =
  | "Planned"
  | "Running"
  | "Needs approval"
  | "Completed"
  | "Rejected";
export type Kind = "poster" | "page" | "social" | "email" | "report";
export type Task = {
  id: string;
  title: string;
  agent: string;
  status: TaskStatus;
  kind?: Kind;
  gated: boolean;
};
export type Deliverable = {
  id: string;
  title: string;
  kind: Kind;
  agent: string;
  at: string;
};
export type Activity = { id: string; at: string; who: string; text: string };
export type PodAgent = { roleId: string; name: string; dept: string; autonomy: number };
export type Pod = {
  id: string;
  companyId: string;
  name: string;
  objective: string;
  agents: PodAgent[];
  tasks: Task[];
  deliverables: Deliverable[];
  activity: Activity[];
  paused: boolean;
  at: string;
};

type State = {
  authed: boolean;
  companies: Company[];
  activeId: string | null;
  pods: Pod[];
  killed: boolean;
};

const empty: State = {
  authed: false,
  companies: [],
  activeId: null,
  pods: [],
  killed: false,
};

const KEY = "aipod-v1";
export const DRAFT_KEY = "aipod-draft";
export const uid = () => Math.random().toString(36).slice(2, 9);
const now = () => new Date().toISOString();

const kindFor = (name: string): Kind | undefined => {
  if (/Social|Brand Checker/.test(name)) return "poster";
  if (/Frontend|Designer|eCommerce/.test(name)) return "page";
  if (/Email|Newsletter|Lifecycle|Engager/.test(name)) return "email";
  if (/Marketing|Content/.test(name)) return "social";
  if (/QA|Scheduler|Router|Watchdog/.test(name)) return undefined;
  return "report";
};

const titleFor = (kind: Kind, role: string, pod: string) =>
  ({
    poster: `${pod} — poster`,
    page: role.includes("Designer") ? `${pod} — page design` : `${pod} — landing page`,
    social: `${pod} — social post`,
    email: `${pod} — email`,
    report: role === POD_MANAGER.name ? `${pod} — outcome report` : `${role} report`,
  })[kind];

function buildPlan(agents: PodAgent[], roles: Role[]): Task[] {
  const tasks: Task[] = [
    {
      id: uid(),
      title: "Read the Company Brain and break the objective into a plan",
      agent: POD_MANAGER.name,
      status: "Completed",
      gated: false,
    },
  ];
  agents.forEach((a) => {
    const role = roles.find((r) => r.id === a.roleId);
    const kind = kindFor(a.name);
    tasks.push({
      id: uid(),
      title: role?.does ?? `Contribute to the objective as ${a.name}`,
      agent: a.name,
      status: "Planned",
      kind,
      // Anything customer-facing waits for the owner unless autonomy is L3 or higher.
      gated: !!kind && kind !== "report" && a.autonomy < 3,
    });
  });
  tasks.push({
    id: uid(),
    title: "Compile the outcome report",
    agent: POD_MANAGER.name,
    status: "Planned",
    kind: "report",
    gated: false,
  });
  return tasks;
}

const say = (who: string, text: string): Activity => ({ id: uid(), at: now(), who, text });

function finish(pod: Pod, t: Task): Pod {
  const deliverables = t.kind
    ? [
        { id: uid(), title: titleFor(t.kind, t.agent, pod.name), kind: t.kind, agent: t.agent, at: now() },
        ...pod.deliverables,
      ]
    : pod.deliverables;
  return {
    ...pod,
    deliverables,
    tasks: pod.tasks.map((x) => (x.id === t.id ? { ...x, status: "Completed" } : x)),
    activity: [
      say(t.agent, t.kind ? "completed the task and delivered the output" : "completed the task"),
      ...pod.activity,
    ],
  };
}

// One step of simulated execution per pod.
function tick(pod: Pod): Pod {
  if (pod.paused) return pod;
  const running = pod.tasks.find((t) => t.status === "Running");
  if (running) {
    if (running.gated) {
      return {
        ...pod,
        tasks: pod.tasks.map((t) =>
          t.id === running.id ? { ...t, status: "Needs approval" } : t,
        ),
        activity: [say(running.agent, "finished a draft and requested your approval"), ...pod.activity],
      };
    }
    return finish(pod, running);
  }
  const next = pod.tasks.find((t) => t.status === "Planned");
  if (!next) return pod;
  // The closing report waits until every approval has been decided.
  const last = pod.tasks[pod.tasks.length - 1];
  if (next.id === last.id && pod.tasks.some((t) => t.status === "Needs approval")) return pod;
  const idx = pod.tasks.indexOf(next);
  const prev = pod.tasks[idx - 1];
  return {
    ...pod,
    tasks: pod.tasks.map((t) => (t.id === next.id ? { ...t, status: "Running" } : t)),
    activity: [
      say(next.agent, `picked up the handoff from ${prev?.agent ?? POD_MANAGER.name} and started work`),
      ...pod.activity,
    ],
  };
}

type Ctx = State & {
  ready: boolean;
  company: Company | null;
  companyPods: Pod[];
  login: (u: string, p: string) => boolean;
  logout: () => void;
  addCompany: (c: Omit<Company, "id">) => void;
  setActive: (id: string) => void;
  updateCompany: (id: string, patch: Partial<Omit<Company, "id" | "gist" | "primary" | "secondary">>) => void;
  deleteCompany: (id: string) => void;
  createPod: (p: { name: string; objective: string; agents: PodAgent[] }, roles: Role[]) => string;
  decide: (podId: string, taskId: string, decision: "approve" | "changes" | "reject") => void;
  togglePause: (podId: string) => void;
  setAutonomy: (podId: string, roleId: string, level: number) => void;
  hire: (podId: string, role: Role) => void;
  toggleKill: () => void;
  reset: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<State>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = { ...empty, ...JSON.parse(raw) } as State;
        setS({ ...saved, companies: saved.companies.map(upgrade) });
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {}
  }, [s, ready]);

  useEffect(() => {
    const t = setInterval(() => {
      setS((p) => (p.killed || !p.authed ? p : { ...p, pods: p.pods.map(tick) }));
    }, 3200);
    return () => clearInterval(t);
  }, []);

  const mapPod = useCallback(
    (id: string, f: (p: Pod) => Pod) =>
      setS((p) => ({ ...p, pods: p.pods.map((x) => (x.id === id ? f(x) : x)) })),
    [],
  );

  const value = useMemo<Ctx>(() => {
    const company = s.companies.find((c) => c.id === s.activeId) ?? null;
    return {
      ...s,
      ready,
      company,
      companyPods: s.pods.filter((p) => p.companyId === s.activeId),
      login: (u, p) => {
        const ok = u.trim() === "admin" && p === "admin";
        if (ok) setS((x) => ({ ...x, authed: true }));
        return ok;
      },
      logout: () => setS((x) => ({ ...x, authed: false })),
      addCompany: (c) => {
        const id = uid();
        setS((x) => ({ ...x, companies: [...x.companies, { ...c, id }], activeId: id }));
      },
      setActive: (id) => setS((x) => ({ ...x, activeId: id })),
      updateCompany: (id, patch) =>
        setS((x) => ({
          ...x,
          companies: x.companies.map((c) => {
            if (c.id !== id) return c;
            const next = { ...c, ...patch };
            next.primary = next.palettes[0].primary;
            next.secondary = next.palettes[0].secondary;
            return { ...next, gist: buildGist(next) };
          }),
        })),
      // Removes the company and every pod that belongs to it.
      deleteCompany: (id) =>
        setS((x) => {
          const companies = x.companies.filter((c) => c.id !== id);
          return {
            ...x,
            companies,
            pods: x.pods.filter((p) => p.companyId !== id),
            activeId: x.activeId === id ? (companies[0]?.id ?? null) : x.activeId,
          };
        }),
      createPod: ({ name, objective, agents }, roles) => {
        const id = uid();
        const pod: Pod = {
          id,
          companyId: s.activeId!,
          name,
          objective,
          agents,
          tasks: buildPlan(agents, roles),
          deliverables: [],
          activity: [
            say(POD_MANAGER.name, `read the Company Brain and planned ${agents.length + 2} tasks`),
            say("You", `created the pod with the objective “${objective}”`),
          ],
          paused: false,
          at: now(),
        };
        setS((x) => ({ ...x, pods: [pod, ...x.pods] }));
        return id;
      },
      decide: (podId, taskId, decision) =>
        mapPod(podId, (pod) => {
          const t = pod.tasks.find((x) => x.id === taskId);
          if (!t) return pod;
          if (decision === "approve") {
            const done = finish(pod, t);
            return { ...done, activity: [say("You", `approved “${t.title}”`), ...done.activity] };
          }
          return {
            ...pod,
            tasks: pod.tasks.map((x) =>
              x.id === taskId
                ? { ...x, status: decision === "reject" ? "Rejected" : "Planned" }
                : x,
            ),
            activity: [
              say(
                "You",
                decision === "reject"
                  ? `rejected “${t.title}”`
                  : `requested changes on “${t.title}”`,
              ),
              ...pod.activity,
            ],
          };
        }),
      togglePause: (podId) =>
        mapPod(podId, (pod) => ({
          ...pod,
          paused: !pod.paused,
          activity: [say("You", pod.paused ? "resumed the pod" : "paused the pod"), ...pod.activity],
        })),
      setAutonomy: (podId, roleId, level) =>
        mapPod(podId, (pod) => ({
          ...pod,
          agents: pod.agents.map((a) => (a.roleId === roleId ? { ...a, autonomy: level } : a)),
        })),
      hire: (podId, role) =>
        mapPod(podId, (pod) => {
          if (pod.agents.some((a) => a.roleId === role.id)) return pod;
          const agent = { roleId: role.id, name: role.name, dept: role.dept, autonomy: 2 };
          const kind = kindFor(role.name);
          const task: Task = {
            id: uid(),
            title: role.does,
            agent: role.name,
            status: "Planned",
            kind,
            gated: !!kind && kind !== "report",
          };
          const tasks = [...pod.tasks];
          tasks.splice(Math.max(tasks.length - 1, 1), 0, task);
          return {
            ...pod,
            agents: [...pod.agents, agent],
            tasks,
            activity: [say("You", `hired ${role.name} into the pod`), ...pod.activity],
          };
        }),
      toggleKill: () => setS((x) => ({ ...x, killed: !x.killed })),
      reset: () => setS(empty),
    };
  }, [s, ready, mapPod]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const useStore = () => {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside StoreProvider");
  return c;
};

// Builds the business gist shown after onboarding. Derived only from what the owner entered.
export function buildGist(c: Omit<Company, "id" | "gist">): Gist {
  const retail = /retail|commerce|shop|store|fashion|marketplace/i.test(c.industry + c.about);
  const chunks = c.docs.reduce((n, x) => n + x.chunks, 0);
  return {
    summary: `${c.name} is a ${c.industry.toLowerCase()} business${
      c.size ? ` with ${c.size.toLowerCase()}` : ""
    }${c.website ? `, operating at ${c.website}` : ""}. ${c.about.trim()}`,
    voice: `${c.tone || "Not set"}${c.tagline ? ` — “${c.tagline}”` : ""}`,
    facts: [
      `${c.docs.length} document${c.docs.length === 1 ? "" : "s"} read and indexed into ${chunks} knowledge chunks`,
      `${c.palettes.length} colour combination${c.palettes.length === 1 ? "" : "s"} captured: ${c.palettes.map((p) => p.name).join(", ")}`,
      ...(c.typography ? [`Typography: ${c.typography}`] : []),
      ...(c.always ? [`Always: ${c.always}`] : []),
      ...(c.never ? [`Never: ${c.never}`] : []),
      ...(c.logo ? ["Logo on file for websites and creatives"] : []),
      "Every AI employee will follow these guidelines in all output",
    ],
    suggested: retail
      ? [
          {
            name: "Diwali Sale Pod",
            objective: `Plan and produce the Diwali sale campaign for ${c.name}: posters, a sale landing page, ads and emails`,
          },
          {
            name: "Customer Support Pod",
            objective: `Answer ${c.name} customer questions about orders, delivery and returns`,
          },
          {
            name: "Catalogue & SEO Pod",
            objective: `Improve ${c.name} product pages and search visibility`,
          },
        ]
      : [
          { name: "Growth Pod", objective: `Increase qualified leads for ${c.name} this quarter` },
          { name: "Customer Support Pod", objective: `Resolve routine ${c.name} customer questions faster` },
          { name: "Operations Pod", objective: `Prepare a weekly business report for ${c.name}` },
        ],
  };
}

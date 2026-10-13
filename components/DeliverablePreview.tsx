import type { Company, Deliverable, Pod } from "@/lib/store";

// Sample renderings of what an employee delivers, styled with the company's own brand colours.
export function DeliverablePreview({
  d,
  pod,
  company,
  large,
}: {
  d: Deliverable;
  pod: Pod;
  company: Company;
  large?: boolean;
}) {
  const { primary, secondary, name, tagline } = company;
  const headline = pod.name.replace(/ Pod$/i, "");
  const h = large ? "min-h-[440px]" : "h-44";

  if (d.kind === "poster" || d.kind === "social") {
    return (
      <div
        className={`${h} flex flex-col justify-between overflow-hidden rounded-lg p-5`}
        style={{ background: primary, color: "#fff" }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">{name}</span>
        <div>
          <div className={`${large ? "text-5xl" : "text-xl"} font-semibold leading-tight tracking-tight`}>
            {headline}
          </div>
          {large && <p className="mt-3 max-w-sm text-sm opacity-85">{tagline || pod.objective}</p>}
        </div>
        <span
          className="self-start rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: secondary, color: "#111" }}
        >
          {d.kind === "poster" ? "Sale is live" : "Shop now"}
        </span>
      </div>
    );
  }

  if (d.kind === "page") {
    return (
      <div className={`${h} flex flex-col overflow-hidden rounded-lg border border-line bg-white`}>
        <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
          <i className="h-2 w-2 rounded-full bg-line" />
          <i className="h-2 w-2 rounded-full bg-line" />
          <span className="ml-2 truncate font-mono text-[10px] text-muted">
            {company.website || "yourcompany.com"}/{headline.toLowerCase().replace(/\s+/g, "-")}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center px-5 py-4" style={{ background: primary, color: "#fff" }}>
          <div className={`${large ? "text-4xl" : "text-base"} font-semibold tracking-tight`}>{headline}</div>
          {large && <p className="mt-2 max-w-md text-sm opacity-85">{tagline || pod.objective}</p>}
          <span
            className="mt-3 self-start rounded-full px-3 py-1 text-[10px] font-semibold"
            style={{ background: secondary, color: "#111" }}
          >
            Explore offers
          </span>
        </div>
        <div className={`grid grid-cols-4 gap-2 p-3 ${large ? "h-40" : "h-12"}`}>
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className="rounded bg-soft" />
          ))}
        </div>
      </div>
    );
  }

  if (d.kind === "email") {
    return (
      <div className={`${h} flex flex-col overflow-hidden rounded-lg border border-line bg-white`}>
        <div className="border-b border-line px-4 py-2 text-[11px] text-muted">
          <b className="text-ink">{name}</b> · {headline} starts now
        </div>
        <div className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-white" style={{ background: primary }}>
          {name}
        </div>
        <div className="flex-1 space-y-2 p-4">
          <i className="block h-2 w-2/3 rounded bg-soft" />
          <i className="block h-2 w-full rounded bg-soft" />
          <i className="block h-2 w-5/6 rounded bg-soft" />
          {large && (
            <>
              <i className="block h-2 w-full rounded bg-soft" />
              <i className="block h-2 w-1/2 rounded bg-soft" />
              <span className="mt-4 inline-block rounded-full px-4 py-1.5 text-[11px] font-semibold" style={{ background: secondary, color: "#111" }}>
                View the collection
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${h} overflow-hidden rounded-lg border border-line bg-white p-5`}>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted">{d.agent}</div>
      <div className={`${large ? "text-2xl" : "text-sm"} mt-1 font-semibold tracking-tight`}>{d.title}</div>
      <div className="mt-4 space-y-2">
        {(large ? [5, 6, 4, 6, 3, 5, 6, 4] : [5, 6, 4]).map((w, i) => (
          <i key={i} className="block h-2 rounded bg-soft" style={{ width: `${w * 16}%` }} />
        ))}
      </div>
      {large && (
        <p className="mt-6 text-sm text-muted">
          Objective: {pod.objective}. Findings and recommendations appear here once a real model is connected.
        </p>
      )}
    </div>
  );
}

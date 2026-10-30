export const plans = {
  starter: { name: "Starter", pods: 1, projects: 1, price: "$0", description: "Start with one real business objective." },
  founders: { name: "Founders", pods: 10, projects: 10, price: "$499/month + GST", description: "Coordinate work across your growing company." },
  enterprise: { name: "Enterprise", pods: null, projects: null, price: "Custom", description: "A tailored workforce and rollout for your organization." },
} as const;
export type PlanId = keyof typeof plans;

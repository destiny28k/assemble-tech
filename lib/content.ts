import type { BuildPart, Commitment, Service, ServiceOption, Step, ToolCard } from "./types";

// All site copy in one place, ready to move into a CMS later.

export const COMPANY = "Assemble Technologies";
export const SHEETS = 7;

export const NAV = [
  { href: "#services", label: "Services" },
  { href: "#platform", label: "Untangle" },
  { href: "#process", label: "Process" },
  { href: "#work", label: "Build yours" },
];

export const STACK = ["React", "Next.js", "Node.js", "Flutter", "Swift", "Kotlin", "Python", "PostgreSQL", "Odoo", "ERPNext", "AWS", "Azure", "Docker", "Kubernetes"];

export const SERVICES: Service[] = [
  { no: "A-01", title: "ERP systems", text: "One system for finance, inventory, sales, purchase, HR and production. Built around how your business already works, not the other way round.", tags: ["Custom ERP", "Odoo", "ERPNext", "Migration"] },
  { no: "A-02", title: "Web platforms", text: "Customer portals, dealer ordering, dashboards and websites that load fast and are easy for your team to update.", tags: ["Next.js", "Portals", "E-commerce", "CMS"] },
  { no: "A-03", title: "Mobile apps", text: "iOS and Android apps for customers, field staff and delivery teams, connected to the same data as everything else.", tags: ["Flutter", "React Native", "Swift", "Kotlin"] },
  { no: "A-04", title: "Cloud & DevOps", text: "Hosting, backups, security and monitoring set up properly, so the system stays up when your business is busiest.", tags: ["AWS", "Azure", "Docker", "CI/CD"] },
  { no: "A-05", title: "AI & automation", text: "Read invoices, route approvals, answer routine queries and forecast stock, so people spend time on decisions instead of data entry.", tags: ["Document AI", "Workflows", "Chat assistants", "Forecasting"] },
  { no: "A-06", title: "Integrations & APIs", text: "Connect your ERP to payment gateways, online stores, GST e-invoicing, banks and the tools you already pay for.", tags: ["REST", "Webhooks", "Payment gateways", "GST"] },
];

export const TOOLS: ToolCard[] = [
  { type: "XLSX · 3 versions", title: "stock_final_v7.xlsx", tone: "#CDEBD3", warn: true, module: "Inventory", chaos: [22, 30, -9], order: [18, 18] },
  { type: "Desktop app", title: "Tally (one PC only)", tone: "#E8E1F7", module: "Accounts", chaos: [70, 22, 7], order: [50, 18] },
  { type: "Chat · 47 unread", title: "WhatsApp: Sales team", tone: "#D6F5DD", warn: true, module: "Sales & CRM", chaos: [40, 64, 4], order: [82, 18] },
  { type: "Paper", title: "Purchase register", tone: "#F3E9D2", module: "Purchase", chaos: [84, 66, -6], order: [18, 50] },
  { type: "Mail · re: re: fwd", title: "PO_revised_FINAL.pdf", tone: "#DCE7FB", warn: true, module: "Approvals", chaos: [56, 40, -3], order: [82, 50] },
  { type: "Sheet", title: "Attendance March", tone: "#E4F0F7", module: "HR & Payroll", chaos: [15, 76, 8], order: [18, 82] },
  { type: "Sticky note", title: "Call supplier!!", tone: "#FFE98A", module: "Tasks", chaos: [62, 84, -10], order: [50, 82] },
  { type: "Billing PC", title: "Invoices, no stock link", tone: "#F7DCD4", warn: true, module: "Billing & GST", chaos: [31, 13, 12], order: [82, 82] },
  { type: "Phone", title: "“Is it in stock?”", tone: "#EDEDE8", module: "Core · one database", core: true, chaos: [88, 40, 5], order: [50, 50] },
];
/** Pairs of tools that keep copying data between each other, drawn as the red tangle. */
export const TANGLE: [number, number][] = [[0, 2], [1, 4], [2, 7], [3, 5], [4, 6], [5, 0], [6, 1], [7, 3], [8, 0], [8, 4], [1, 7], [2, 5], [3, 8], [6, 2]];

export const STEPS: Step[] = [
  { time: "Week 1–2", title: "Discover", text: "We sit with the people who will use the system, map how work actually flows, and agree what success looks like.", command: "assemble discover --interviews 14 --sites 3", result: "✓ 86 user stories mapped · 9 workflows documented" },
  { time: "Week 2–3", title: "Blueprint", text: "Architecture, data model and clickable screens. You approve the plan before a line of production code is written.", command: "assemble blueprint --stack next,node,postgres", result: "✓ architecture approved · 42 screens prototyped" },
  { time: "Two-week sprints", title: "Build", text: "Working software every two weeks, tested automatically, demoed to your team and adjusted from their feedback.", command: "assemble build --sprint 6/6 --test", result: "✓ 418 tests passing · demo booked for Friday" },
  { time: "Go-live", title: "Ship", text: "Data migrated, staff trained and the switch made without stopping the business.", command: "assemble ship --env production --migrate", result: "✓ 1,20,000 records migrated · zero downtime" },
  { time: "Ongoing", title: "Support", text: "Monitoring around the clock, fixes and new features under one support plan, from the same team that built it.", command: "assemble support --plan 24x7", result: "✓ 41 services monitored · all systems normal" },
];

export const COMMITMENTS: Commitment[] = [
  { value: "2", count: 2, decimals: 0, label: "weeks between working releases" },
  { value: "24/7", label: "monitoring on every system we run" },
  { value: "99.9%", count: 99.9, decimals: 1, suffix: "%", label: "uptime target in our support plans" },
  { value: "1", count: 1, decimals: 0, label: "team from first workshop to support" },
];

export const SERVICE_OPTIONS: ServiceOption[] = [
  { id: "erp", label: "ERP" },
  { id: "web", label: "Website / portal" },
  { id: "app", label: "Mobile app" },
  { id: "cloud", label: "Cloud" },
  { id: "ai", label: "AI & automation" },
  { id: "api", label: "Integrations" },
];

export const PARTS: BuildPart[] = [
  { id: "inv", no: "P-01", name: "Inventory & warehouse", weeks: 3, service: "erp", group: "ERP modules" },
  { id: "acc", no: "P-02", name: "Accounting & GST", weeks: 3, service: "erp", group: "ERP modules" },
  { id: "crm", no: "P-03", name: "Sales & CRM", weeks: 2, service: "erp", group: "ERP modules" },
  { id: "pur", no: "P-04", name: "Purchase & vendors", weeks: 2, service: "erp", group: "ERP modules" },
  { id: "hr", no: "P-05", name: "HR & payroll", weeks: 3, service: "erp", group: "ERP modules" },
  { id: "mes", no: "P-06", name: "Production floor", weeks: 4, service: "erp", group: "ERP modules" },
  { id: "web", no: "P-07", name: "Website & portal", weeks: 3, service: "web", group: "Channels" },
  { id: "app", no: "P-08", name: "Mobile app", weeks: 4, service: "app", group: "Channels" },
  { id: "ai", no: "P-09", name: "AI invoice reading", weeks: 2, service: "ai", group: "Add-ons" },
  { id: "pay", no: "P-10", name: "Payments & banks", weeks: 1, service: "api", group: "Add-ons" },
  { id: "cld", no: "P-11", name: "Cloud & monitoring", weeks: 1, service: "cloud", group: "Add-ons" },
];
export const DEFAULT_PARTS = ["inv", "acc", "crm"];

export const TITLE_BLOCK = [
  { label: "Project", value: COMPANY },
  { label: "Drawing", value: "General assembly" },
  { label: "Sheet", value: "07 / 07" },
  { label: "Revision", value: "A · 2026" },
  { label: "Status", value: "Concept for review" },
];

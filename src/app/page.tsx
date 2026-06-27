"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Zap,
  Search,
  CreditCard,
  Users,
  Receipt,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Copy,
  Check,
  Github,
  ArrowRight,
  Sparkles,
  Database,
  Webhook,
  Tags,
  Link2,
  ShoppingCart,
  Wallet,
  Banknote,
  Calculator,
  Gauge,
  Activity,
  ListChecks,
  Package,
  RefreshCw,
  FileText,
  Type,
  Layers,
  Code2,
  Bug,
  Rocket,
  ChevronRight,
  CircleDollarSign,
  UserX,
  Percent,
  Crown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import {
  stripeMcpTools,
  categories,
  categoryColors,
  type StripeMcpTool,
} from "@/lib/stripe-mcp-tools";

/* ────────────────────────────────────────────────────────────────────────────
 * Shared primitives
 * ──────────────────────────────────────────────────────────────────────── */

const GITHUB_URL = "https://github.com/stripe-mcp/stripe-mcp";
const NPM_CMD = "npm install -g stripe-mcp";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Gradient text span: violet → emerald. */
function GradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent smcp-gradient-text",
        className
      )}
    >
      {children}
    </span>
  );
}

/** Lightning-bolt logo mark in a violet→emerald gradient square. */
function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 shadow-lg shadow-violet-500/25",
        className
      )}
      aria-hidden="true"
    >
      <Zap className="h-4 w-4 text-white" fill="currentColor" />
    </span>
  );
}

/** Copy button with copied-check state + tooltip. */
function CopyButton({
  value,
  label = "Copy",
  className,
  size = "sm",
}: {
  value: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={size === "sm" ? "sm" : "default"}
          aria-label={copied ? "Copied" : label}
          onClick={() => copy(value)}
          className={cn(
            "gap-1.5 text-zinc-300 hover:text-white hover:bg-white/10",
            className
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="text-xs">{copied ? "Copied" : label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-zinc-900 border-white/10 text-zinc-100">
        {copied ? "Copied to clipboard" : "Copy to clipboard"}
      </TooltipContent>
    </Tooltip>
  );
}

/** Mono code pill (for tool names, IDs, commands). */
function MonoPill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <code
      className={cn(
        "inline-flex items-center rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 font-mono text-[11px] leading-none text-violet-200",
        className
      )}
    >
      {children}
    </code>
  );
}

/** Section wrapper with consistent vertical rhythm. */
function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("py-20 md:py-28", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

/** Animated fade-up-on-scroll wrapper. */
function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "span";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay } },
  };
  return (
    <Comp
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      className={className}
    >
      {children}
    </Comp>
  );
}

/** Eyebrow label above section headings. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-zinc-400 backdrop-blur">
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 1. Sticky nav
 * ──────────────────────────────────────────────────────────────────────── */

function Nav() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#tools", label: "Tools" },
    { href: "#analytics", label: "Analytics" },
    { href: "#quickstart", label: "Quickstart" },
    { href: "#safety", label: "Safety" },
    { href: GITHUB_URL, label: "GitHub", external: true },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-[#070710]/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Primary">
        <a href="#top" className="flex items-center gap-2.5" aria-label="stripe-mcp home">
          <LogoMark className="h-8 w-8" />
          <span className="font-mono text-base font-semibold tracking-tight text-zinc-100">
            stripe-mcp
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) =>
            l.external ? (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ) : (
              <a
                key={l.label}
                href={l.href}
                className="rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 sm:flex">
            <span className="select-none font-mono text-xs text-zinc-500">$</span>
            <code className="font-mono text-xs text-zinc-300">{NPM_CMD}</code>
            <CopyButton value={NPM_CMD} label="" className="h-6 px-1.5" />
          </div>
          <Button
            asChild
            size="sm"
            className="bg-gradient-to-r from-violet-600 to-emerald-600 text-white hover:from-violet-500 hover:to-emerald-500"
          >
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">Star on GitHub</span>
              <span className="sm:hidden">GitHub</span>
            </a>
          </Button>
        </div>
      </nav>
    </header>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 2. Hero — typewriter terminal
 * ──────────────────────────────────────────────────────────────────────── */

/** Types out a string char-by-char, then waits. Loops through a list. */
function useTypewriter(lines: string[], opts?: { typeMs?: number; holdMs?: number }) {
  const typeMs = opts?.typeMs ?? 28;
  const holdMs = opts?.holdMs ?? 1800;
  const [lineIdx, setLineIdx] = React.useState(0);
  const [text, setText] = React.useState("");
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    const current = lines[lineIdx];
    if (!current) return;
    if (text.length < current.length) {
      const t = setTimeout(() => setText(current.slice(0, text.length + 1)), typeMs);
      return () => clearTimeout(t);
    }
    setDone(true);
    const t = setTimeout(() => {
      setDone(false);
      setText("");
      setLineIdx((i) => (i + 1) % lines.length);
    }, holdMs);
    return () => clearTimeout(t);
  }, [text, lineIdx, lines, typeMs, holdMs]);

  return { text, done };
}

function HeroTerminal() {
  const { text, done } = useTypewriter(
    ["Show me my MRR and which plan is growing fastest"],
    { typeMs: 32, holdMs: 9000 }
  );
  const reduce = useReducedMotion();

  return (
    <div className="smcp-float relative">
      {/* Glow */}
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-violet-600/30 via-fuchsia-500/10 to-emerald-500/30 blur-2xl" />

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b18]/90 shadow-2xl shadow-black/60 backdrop-blur-xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-rose-500/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          <span className="ml-3 font-mono text-xs text-zinc-500">claude-desktop</span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> MCP connected
          </span>
        </div>

        {/* Conversation */}
        <div className="space-y-4 p-5 text-sm">
          {/* User message */}
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-zinc-300">
              you
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-zinc-200">
              <span className="whitespace-pre-wrap break-words">
                {reduce ? "Show me my MRR and which plan is growing fastest" : text}
                {!done && !reduce && <span className="smcp-caret text-violet-300">&nbsp;</span>}
              </span>
            </div>
          </div>

          {/* Assistant response — appears after typing finishes */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={done || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.4 }}
            className="flex items-start gap-3"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1 space-y-3 rounded-2xl rounded-tl-sm border border-violet-500/20 bg-violet-500/[0.06] px-3.5 py-2.5 text-zinc-200">
              <p className="text-zinc-300">
                Calling <MonoPill>stripe_analytics_get_mrr</MonoPill>… here&apos;s your current MRR:
              </p>

              {/* MRR big number */}
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-semibold text-white">$48,250</span>
                <span className="text-xs text-zinc-400">/mo</span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  <TrendingUp className="h-3 w-3" /> +12.4% MoM
                </span>
              </div>

              {/* By-plan mini bar chart */}
              <div className="space-y-2 rounded-lg border border-white/5 bg-black/30 p-3">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-zinc-500">
                  <span>MRR by plan</span>
                  <span>last 6 mo</span>
                </div>
                {[
                  { plan: "Enterprise", mrr: "$22,000", w: "w-[92%]", color: "from-violet-500 to-fuchsia-500" },
                  { plan: "Pro", mrr: "$18,400", w: "w-[76%]", color: "from-violet-500 to-emerald-500" },
                  { plan: "Starter", mrr: "$5,850", w: "w-[34%]", color: "from-emerald-500 to-teal-500" },
                  { plan: "Free → paid", mrr: "$2,000", w: "w-[12%]", color: "from-amber-400 to-amber-500" },
                ].map((row) => (
                  <div key={row.plan} className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-xs text-zinc-400">{row.plan}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                      <div className={cn("h-full rounded-full bg-gradient-to-r", row.color, row.w)} />
                    </div>
                    <span className="w-16 shrink-0 text-right font-mono text-[11px] text-zinc-300">{row.mrr}</span>
                  </div>
                ))}
              </div>

              {/* Top customer */}
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/30 p-3">
                <Crown className="h-4 w-4 shrink-0 text-amber-400" />
                <span className="text-xs text-zinc-400">
                  Fastest-growing plan: <span className="font-semibold text-zinc-100">Pro</span> (+18% MoM).
                </span>
                <span className="ml-auto font-mono text-[11px] text-zinc-500">top: cus_AcmeCorp</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      {/* Background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-[36rem] w-[36rem] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-24 h-[34rem] w-[34rem] rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: copy */}
          <div>
            <Reveal>
              <Eyebrow>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                v1.0.0 · MIT · MCP Compatible
              </Eyebrow>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
                The most complete MCP server for <GradientText>Stripe</GradientText>.
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">
                Manage your entire Stripe account — customers, subscriptions, invoices, and
                analytics — with natural language. <span className="font-semibold text-zinc-200">79 tools.</span>{" "}
                <span className="font-semibold text-zinc-200">One command.</span> Works with Claude,
                Cursor, Windsurf.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-6 flex flex-wrap gap-2">
                {["npm v1.0.0", "MIT", "MCP Compatible", "TypeScript"].map((b) => (
                  <Badge
                    key={b}
                    variant="outline"
                    className="border-white/10 bg-white/[0.03] text-zinc-300 backdrop-blur"
                  >
                    {b}
                  </Badge>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-emerald-600 text-white hover:from-violet-500 hover:to-emerald-500"
                >
                  <a href="#quickstart">
                    <Rocket className="h-4 w-4" /> Quickstart
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/15 bg-white/[0.03] text-zinc-100 hover:bg-white/[0.08] hover:text-white"
                >
                  <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" /> View on GitHub
                  </a>
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Right: terminal */}
          <Reveal delay={0.2} className="lg:pl-4">
            <HeroTerminal />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 3. Stats strip
 * ──────────────────────────────────────────────────────────────────────── */

function StatsStrip() {
  const stats = [
    { icon: Zap, label: "Tools", value: "79" },
    { icon: Layers, label: "Categories", value: "19" },
    { icon: Rocket, label: "Install", value: "1-Command" },
    { icon: ShieldCheck, label: "Servers Required", value: "0" },
  ];
  return (
    <div className="border-y border-white/5 bg-white/[0.02]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/5 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.05}>
            <div className="flex items-center gap-3 px-2 py-6 sm:px-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10 text-violet-300">
                <s.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-xl font-semibold text-white sm:text-2xl">{s.value}</div>
                <div className="text-xs text-zinc-500">{s.label}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 4. Compatible with
 * ──────────────────────────────────────────────────────────────────────── */

function CompatibleWith() {
  const clients = [
    { name: "Claude Desktop", note: "Anthropic" },
    { name: "Cursor", note: "AI IDE" },
    { name: "Windsurf", note: "Codeium" },
    { name: "Any MCP client", note: "stdio" },
  ];
  return (
    <Section className="py-14 md:py-16">
      <Reveal>
        <p className="text-center text-xs uppercase tracking-[0.2em] text-zinc-500">
          Works with every MCP-compatible client
        </p>
      </Reveal>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {clients.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.05}>
            <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur transition-colors hover:border-violet-400/40">
              <Check className="h-4 w-4 text-emerald-400" />
              <div className="text-left">
                <div className="text-sm font-medium text-zinc-100">{c.name}</div>
                <div className="text-[10px] text-zinc-500">{c.note}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 5. Quickstart — 3 steps
 * ──────────────────────────────────────────────────────────────────────── */

const CLAUDE_CONFIG_JSON = `{
  "mcpServers": {
    "stripe": {
      "command": "stripe-mcp",
      "env": { "STRIPE_SECRET_KEY": "sk_test_..." }
    }
  }
}`;

function Quickstart() {
  const steps = [
    {
      n: "01",
      title: "Install",
      desc: "Globally install the stripe-mcp CLI.",
      code: "npm install -g stripe-mcp",
      lang: "bash",
    },
    {
      n: "02",
      title: "Set your key",
      desc: "Export your Stripe secret key. Test mode strongly recommended.",
      code: "export STRIPE_SECRET_KEY=sk_test_...",
      lang: "bash",
    },
  ];

  return (
    <Section id="quickstart">
      <Reveal>
        <Eyebrow>
          <Terminal className="h-3.5 w-3.5 text-violet-300" /> Quickstart
        </Eyebrow>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
          Running in <GradientText>under a minute</GradientText>.
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Three steps. No servers. No Docker. The MCP server runs locally over stdio — your
          Stripe key never leaves your machine.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.08}>
            <div className="group relative h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition-all hover:border-violet-400/40 hover:bg-white/[0.05]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-violet-300">{s.n}</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                  {s.lang}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-1 text-sm text-zinc-400">{s.desc}</p>
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2.5">
                <span className="select-none font-mono text-xs text-zinc-500">$</span>
                <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-emerald-300 smcp-scrollbar">
                  {s.code}
                </code>
                <CopyButton value={s.code} label="" className="h-6 px-1.5" />
              </div>
            </div>
          </Reveal>
        ))}

        {/* Step 3 — wider JSON config card */}
        <Reveal delay={0.16} className="lg:col-span-2">
          <div className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition-all hover:border-violet-400/40 hover:bg-white/[0.05]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-violet-300">03</span>
                <h3 className="text-lg font-semibold text-white">
                  Add it to{" "}
                  <code className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-sm text-zinc-200">
                    claude_desktop_config.json
                  </code>
                </h3>
              </div>
              <CopyButton value={CLAUDE_CONFIG_JSON} label="Copy JSON" />
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              The same snippet works for Cursor and Windsurf — just drop it in their MCP config.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-black/50 p-4 font-mono text-xs leading-relaxed text-zinc-200 smcp-scrollbar">
{`{
  "mcpServers": {
    "stripe": {
      "command": "stripe-mcp",
      "env": { "STRIPE_SECRET_KEY": "sk_test_..." }
    }
  }
}`}
            </pre>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 6. Tools table — searchable + filterable
 * ──────────────────────────────────────────────────────────────────────── */

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Customers: Users,
  Products: Package,
  Prices: Tags,
  Subscriptions: RefreshCw,
  Invoices: Receipt,
  "Payment Intents": CreditCard,
  Refunds: RefreshCw,
  Disputes: AlertTriangle,
  Webhooks: Webhook,
  Coupons: Tags,
  "Promotion Codes": Tags,
  "Payment Links": Link2,
  Checkout: ShoppingCart,
  "Billing Portal": ShoppingCart,
  Balance: Wallet,
  Payouts: Banknote,
  Tax: Calculator,
  Meters: Gauge,
  Analytics: Activity,
};

function ToolsTable() {
  const [query, setQuery] = React.useState("");
  const [activeCat, setActiveCat] = React.useState<string>("All");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return stripeMcpTools.filter((t) => {
      const catOk = activeCat === "All" || t.category === activeCat;
      const qOk =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.examplePrompt.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [query, activeCat]);

  return (
    <Section id="tools">
      <Reveal>
        <Eyebrow>
          <ListChecks className="h-3.5 w-3.5 text-violet-300" /> All 79 tools
        </Eyebrow>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
          One server. <GradientText>Seventy-nine tools.</GradientText>
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Every Stripe resource, mapped to a tool. Search, filter by category, and see a realistic
          prompt for each one.
        </p>
      </Reveal>

      {/* Search + filters */}
      <Reveal delay={0.05}>
        <div className="mt-10 space-y-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools, e.g. 'refund', 'MRR', 'cus_'…"
              aria-label="Search tools"
              className="h-11 border-white/10 bg-white/[0.03] pl-9 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-violet-400/60"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <CategoryChip
              label="All"
              count={stripeMcpTools.length}
              active={activeCat === "All"}
              onClick={() => setActiveCat("All")}
            />
            {categories.map((c) => (
              <CategoryChip
                key={c}
                label={c}
                count={stripeMcpTools.filter((t) => t.category === c).length}
                active={activeCat === c}
                onClick={() => setActiveCat(c)}
              />
            ))}
          </div>
        </div>
      </Reveal>

      {/* Table */}
      <Reveal delay={0.1}>
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-3">
            <span className="text-xs text-zinc-400">
              Showing <span className="font-semibold text-zinc-100">{filtered.length}</span> of{" "}
              {stripeMcpTools.length} tools
            </span>
            {activeCat !== "All" && (
              <button
                onClick={() => setActiveCat("All")}
                className="text-xs text-violet-300 hover:text-violet-200"
              >
                Clear filter ✕
              </button>
            )}
          </div>

          {/* Mobile + desktop: a horizontally scrollable table */}
          <div className="max-h-[36rem] overflow-auto smcp-scrollbar">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#0b0b18]/95 backdrop-blur">
                <tr className="text-[11px] uppercase tracking-wide text-zinc-500">
                  <th className="px-4 py-3 font-medium">Tool</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">What it does</th>
                  <th className="px-4 py-3 font-medium">Example prompt</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <ToolRow key={t.name} tool={t} zebra={i % 2 === 0} />
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center text-sm text-zinc-500">
                      No tools match <span className="font-mono text-zinc-300">“{query}”</span>.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function CategoryChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const colors = label === "All"
    ? { text: "text-zinc-200", bg: "bg-white/[0.06]", border: "border-white/15", dot: "bg-zinc-300" }
    : categoryColors[label] ?? { text: "text-zinc-300", bg: "bg-white/5", border: "border-white/10", dot: "bg-zinc-400" };
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? cn(colors.bg, colors.border, colors.text, "shadow-sm")
          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
      {label}
      <span className="rounded-full bg-black/30 px-1.5 py-0.5 text-[10px] text-zinc-400">{count}</span>
    </button>
  );
}

function ToolRow({ tool, zebra }: { tool: StripeMcpTool; zebra: boolean }) {
  const Icon = CATEGORY_ICON[tool.category] ?? Code2;
  const colors = categoryColors[tool.category];
  return (
    <tr
      className={cn(
        "border-t border-white/5 transition-colors hover:bg-white/[0.03]",
        zebra && "bg-white/[0.015]"
      )}
    >
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-2">
          <span className={cn("flex h-7 w-7 items-center justify-center rounded-md border", colors.bg, colors.border, colors.text)}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <code className="font-mono text-xs text-zinc-200">{tool.name}</code>
        </div>
      </td>
      <td className="px-4 py-3 align-top">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium", colors.bg, colors.border, colors.text)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
          {tool.category}
        </span>
      </td>
      <td className="px-4 py-3 align-top text-sm text-zinc-300">{tool.description}</td>
      <td className="px-4 py-3 align-top">
        <p className="max-w-sm text-xs italic text-zinc-400">“{tool.examplePrompt}”</p>
      </td>
    </tr>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 7. Analytics spotlight — the crown jewel
 * ──────────────────────────────────────────────────────────────────────── */

function AnalyticsSpotlight() {
  return (
    <Section id="analytics">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-500/[0.08] via-transparent to-emerald-500/[0.08] p-8 md:p-12">
          {/* Glow border */}
          <div aria-hidden className="pointer-events-none absolute -inset-px -z-10 rounded-3xl bg-gradient-to-br from-violet-500/40 via-transparent to-emerald-500/40 blur-md" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="flex flex-col items-start gap-3">
            <Eyebrow>
              <Crown className="h-3.5 w-3.5 text-amber-300" /> Crown jewel
            </Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Analytics that <GradientText>no other Stripe MCP has</GradientText>.
            </h2>
            <p className="max-w-2xl text-zinc-400">
              Five analytics tools compute real metrics client-side from your live Stripe data — no
              data warehouse, no Stripe Sigma, no SQL. Just ask.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <MrrCard />
            <ChurnCard />
            <RevenueSummaryCard />
            <TopCustomersCard />
            <FailedPaymentsCard />
            <CtaCard />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function AnalyticsCardShell({
  icon: Icon,
  title,
  tool,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tool: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group flex flex-col rounded-2xl border border-white/10 bg-[#0b0b18]/60 p-5 backdrop-blur transition-all hover:border-violet-400/40 hover:bg-white/[0.05]",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10 text-violet-300">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <code className="font-mono text-[10px] text-zinc-500">{tool}</code>
        </div>
      </div>
      <div className="mt-4 flex-1">{children}</div>
    </div>
  );
}

function MrrCard() {
  return (
    <AnalyticsCardShell icon={TrendingUp} title="MRR" tool="stripe_analytics_get_mrr">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-semibold text-white">$48,250</span>
        <span className="text-xs text-zinc-400">/mo</span>
      </div>
      <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
        <TrendingUp className="h-3 w-3" /> +12.4% MoM
      </div>
      <div className="mt-4 flex h-16 items-end gap-1.5">
        {[40, 52, 48, 60, 68, 72, 84, 92].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-violet-600/70 to-emerald-500/70"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        Sums every active subscription item, grouped by plan.
      </p>
    </AnalyticsCardShell>
  );
}

function ChurnCard() {
  return (
    <AnalyticsCardShell icon={TrendingDown} title="Churn Rate" tool="stripe_analytics_get_churn_rate">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-semibold text-white">2.4%</span>
        <span className="text-xs text-zinc-400">/mo</span>
      </div>
      <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-300">
        <TrendingDown className="h-3 w-3" /> down from 3.1%
      </div>
      {/* downward sparkline */}
      <svg viewBox="0 0 120 40" className="mt-4 h-10 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="churnGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(244,63,94,0.35)" />
            <stop offset="100%" stopColor="rgba(244,63,94,0)" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="rgba(244,63,94,0.8)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points="0,8 20,12 40,10 60,18 80,22 100,28 120,32"
        />
        <polygon
          fill="url(#churnGrad)"
          points="0,8 20,12 40,10 60,18 80,22 100,28 120,32 120,40 0,40"
        />
      </svg>
      <p className="mt-3 text-xs text-zinc-500">
        Canceled subs ÷ active-at-period-start, over any window.
      </p>
    </AnalyticsCardShell>
  );
}

function RevenueSummaryCard() {
  return (
    <AnalyticsCardShell icon={CircleDollarSign} title="Revenue Summary" tool="stripe_analytics_get_revenue_summary">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-white/5 bg-black/30 py-2">
          <div className="font-mono text-sm font-semibold text-emerald-300">$182k</div>
          <div className="text-[9px] uppercase text-zinc-500">Gross</div>
        </div>
        <div className="rounded-lg border border-white/5 bg-black/30 py-2">
          <div className="font-mono text-sm font-semibold text-white">$174k</div>
          <div className="text-[9px] uppercase text-zinc-500">Net</div>
        </div>
        <div className="rounded-lg border border-white/5 bg-black/30 py-2">
          <div className="font-mono text-sm font-semibold text-rose-300">-$5.1k</div>
          <div className="text-[9px] uppercase text-zinc-500">Refunds</div>
        </div>
      </div>
      <svg viewBox="0 0 120 36" className="mt-4 h-9 w-full" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="rgba(16,185,129,0.85)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points="0,28 15,22 30,24 45,18 60,20 75,14 90,12 105,8 120,6"
        />
      </svg>
      <p className="mt-3 text-xs text-zinc-500">
        Gross, net, refunds, fees — with a daily series.
      </p>
    </AnalyticsCardShell>
  );
}

function TopCustomersCard() {
  const rows = [
    { name: "Acme Corp", ltv: "$48,200" },
    { name: "Globex", ltv: "$31,900" },
    { name: "Initech", ltv: "$22,400" },
  ];
  return (
    <AnalyticsCardShell icon={Users} title="Top Customers" tool="stripe_analytics_get_top_customers">
      <ul className="space-y-2">
        {rows.map((r, i) => (
          <li key={r.name} className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/30 px-2.5 py-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 text-[10px] font-bold text-white">
              {i + 1}
            </span>
            <span className="text-xs text-zinc-200">{r.name}</span>
            <span className="ml-auto font-mono text-[11px] text-emerald-300">{r.ltv}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-zinc-500">
        Ranked by lifetime gross revenue — name, email, total spent.
      </p>
    </AnalyticsCardShell>
  );
}

function FailedPaymentsCard() {
  return (
    <AnalyticsCardShell icon={AlertTriangle} title="Failed Payments" tool="stripe_analytics_get_failed_payments_report">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-semibold text-white">14</span>
        <span className="text-xs text-zinc-400">in last 30 days</span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {[
          { reason: "card_declined", n: 7 },
          { reason: "insufficient_funds", n: 4 },
          { reason: "expired_card", n: 3 },
        ].map((r) => (
          <li key={r.reason} className="flex items-center gap-2 text-xs">
            <span className="font-mono text-amber-300">{r.reason}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500"
                style={{ width: `${(r.n / 7) * 100}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-zinc-400">{r.n}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-zinc-500">
        Every failed attempt with its reason and affected customer.
      </p>
    </AnalyticsCardShell>
  );
}

function CtaCard() {
  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/15 to-emerald-500/15 p-5">
      <div>
        <Sparkles className="h-6 w-6 text-violet-300" />
        <h3 className="mt-3 text-lg font-semibold text-white">
          No warehouse. No SQL. No Sigma.
        </h3>
        <p className="mt-2 text-sm text-zinc-300">
          The five analytics tools compute their answers from the Stripe API in real time, right
          inside the MCP server. Nothing else to install.
        </p>
      </div>
      <Button
        asChild
        className="mt-5 bg-gradient-to-r from-violet-600 to-emerald-600 text-white hover:from-violet-500 hover:to-emerald-500"
      >
        <a href="#quickstart">
          Try it now <ArrowRight className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 8. Example prompts — chat bubble grid
 * ──────────────────────────────────────────────────────────────────────── */

function ExamplePrompts() {
  const prompts = [
    {
      tag: "Analytics",
      text: "Show me my MRR and which plan is growing fastest",
    },
    {
      tag: "Subscriptions",
      text: "Cancel the subscription for john@example.com and refund his last invoice",
    },
    {
      tag: "Payments",
      text: "List all failed payments from the last 30 days with failure reasons",
    },
    {
      tag: "Coupons",
      text: "Create a 3-month 50% off coupon and generate a payment link for the Pro plan",
    },
    {
      tag: "Customers",
      text: "Who are my top 10 customers by lifetime value?",
    },
    {
      tag: "Invoices",
      text: "Find all open invoices over $1,000 and email a reminder to each customer",
    },
  ];
  return (
    <Section id="prompts">
      <Reveal>
        <Eyebrow>
          <Type className="h-3.5 w-3.5 text-violet-300" /> Just ask
        </Eyebrow>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
          Prompts your AI assistant <GradientText>actually understands</GradientText>.
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          stripe-mcp exposes rich, typed tools — so the model picks the right one, fills the right
          params, and shows you what it did.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((p, i) => (
          <Reveal key={p.text} delay={i * 0.05}>
            <div className="group flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-white/[0.05]">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-zinc-300">
                  you
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-400">
                  {p.tag}
                </span>
              </div>
              <p className="text-sm text-zinc-200">“{p.text}”</p>
              <div className="mt-auto flex items-center gap-1.5 text-xs text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100">
                <Sparkles className="h-3 w-3 text-violet-300" /> Claude routes this to the right tool
                automatically.
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 9. Safety — read-only vs destructive + live/test banner
 * ──────────────────────────────────────────────────────────────────────── */

function Safety() {
  const readOnly = [
    "stripe_customers_get / list / search",
    "stripe_products_get / list",
    "stripe_prices_get / list",
    "stripe_subscriptions_get / list / search",
    "stripe_invoices_get / list",
    "stripe_payment_intents_get / list",
    "stripe_refunds_get / list",
    "stripe_disputes_get / list",
    "stripe_webhooks_get / list",
    "stripe_balance_get / list_transactions",
    "stripe_analytics_* (all 5)",
  ];
  const destructive = [
    "stripe_customers_create / update / delete",
    "stripe_products_create / update / archive",
    "stripe_subscriptions_create / update / cancel / pause / resume",
    "stripe_invoices_pay / void / finalize / send",
    "stripe_payment_intents_create / confirm / cancel",
    "stripe_refunds_create",
    "stripe_disputes_update / close",
    "stripe_webhooks_create / update / delete",
    "stripe_payouts_create / cancel",
  ];

  return (
    <Section id="safety">
      <Reveal>
        <Eyebrow>
          <Shield className="h-3.5 w-3.5 text-emerald-300" /> Safety
        </Eyebrow>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
          Built to be <GradientText>safe by default</GradientText>.
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Every tool is classified. Read-only tools can be run freely; mutating tools always print
          what they&apos;re about to do. And the server tells you — loudly — when you&apos;re in live
          mode.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {/* Read-only */}
        <Reveal>
          <div className="h-full rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Read-only · safe</h3>
              <span className="ml-auto rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                ~38 tools
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              <code className="font-mono text-emerald-300">get</code> /{" "}
              <code className="font-mono text-emerald-300">list</code> /{" "}
              <code className="font-mono text-emerald-300">search</code> /{" "}
              <code className="font-mono text-emerald-300">analytics</code> /{" "}
              <code className="font-mono text-emerald-300">balance</code>. Never touches state.
            </p>
            <ul className="mt-4 max-h-72 space-y-1.5 overflow-y-auto smcp-scrollbar pr-1">
              {readOnly.map((t) => (
                <li key={t} className="flex items-start gap-2 text-xs text-zinc-300">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <code className="font-mono text-[11px] text-zinc-300">{t}</code>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Destructive */}
        <Reveal delay={0.08}>
          <div className="h-full rounded-2xl border border-amber-500/30 bg-amber-500/[0.05] p-6">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Mutating · be careful</h3>
              <span className="ml-auto rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                ~41 tools
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              <code className="font-mono text-amber-300">create</code> /{" "}
              <code className="font-mono text-amber-300">update</code> /{" "}
              <code className="font-mono text-amber-300">delete</code> /{" "}
              <code className="font-mono text-amber-300">cancel</code> /{" "}
              <code className="font-mono text-amber-300">refund</code> /{" "}
              <code className="font-mono text-amber-300">void</code>.
            </p>
            <ul className="mt-4 max-h-72 space-y-1.5 overflow-y-auto smcp-scrollbar pr-1">
              {destructive.map((t) => (
                <li key={t} className="flex items-start gap-2 text-xs text-zinc-300">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <code className="font-mono text-[11px] text-zinc-300">{t}</code>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      {/* Live vs test banner */}
      <Reveal delay={0.12}>
        <div className="mt-5 overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/[0.05]">
          <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-white">Live mode is loud.</h3>
                <p className="mt-1 max-w-xl text-sm text-zinc-400">
                  stripe-mcp detects your key prefix — <MonoPill>sk_test_</MonoPill> (safe) vs{" "}
                  <MonoPill className="border-amber-500/30 bg-amber-500/10 text-amber-200">sk_live_</MonoPill>{" "}
                  (real money). A warning prints on startup in live mode so you always know which
                  mode you&apos;re in.
                </p>
              </div>
            </div>

            {/* Mock startup banner */}
            <pre className="min-w-[20rem] overflow-x-auto rounded-lg border border-white/10 bg-black/50 p-3 font-mono text-[11px] leading-relaxed smcp-scrollbar">
{`⚡ stripe-mcp v1.0.0 starting…
✓ 79 tools registered
✓ stdio transport ready

`}<span className="text-amber-300">⚠  LIVE MODE — sk_live_ detected</span>{`
   real charges will be created.
   press Ctrl+C to abort.`}
            </pre>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 10. Features grid — why it's built this way
 * ──────────────────────────────────────────────────────────────────────── */

function Features() {
  const features = [
    { icon: Code2, title: "ESM-first", desc: "Modern, tree-shakeable, native TypeScript." },
    { icon: ShieldCheck, title: "Zod-validated inputs", desc: "Every tool's args are parsed and typed." },
    { icon: RefreshCw, title: "Auto-pagination", desc: "List endpoints follow cursors automatically." },
    { icon: FileText, title: "Typed errors + docs links", desc: "Errors include a Stripe docs URL." },
    { icon: CircleDollarSign, title: "Formatted money", desc: "Cents plus “$12.50” in every response." },
    { icon: Type, title: "Dual date formats", desc: "Unix timestamps + ISO strings, always." },
    { icon: Bug, title: "Mocked tests", desc: "No Stripe account needed to run the suite." },
    { icon: Rocket, title: "1-command install", desc: "`npm i -g stripe-mcp` and you're done." },
  ];
  return (
    <Section id="features">
      <Reveal>
        <Eyebrow>
          <Sparkles className="h-3.5 w-3.5 text-violet-300" /> Engineering
        </Eyebrow>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
          Why it&apos;s built <GradientText>this way</GradientText>.
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Small, opinionated choices that make the server feel polished instead of a thin wrapper.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.04}>
            <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-white/[0.05]">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10 text-violet-300">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-white">{f.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 11. Final CTA
 * ──────────────────────────────────────────────────────────────────────── */

function FinalCta() {
  return (
    <Section className="py-16 md:py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 via-fuchsia-500/10 to-emerald-600/20 p-8 text-center md:p-16">
          <div aria-hidden className="pointer-events-none absolute -inset-px -z-10 rounded-3xl bg-gradient-to-br from-violet-500/40 via-transparent to-emerald-500/40 blur-md" />
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/30 blur-3xl" />

          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            Ship payments with your <GradientText>AI assistant today</GradientText>.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-300">
            One command. 79 tools. Zero servers. Open source under the MIT license.
          </p>

          <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-xl border border-white/15 bg-black/50 px-3 py-2.5">
            <span className="select-none font-mono text-xs text-zinc-500">$</span>
            <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-emerald-300 smcp-scrollbar">
              {NPM_CMD}
            </code>
            <CopyButton value={NPM_CMD} label="Copy" />
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-emerald-600 text-white hover:from-violet-500 hover:to-emerald-500"
            >
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" /> Star on GitHub
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/15 bg-white/[0.03] text-zinc-100 hover:bg-white/[0.08] hover:text-white"
            >
              <a href="#quickstart">
                Read the quickstart <ChevronRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 12. Footer (sticky bottom)
 * ──────────────────────────────────────────────────────────────────────── */

function Footer() {
  const toolAnchors = categories.slice(0, 6);
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#06060e]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="#top" className="flex items-center gap-2.5" aria-label="stripe-mcp home">
              <LogoMark className="h-8 w-8" />
              <span className="font-mono text-base font-semibold text-zinc-100">stripe-mcp</span>
            </a>
            <p className="mt-3 text-sm text-zinc-500">
              The most complete open-source MCP server for Stripe. 79 tools, one command.
            </p>
            <Badge variant="outline" className="mt-4 border-white/10 bg-white/[0.03] text-zinc-400">
              MIT Licensed
            </Badge>
          </div>

          {/* Tools */}
          <nav aria-label="Tools">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tools</h3>
            <ul className="mt-4 space-y-2">
              {toolAnchors.map((c) => (
                <li key={c}>
                  <a href="#tools" className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">
                    {c}
                  </a>
                </li>
              ))}
              <li>
                <a href="#tools" className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">
                  + 13 more categories
                </a>
              </li>
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#quickstart" className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">Quickstart</a></li>
              <li><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">GitHub</a></li>
              <li><a href="https://www.npmjs.com/package/stripe-mcp" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">npm</a></li>
              <li><a href="https://docs.stripe.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">Stripe docs</a></li>
              <li><a href="https://modelcontextprotocol.io/" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">MCP spec</a></li>
            </ul>
          </nav>

          {/* Community */}
          <nav aria-label="Community">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Community</h3>
            <ul className="mt-4 space-y-2">
              <li><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">Contributing</a></li>
              <li><a href={`${GITHUB_URL}/issues`} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">Issues</a></li>
              <li><a href={`${GITHUB_URL}/discussions`} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">Discussions</a></li>
              <li><a href="#prompts" className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">Example prompts</a></li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 sm:flex-row">
          <p className="text-xs text-zinc-600">
            MIT License · Built for GitHub virality
          </p>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Zap className="h-3.5 w-3.5 text-violet-400" fill="currentColor" />
            <span className="font-mono">stripe-mcp</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070710] text-zinc-100">
      {/* Page wrapper ensures the footer sticks to the bottom on short content. */}
      <div className="flex min-h-screen flex-col">
        <TooltipProvider delayDuration={200}>
          <Nav />
          <main className="flex-1">
            <Hero />
            <StatsStrip />
            <CompatibleWith />
            <Quickstart />
            <ToolsTable />
            <AnalyticsSpotlight />
            <ExamplePrompts />
            <Safety />
            <Features />
            <FinalCta />
          </main>
          <Footer />
        </TooltipProvider>
      </div>
    </div>
  );
}

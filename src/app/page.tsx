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
  // New icons added in 2-rev:
  Cable,
  Play,
  Loader2,
  ChevronDown,
  CircleDot,
  Circle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
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
    { href: "#how-it-works", label: "How it works" },
    { href: "#playground", label: "Playground" },
    { href: "#tools", label: "Tools" },
    { href: "#analytics", label: "Analytics" },
    { href: "#faq", label: "FAQ" },
    { href: "#roadmap", label: "Roadmap" },
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

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) =>
            l.external ? (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-2.5 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ) : (
              <a
                key={l.label}
                href={l.href}
                className="rounded-md px-2.5 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 md:flex">
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
 * 2. Hero — typewriter terminal (polished: more compact, bigger bars)
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
        {/* Title bar — compact */}
        <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-3.5 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2.5 font-mono text-[11px] text-zinc-500">claude-desktop</span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> MCP connected
          </span>
        </div>

        {/* Conversation — compact */}
        <div className="space-y-3 p-4 text-sm">
          {/* User message */}
          <div className="flex items-start gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[9px] font-semibold text-zinc-300">
              you
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.03] px-3 py-2 text-zinc-200">
              <span className="whitespace-pre-wrap break-words text-[13px]">
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
            className="flex items-start gap-2.5"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 text-white">
              <Sparkles className="h-3 w-3" />
            </div>
            <div className="min-w-0 flex-1 space-y-2.5 rounded-2xl rounded-tl-sm border border-violet-500/20 bg-violet-500/[0.06] px-3 py-2.5 text-zinc-200">
              <p className="text-[12px] text-zinc-300">
                Calling <MonoPill>stripe_analytics_get_mrr</MonoPill>… here&apos;s your current MRR:
              </p>

              {/* MRR big number */}
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xl font-semibold text-white">$48,250</span>
                <span className="text-[11px] text-zinc-400">/mo</span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  <TrendingUp className="h-3 w-3" /> +12.4% MoM
                </span>
              </div>

              {/* By-plan mini bar chart — bigger bars, brighter track */}
              <div className="space-y-1.5 rounded-lg border border-white/5 bg-black/30 p-2.5">
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
                    <span className="w-20 shrink-0 text-[11px] text-zinc-400">{row.plan}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div className={cn("h-full rounded-full bg-gradient-to-r", row.color, row.w)} />
                    </div>
                    <span className="w-14 shrink-0 text-right font-mono text-[11px] text-zinc-300">{row.mrr}</span>
                  </div>
                ))}
              </div>

              {/* Top customer callout */}
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/30 p-2.5">
                <Crown className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span className="text-[11px] text-zinc-400">
                  Fastest-growing plan: <span className="font-semibold text-zinc-100">Pro</span> (+18% MoM).
                </span>
                <span className="ml-auto font-mono text-[10px] text-zinc-500">top: cus_AcmeCorp</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/** Filled-pill hero badge with a small colored dot per badge type. */
function HeroBadge({ label, dot, className }: { label: string; dot: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
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

            {/* Filled-pill badges with colored dots — high contrast */}
            <Reveal delay={0.18}>
              <div className="mt-6 flex flex-wrap gap-2">
                <HeroBadge
                  label="npm v1.0.0"
                  dot="bg-emerald-400"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                />
                <HeroBadge
                  label="MIT"
                  dot="bg-violet-400"
                  className="border-violet-500/30 bg-violet-500/10 text-violet-200"
                />
                <HeroBadge
                  label="MCP Compatible"
                  dot="bg-emerald-400"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                />
                <HeroBadge
                  label="TypeScript"
                  dot="bg-amber-400"
                  className="border-amber-500/30 bg-amber-500/10 text-amber-200"
                />
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
                  className="border-zinc-200/25 bg-white/[0.06] text-zinc-50 shadow-sm backdrop-blur hover:border-zinc-100/40 hover:bg-white/[0.12]"
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
 * 5. How it works (NEW)
 * ──────────────────────────────────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      icon: Terminal,
      title: "MCP Client",
      desc: "Claude, Cursor, Windsurf, or any MCP-compatible client.",
    },
    {
      icon: Cable,
      title: "stdio transport",
      desc: "JSON-RPC over the child process stdin / stdout. No HTTP.",
    },
    {
      icon: Zap,
      title: "stripe-mcp",
      desc: "A local Node process exposing all 79 typed tools.",
    },
    {
      icon: CreditCard,
      title: "Stripe API",
      desc: "Your account. Direct calls — your key never touches us.",
    },
  ];

  return (
    <Section id="how-it-works">
      <Reveal>
        <Eyebrow>
          <Cable className="h-3.5 w-3.5 text-violet-300" /> Architecture
        </Eyebrow>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
          How it <GradientText>works</GradientText>.
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          One local process. Zero servers. Your Stripe key never leaves your machine.
        </p>
      </Reveal>

      <div className="mt-12">
        {/* Desktop: horizontal flow with arrows; Mobile: vertical stack */}
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
          {steps.map((s, i) => (
            <React.Fragment key={s.title}>
              <Reveal delay={i * 0.08} className="h-full">
                <div className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10 text-violet-300">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-xs text-zinc-500">0{i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">{s.desc}</p>
                </div>
              </Reveal>

              {/* Connector — arrow on lg, vertical chevron on mobile */}
              {i < steps.length - 1 && (
                <Reveal delay={i * 0.08 + 0.04} className="flex items-center justify-center lg:py-0 py-1">
                  <div className="flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] p-2 text-violet-300">
                    <ArrowRight className="h-4 w-4 rotate-90 lg:rotate-0" />
                  </div>
                </Reveal>
              )}
            </React.Fragment>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] px-5 py-4 text-sm text-zinc-300 backdrop-blur">
            <ShieldCheck className="mr-2 inline h-4 w-4 text-emerald-400" />
            Your <MonoPill className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200">STRIPE_SECRET_KEY</MonoPill>{" "}
            is read from your local environment and sent directly to Stripe — never to us, never to the AI model provider.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 6. Quickstart — 3 steps
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
 * 7. Interactive Playground (NEW)
 * ──────────────────────────────────────────────────────────────────────── */

/** Tiny JSON syntax highlighter — keys violet, strings emerald, numbers amber. */
function highlightJson(json: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = regex.exec(json)) !== null) {
    if (m.index > last) {
      parts.push(<span key={k++}>{json.slice(last, m.index)}</span>);
    }
    if (m[1]) {
      if (m[2]) {
        parts.push(<span key={k++} className="text-violet-300">{m[1]}</span>);
        parts.push(<span key={k++} className="text-zinc-500">{m[2]}</span>);
      } else {
        parts.push(<span key={k++} className="text-emerald-300">{m[1]}</span>);
      }
    } else if (m[3]) {
      parts.push(<span key={k++} className="text-amber-300">{m[3]}</span>);
    }
    last = regex.lastIndex;
  }
  if (last < json.length) {
    parts.push(<span key={k++}>{json.slice(last)}</span>);
  }
  return parts;
}

function JsonView({ data, className }: { data: unknown; className?: string }) {
  const json = JSON.stringify(data, null, 2);
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-lg border border-white/10 bg-black/50 p-3 font-mono text-[11px] leading-relaxed smcp-scrollbar",
        className
      )}
    >
      <code>{highlightJson(json)}</code>
    </pre>
  );
}

type PlaygroundPrompt = {
  id: number;
  label: string;
  prompt: string;
  tool: string;
  ms: number;
  render: () => React.ReactNode;
};

const PLAYGROUND_PROMPTS: PlaygroundPrompt[] = [
  {
    id: 0,
    label: "Show me my MRR and which plan is growing fastest",
    prompt: "Show me my MRR and which plan is growing fastest",
    tool: "stripe_analytics_get_mrr",
    ms: 412,
    render: () => (
      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-semibold text-white">$48,250</span>
          <span className="text-xs text-zinc-400">/mo</span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            <TrendingUp className="h-3 w-3" /> +12.4% MoM
          </span>
        </div>
        <div className="space-y-1.5 rounded-lg border border-white/5 bg-black/30 p-3">
          <div className="text-[10px] uppercase tracking-wide text-zinc-500">mrr_by_plan</div>
          {[
            { plan: "Enterprise", mrr: "$22,000", w: "w-[92%]" },
            { plan: "Pro", mrr: "$18,400", w: "w-[76%]" },
            { plan: "Starter", mrr: "$5,850", w: "w-[34%]" },
            { plan: "Free → paid", mrr: "$2,000", w: "w-[12%]" },
          ].map((r) => (
            <div key={r.plan} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-[11px] text-zinc-400">{r.plan}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className={cn("h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500", r.w)} />
              </div>
              <span className="w-14 shrink-0 text-right font-mono text-[11px] text-zinc-300">{r.mrr}</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-3 text-[12px] text-zinc-200">
          <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-violet-300" />
          <span className="font-semibold">Fastest-growing: Pro</span> — +18% MoM. Top contributor{" "}
          <MonoPill>cus_AcmeCorp</MonoPill> ($5,000/mo).
        </div>
        <JsonView
          data={{
            total_mrr: "$48,250/mo",
            currency: "usd",
            active_subscriptions: 167,
            mrr_by_plan: {
              Enterprise: "$22,000",
              Pro: "$18,400",
              Starter: "$5,850",
              "Free → paid": "$2,000",
            },
            top_customers_by_mrr: [
              { customer: "cus_AcmeCorp", plan: "Enterprise", mrr: "$5,000" },
              { customer: "cus_Globex", plan: "Pro", mrr: "$980" },
              { customer: "cus_Initech", plan: "Pro", mrr: "$490" },
            ],
            fastest_growing_plan: "Pro (+18% MoM)",
          }}
        />
      </div>
    ),
  },
  {
    id: 1,
    label: "List all failed payments from the last 30 days with failure reasons",
    prompt: "List all failed payments from the last 30 days with failure reasons",
    tool: "stripe_analytics_get_failed_payments_report",
    ms: 387,
    render: () => {
      const rows = [
        { id: "ch_1Pq8", email: "alice@acme.io", amount: "$49.00", code: "card_declined", recovery: "Retry in 3 days; ask customer to update card." },
        { id: "ch_1Pq7", email: "bob@globex.com", amount: "$129.00", code: "insufficient_funds", recovery: "Retry on the 1st of next month." },
        { id: "ch_1Pq5", email: "carol@initech.io", amount: "$19.00", code: "expired_card", recovery: "Email customer to update expiry." },
        { id: "ch_1Pq3", email: "dan@startup.co", amount: "$490.00", code: "card_declined", recovery: "Do Not Honor — contact customer's bank." },
        { id: "ch_1Pq1", email: "eve@oldco.dev", amount: "$25.00", code: "incorrect_cvc", recovery: "Ask customer to re-enter CVC." },
      ];
      return (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-white">14</span>
            <span className="text-xs text-zinc-400">failed charges · last 30 days</span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-300">
              <AlertTriangle className="h-3 w-3" /> -$1,281.00
            </span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/40 smcp-scrollbar">
            <table className="w-full min-w-[520px] text-left text-[11px]">
              <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-2.5 py-2 font-medium">Charge</th>
                  <th className="px-2.5 py-2 font-medium">Customer</th>
                  <th className="px-2.5 py-2 font-medium">Amount</th>
                  <th className="px-2.5 py-2 font-medium">Decline code</th>
                  <th className="px-2.5 py-2 font-medium">Recovery</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 last:border-b-0">
                    <td className="px-2.5 py-2 font-mono text-violet-300">{r.id}</td>
                    <td className="px-2.5 py-2 text-zinc-300">{r.email}</td>
                    <td className="px-2.5 py-2 font-mono text-amber-300">{r.amount}</td>
                    <td className="px-2.5 py-2">
                      <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 font-mono text-[10px] text-rose-300">
                        {r.code}
                      </span>
                    </td>
                    <td className="px-2.5 py-2 text-zinc-400">{r.recovery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-zinc-500">
            Most common: <span className="font-mono text-rose-300">card_declined</span> (7 of 14).
            Consider Smart Retries — re-attempting on day 3 recovers ~31%.
          </p>
        </div>
      );
    },
  },
  {
    id: 2,
    label: "Who are my top 10 customers by lifetime value?",
    prompt: "Who are my top 10 customers by lifetime value?",
    tool: "stripe_analytics_get_top_customers",
    ms: 524,
    render: () => {
      const rows = [
        { rank: 1, name: "Acme Corp", email: "billing@acme.io", ltv: 48200, payments: 124 },
        { rank: 2, name: "Globex", email: "ap@globex.com", ltv: 31900, payments: 87 },
        { rank: 3, name: "Initech", email: "ops@initech.io", ltv: 22400, payments: 62 },
        { rank: 4, name: "Umbrella Inc", email: "pay@umbrella.dev", ltv: 18950, payments: 51 },
        { rank: 5, name: "Hooli", email: "fin@hooli.tech", ltv: 14200, payments: 44 },
        { rank: 6, name: "Stark Industries", email: "pepper@stark.io", ltv: 11800, payments: 38 },
        { rank: 7, name: "Wayne Enterprises", email: "lucius@wayne.co", ltv: 9450, payments: 29 },
        { rank: 8, name: "Cyberdyne", email: "mile@cyberdyne.ai", ltv: 7600, payments: 24 },
        { rank: 9, name: "Soylent Corp", email: "ops@soylent.co", ltv: 5800, payments: 19 },
        { rank: 10, name: "Massive Dynamic", email: "bell@massdyn.io", ltv: 4200, payments: 14 },
      ];
      const max = rows[0].ltv;
      return (
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-white">10</span>
            <span className="text-xs text-zinc-400">top customers by LTV · total $175,500</span>
          </div>
          <ul className="space-y-1.5">
            {rows.map((r) => (
              <li key={r.rank} className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-black/30 px-2.5 py-1.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 text-[10px] font-bold text-white">
                  {r.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[12px] font-medium text-zinc-100">{r.name}</span>
                    <span className="hidden truncate text-[10px] text-zinc-500 sm:inline">{r.email}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
                      style={{ width: `${(r.ltv / max) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono text-[11px] font-semibold text-emerald-300">${r.ltv.toLocaleString()}</div>
                  <div className="text-[9px] text-zinc-500">{r.payments} payments</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    },
  },
  {
    id: 3,
    label: "Cancel the subscription for john@example.com and refund his last invoice",
    prompt: "Cancel the subscription for john@example.com and refund his last invoice",
    tool: "stripe_subscriptions_cancel + stripe_refunds_create",
    ms: 698,
    render: () => (
      <div className="space-y-2.5 text-[12px]">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-lg font-semibold text-white">✓ Done</span>
          <span className="text-zinc-400">2 tools · 698ms total</span>
        </div>
        <ol className="space-y-2">
          <li className="flex items-start gap-2 rounded-lg border border-white/5 bg-black/30 p-2.5">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <div className="min-w-0">
              <p className="text-zinc-200">
                Found subscription <MonoPill>sub_1AbC23</MonoPill> for{" "}
                <span className="font-mono text-zinc-100">john@example.com</span> — Pro plan, $49/mo.
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-500">2025-01-15T14:31:48Z · stripe_customers_search</p>
            </div>
          </li>
          <li className="flex items-start gap-2 rounded-lg border border-white/5 bg-black/30 p-2.5">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <div className="min-w-0">
              <p className="text-zinc-200">
                Cancelled <MonoPill>sub_1AbC23</MonoPill> at period end.
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-500">2025-01-15T14:31:54Z · stripe_subscriptions_cancel</p>
            </div>
          </li>
          <li className="flex items-start gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-2.5">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <div className="min-w-0">
              <p className="text-zinc-200">
                Refunded invoice <MonoPill>in_1Xy99</MonoPill> ($49.00) →{" "}
                <MonoPill className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200">re_3Qk77</MonoPill>
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-500">2025-01-15T14:32:02Z · stripe_refunds_create</p>
            </div>
          </li>
        </ol>
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 p-2.5">
          <span className="text-zinc-400">Total refunded</span>
          <span className="font-mono text-base font-semibold text-emerald-300">$49.00</span>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    label: "Create a 3-month 50% off coupon and a payment link for the Pro plan",
    prompt: "Create a 3-month 50% off coupon and a payment link for the Pro plan",
    tool: "stripe_coupons_create + stripe_payment_links_create",
    ms: 542,
    render: () => (
      <div className="space-y-2.5 text-[12px]">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-lg font-semibold text-white">✓ Done</span>
          <span className="text-zinc-400">2 tools · 542ms total</span>
        </div>
        <ol className="space-y-2">
          <li className="flex items-start gap-2 rounded-lg border border-white/5 bg-black/30 p-2.5">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <div className="min-w-0">
              <p className="text-zinc-200">
                Created coupon <MonoPill className="border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200">50OFF3MO</MonoPill>{" "}
                — 50% off, 3 months duration (repeating).
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-500">stripe_coupons_create · id coupon_50OFF3MO</p>
            </div>
          </li>
          <li className="flex items-start gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-2.5">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <div className="min-w-0">
              <p className="text-zinc-200">
                Created payment link <MonoPill className="border-teal-500/30 bg-teal-500/10 text-teal-200">plink_1Ab9</MonoPill>{" "}
                for <span className="font-mono text-zinc-100">price_Pro_monthly</span>.
              </p>
              <a
                href="#playground"
                className="mt-1.5 inline-flex max-w-full items-center gap-1 truncate rounded-md border border-emerald-500/30 bg-black/40 px-2 py-1 font-mono text-[11px] text-emerald-300 hover:bg-black/60"
              >
                <Link2 className="h-3 w-3 shrink-0" />
                <span className="truncate">https://buy.stripe.com/test_abc123</span>
              </a>
              <p className="mt-1 text-[10px] text-zinc-500">stripe_payment_links_create · active</p>
            </div>
          </li>
        </ol>
        <JsonView
          data={{
            coupon: { id: "50OFF3MO", percent_off: 50, duration: "repeating", duration_in_months: 3 },
            payment_link: {
              id: "plink_1Ab9",
              url: "https://buy.stripe.com/test_abc123",
              price: "price_Pro_monthly",
              active: true,
            },
          }}
        />
      </div>
    ),
  },
  {
    id: 5,
    label: "What's my churn rate over the last 90 days?",
    prompt: "What's my churn rate over the last 90 days?",
    tool: "stripe_analytics_get_churn_rate",
    ms: 461,
    render: () => {
      const churned = [
        { id: "cus_OldCo", email: "founder@oldco.io", ltv: "$1,240", reason: "cancellation_requested" },
        { id: "cus_TestCo", email: "ops@testco.dev", ltv: "$840", reason: "cancellation_requested" },
        { id: "cus_Nowgone", email: "ceo@nowgone.co", ltv: "$610", reason: "payment_failed" },
        { id: "cus_Sunset", email: "billing@sunset.io", ltv: "$420", reason: "cancellation_requested" },
      ];
      return (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-white">2.4%</span>
            <span className="text-xs text-zinc-400">/90 days</span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
              <TrendingDown className="h-3 w-3" /> down from 3.1%
            </span>
          </div>
          <p className="text-[12px] text-zinc-300">
            <span className="font-semibold text-rose-300">4 of 167</span> active subscriptions at
            period start were canceled in the last 90 days.
          </p>
          <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40">
            <div className="border-b border-white/5 bg-white/[0.02] px-2.5 py-1.5 text-[10px] uppercase tracking-wide text-zinc-500">
              churned_customers
            </div>
            <ul className="divide-y divide-white/5">
              {churned.map((c) => (
                <li key={c.id} className="flex items-center gap-2 px-2.5 py-1.5 text-[11px]">
                  <UserX className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                  <span className="font-mono text-violet-300">{c.id}</span>
                  <span className="truncate text-zinc-400">{c.email}</span>
                  <span className="ml-auto shrink-0 font-mono text-amber-300">{c.ltv}</span>
                </li>
              ))}
            </ul>
          </div>
          <JsonView
            data={{
              churn_rate_90d: "2.4%",
              window: { start: "2024-10-15", end: "2025-01-13" },
              active_at_period_start: 167,
              churned_in_period: 4,
              revenue_lost: "$3,110.00",
              most_common_reason: "cancellation_requested",
            }}
          />
        </div>
      );
    },
  },
];

function Playground() {
  const [activeId, setActiveId] = React.useState<number>(0);
  // Initialize to true so SSR + first paint shows the thinking state, then fades
  // into the response — no flash of stale content on hydration.
  const [loading, setLoading] = React.useState<boolean>(true);
  const [runToken, setRunToken] = React.useState<number>(0); // bumps to retrigger response fade
  const reduce = useReducedMotion();

  const active = PLAYGROUND_PROMPTS.find((p) => p.id === activeId) ?? PLAYGROUND_PROMPTS[0];

  const run = React.useCallback(() => {
    if (loading) return;
    setLoading(true);
    setRunToken((t) => t + 1);
  }, [loading]);

  // When the prompt changes OR the user hits "Run", show the thinking state
  // briefly, then reveal the response. Both `activeId` (chip click) and
  // `runToken` (Run button click) are deps so either interaction retriggers
  // the loading→response cycle. Without `runToken` in the dep array, hitting
  // Run would set loading=true with nothing to clear it, leaving the demo
  // stuck on "stripe-mcp is thinking…".
  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [activeId, runToken]);

  return (
    <Section id="playground">
      <Reveal>
        <Eyebrow>
          <Play className="h-3.5 w-3.5 text-violet-300" /> Interactive
        </Eyebrow>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
          Try it. <GradientText>Right here.</GradientText>
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Pick a prompt and watch stripe-mcp respond — no setup required.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {/* LEFT — prompt selector + textarea */}
        <Reveal>
          <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-violet-500/25 bg-violet-500/10 text-violet-300">
                <Type className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-sm font-semibold text-white">Pick a prompt</h3>
              <span className="ml-auto text-[10px] text-zinc-500">click to load</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {PLAYGROUND_PROMPTS.map((p) => {
                const isActive = p.id === activeId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveId(p.id)}
                    aria-pressed={isActive}
                    className={cn(
                      "group flex h-full min-h-[68px] items-start gap-2 rounded-xl border p-2.5 text-left text-[11px] leading-relaxed transition-all",
                      isActive
                        ? "border-violet-400/60 bg-violet-500/15 text-violet-100 shadow-sm shadow-violet-500/10"
                        : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-violet-400/40 hover:bg-white/[0.05] hover:text-zinc-200"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
                        isActive
                          ? "bg-gradient-to-br from-violet-500 to-emerald-500 text-white"
                          : "bg-white/10 text-zinc-400"
                      )}
                    >
                      {p.id + 1}
                    </span>
                    <span className="line-clamp-3">{p.label}</span>
                  </button>
                );
              })}
            </div>

            <Separator className="my-4 bg-white/10" />

            <label htmlFor="playground-prompt" className="mb-2 text-[10px] uppercase tracking-wide text-zinc-500">
              Prompt
            </label>
            <Textarea
              id="playground-prompt"
              value={active.prompt}
              readOnly
              className="min-h-[80px] resize-none border-white/10 bg-black/40 font-mono text-xs text-zinc-200"
            />

            <Button
              type="button"
              onClick={run}
              disabled={loading}
              className="mt-4 w-full gap-2 bg-gradient-to-r from-violet-600 to-emerald-600 text-white hover:from-violet-500 hover:to-emerald-500 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> stripe-mcp is thinking…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" fill="currentColor" /> Run with stripe-mcp
                </>
              )}
            </Button>
            <p className="mt-2 text-center text-[10px] text-zinc-500">
              <Lock className="mr-1 inline h-3 w-3" />
              Powered by your local Stripe key — no key, no request leaves your machine.
            </p>
          </div>
        </Reveal>

        {/* RIGHT — response panel */}
        <Reveal delay={0.08}>
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b18]/70 backdrop-blur">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] px-4 py-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 text-white">
                <Sparkles className="h-3 w-3" />
              </span>
              <span className="text-xs font-medium text-zinc-200">stripe-mcp</span>
              <span className="text-[10px] text-zinc-500">• assistant</span>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> ready
              </span>
            </div>

            {/* Body */}
            <div className="min-h-[420px] flex-1 overflow-y-auto p-4 smcp-scrollbar">
              {loading ? (
                <motion.div
                  key={`loading-${runToken}-${activeId}`}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-violet-300" />
                  <p className="text-sm text-zinc-300">stripe-mcp is thinking…</p>
                  <p className="text-[11px] text-zinc-500">calling {active.tool.split(" ")[0]}…</p>
                </motion.div>
              ) : (
                <motion.div
                  key={`response-${runToken}-${activeId}`}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {active.render()}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-white/[0.02] px-4 py-2.5 text-[11px]">
              <span className="truncate text-zinc-500">
                Executed via{" "}
                <code className="font-mono text-violet-300">{active.tool.split(" ")[0]}</code>
              </span>
              <span className="shrink-0 font-mono text-zinc-400">{active.ms}ms</span>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/** Tiny lock icon (kept local so we don't grow the import list). */
function Lock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 8. Tools table — searchable + filterable (polished)
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

      <Reveal delay={0.05}>
        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          {/* Sticky controls (search + chips + counter) */}
          <div className="sticky top-16 z-20 space-y-3 border-b border-white/10 bg-[#0b0b18]/95 p-4 backdrop-blur-xl">
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

            {/* Counter row — visible right below chips */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">
                Showing <span className="font-semibold text-zinc-100">{filtered.length}</span> of{" "}
                {stripeMcpTools.length} tools
              </span>
              {activeCat !== "All" && (
                <button
                  onClick={() => setActiveCat("All")}
                  className="inline-flex items-center gap-1 text-violet-300 transition-colors hover:text-violet-200"
                >
                  Clear filter <span aria-hidden>✕</span>
                </button>
              )}
            </div>
          </div>

          {/* Scrollable table */}
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
    ? { text: "text-zinc-100", bg: "bg-zinc-500/20", border: "border-zinc-400/40", dot: "bg-zinc-200", activeBg: "bg-zinc-400/30", activeBorder: "border-zinc-200/60", activeText: "text-white" }
    : categoryColors[label] ?? { text: "text-zinc-300", bg: "bg-white/5", border: "border-white/10", dot: "bg-zinc-400", activeBg: "bg-white/5", activeBorder: "border-white/15", activeText: "text-zinc-100" };

  // Active state: brighten to a solid, more saturated fill
  const activeCls = label === "All"
    ? "bg-zinc-200 text-zinc-900 border-zinc-200"
    : cn(colors.bg.replace("/10", "/30"), colors.border.replace("/25", "/60"), "text-white shadow-sm");

  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? activeCls
          : cn("border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200")
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
      {label}
      <span className={cn(
        "rounded-full px-1.5 py-0.5 text-[10px]",
        active ? "bg-black/30 text-zinc-100" : "bg-black/30 text-zinc-400"
      )}>
        {count}
      </span>
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
        <p className="line-clamp-2 max-w-sm text-xs italic text-zinc-400">“{tool.examplePrompt}”</p>
      </td>
    </tr>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 9. Analytics spotlight — the crown jewel
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
 * 10. Example prompts — chat bubble grid
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
 * 11. Safety — read-only vs destructive + live/test banner
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
 * 12. Features grid — why it's built this way
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
 * 13. FAQ (NEW)
 * ──────────────────────────────────────────────────────────────────────── */

const FAQ_ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is stripe-mcp safe to use?",
    a: (
      <>
        Yes. It runs entirely locally over stdio. Your Stripe secret key is read from your environment and sent directly to Stripe&apos;s API — it never touches our servers or the AI model provider. We recommend starting with a test key (<MonoPill>sk_test_…</MonoPill>).
      </>
    ),
  },
  {
    q: "Does it work in live mode?",
    a: (
      <>
        Yes. If your key starts with <MonoPill className="border-amber-500/30 bg-amber-500/10 text-amber-200">sk_live_</MonoPill>, stripe-mcp prints a ⚠️ LIVE MODE warning on startup. All destructive operations work in both modes.
      </>
    ),
  },
  {
    q: "Which AI clients are supported?",
    a: (
      <>
        Any MCP client: Claude Desktop, Cursor, Windsurf, Cline, Continue, and any future MCP-compatible client. One JSON block to configure.
      </>
    ),
  },
  {
    q: "Do I need to run a server?",
    a: (
      <>
        No. stripe-mcp communicates over stdio. No HTTP server, no port, no auth. The MCP client spawns it as a child process.
      </>
    ),
  },
  {
    q: "How are the analytics tools different?",
    a: (
      <>
        Stripe has no native MRR/churn endpoint. stripe-mcp paginates your data and computes MRR, churn, revenue summaries, top customers, and failed-payment reports client-side — matching Baremetrics/ChartMogul methodology. <span className="font-semibold text-zinc-200">No other Stripe MCP ships these.</span>
      </>
    ),
  },
  {
    q: "What happens if an AI sends bad input?",
    a: (
      <>
        Every tool input is zod-validated at runtime. Invalid inputs return a clear validation error instead of hitting Stripe. Stripe API errors are caught and formatted into actionable messages with doc links.
      </>
    ),
  },
  {
    q: "Can I use it with multiple Stripe accounts?",
    a: (
      <>
        Currently one account per process (via <MonoPill>STRIPE_SECRET_KEY</MonoPill>). Multi-account is on the roadmap — run multiple instances with different keys in the meantime.
      </>
    ),
  },
  {
    q: "Is it free?",
    a: (
      <>
        Yes — MIT licensed, free forever. Stripe SDK and MCP SDK are also free. You only pay your normal Stripe fees.
      </>
    ),
  },
];

function FAQ() {
  return (
    <Section id="faq">
      <Reveal>
        <Eyebrow>
          <FileText className="h-3.5 w-3.5 text-violet-300" /> FAQ
        </Eyebrow>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
          Frequently asked <GradientText>questions</GradientText>.
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Everything you might want to know before running stripe-mcp against your account.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur sm:p-4">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-white/5 bg-white/[0.02] px-4 transition-colors data-[state=open]:border-violet-400/30 data-[state=open]:bg-violet-500/[0.04] mb-2 last:mb-0"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-zinc-100 hover:text-white hover:no-underline sm:text-base">
                  <span className="flex items-start gap-3 pr-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 font-mono text-[10px] text-violet-300">
                      {i + 1}
                    </span>
                    <span>{item.q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-zinc-400">
                  <div className="pl-8">{item.a}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Reveal>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 14. Roadmap (NEW)
 * ──────────────────────────────────────────────────────────────────────── */

function Roadmap() {
  const columns = [
    {
      label: "Shipped",
      version: "v1.0",
      icon: Check,
      iconCls: "text-emerald-400",
      dotCls: "bg-emerald-400",
      accent: "border-emerald-500/30 bg-emerald-500/[0.05]",
      headerCls: "text-emerald-300",
      items: [
        "79 tools across 19 categories",
        "5 analytics tools (MRR, churn, revenue, top customers, failed payments)",
        "Zod runtime validation on every tool",
        "Auto-pagination with listEnvelope",
        "Typed errors with Stripe docs links",
        "1-command global install",
        "Claude / Cursor / Windsurf configs",
        "36 mocked tests",
      ],
    },
    {
      label: "Next",
      version: "v1.1",
      icon: CircleDot,
      iconCls: "text-violet-300",
      dotCls: "bg-violet-400",
      accent: "border-violet-500/30 bg-violet-500/[0.05]",
      headerCls: "text-violet-200",
      items: [
        "Multi-account support",
        "Webhook event replay",
        "Batch operations",
        "Expanded test coverage",
        "Docker image",
        "Stripe Sigma integration",
        "TS strict CI matrix",
      ],
    },
    {
      label: "Later",
      version: "future",
      icon: Circle,
      iconCls: "text-zinc-400",
      dotCls: "bg-zinc-400",
      accent: "border-white/10 bg-white/[0.02]",
      headerCls: "text-zinc-300",
      items: [
        "HTTP / SSE transport",
        "OAuth flow",
        "Custom tool filtering",
        "Per-tool permission scopes",
        "Web dashboard",
        "Plugin system",
      ],
    },
  ];

  return (
    <Section id="roadmap">
      <Reveal>
        <Eyebrow>
          <Rocket className="h-3.5 w-3.5 text-violet-300" /> Roadmap
        </Eyebrow>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
          What&apos;s here, <GradientText>what&apos;s next</GradientText>.
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          v1.0 is the foundation — every Stripe resource, every common operation, and the analytics
          crown jewel. Here&apos;s where it goes from here.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {columns.map((col, idx) => (
          <Reveal key={col.label} delay={idx * 0.08}>
            <div className={cn("flex h-full flex-col rounded-2xl border p-6 backdrop-blur", col.accent)}>
              <div className="flex items-center gap-2">
                <col.icon className={cn("h-5 w-5", col.iconCls)} />
                <h3 className={cn("text-lg font-semibold", col.headerCls)}>{col.label}</h3>
                <span className="ml-auto rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                  {col.version}
                </span>
              </div>
              <Separator className="my-4 bg-white/10" />
              <ul className="space-y-2.5">
                {col.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", col.dotCls)} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 15. Final CTA
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
              className="border-violet-400/60 bg-violet-500/10 text-violet-100 hover:border-violet-300 hover:bg-violet-500/20 hover:text-white"
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
 * 16. Footer (sticky bottom)
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
              <li><a href="#playground" className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">Playground</a></li>
              <li><a href="#faq" className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">FAQ</a></li>
              <li><a href="#roadmap" className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">Roadmap</a></li>
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
 * Page — final section order:
 * 1. Hero → 2. Stats strip → 3. Compatible with → 4. How it works (NEW)
 * → 5. Quickstart → 6. Playground (NEW) → 7. Tools table → 8. Analytics
 * → 9. Example prompts → 10. Safety → 11. Features → 12. FAQ (NEW)
 * → 13. Roadmap (NEW) → 14. Final CTA → 15. Footer
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
            <HowItWorks />
            <Quickstart />
            <Playground />
            <ToolsTable />
            <AnalyticsSpotlight />
            <ExamplePrompts />
            <Safety />
            <Features />
            <FAQ />
            <Roadmap />
            <FinalCta />
          </main>
          <Footer />
        </TooltipProvider>
      </div>
    </div>
  );
}

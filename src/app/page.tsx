"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Eye,
  FileDown,
  Send,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { StoryCard } from "@/components/marketing/story-card";
import { Wordmark } from "@/components/wordmark";

/* ----------------------------- Reusable UI ---------------------------- */

const SectionDivider = ({ title }: { title: string }) => (
  <div className="flex items-center gap-4 py-6">
    <div className="h-px flex-1 bg-[#004643]/20" />
    <span className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-[#004643]">
      {title}
    </span>
    <div className="h-px flex-1 bg-[#004643]/20" />
  </div>
);

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="inline-flex items-center gap-2 rounded-full border border-[#004643]/20 bg-[#f0ede5] px-3.5 py-1 text-xs font-semibold text-[#004643]">
    <span aria-hidden className="size-1.5 rounded-full bg-[#004643]" />
    {children}
  </p>
);

const Bar = ({ w, dark }: { w: string; dark?: boolean }) => (
  <div
    className={`h-[3px] shrink-0 rounded-full ${dark ? "bg-[#004643]/80" : "bg-[#004643]/20"}`}
    style={{ width: w }}
  />
);

/* ----------------------------- Template Thumbs ---------------------------- */

const ClassicThumb = () => (
  <div className="flex h-full w-[138px] flex-col gap-[5px] rounded-md bg-white p-2.5 ring-1 ring-[#004643]/10">
    <Bar w="55%" dark />
    <Bar w="34%" />
    <div className="my-[2px] h-px bg-[#e2ded5]" />
    <Bar w="26%" dark />
    <Bar w="90%" />
    <Bar w="76%" />
    <Bar w="26%" dark />
    <Bar w="84%" />
    <Bar w="68%" />
    <Bar w="26%" dark />
    <Bar w="72%" />
    <Bar w="55%" />
  </div>
);

const ModernThumb = () => (
  <div className="flex h-full w-[138px] flex-col overflow-hidden rounded-md bg-white ring-1 ring-[#004643]/10">
    <div className="flex h-[34px] items-center bg-[#004643] p-2.5">
      <div className="h-[6px] w-[44px] rounded-full bg-white/90" />
    </div>
    <div className="flex flex-col gap-[5px] p-2.5">
      <Bar w="24%" dark />
      <Bar w="92%" />
      <Bar w="78%" />
      <div className="my-[1px] h-[2px] w-[38px] rounded-full bg-[#dda15e]" />
      <Bar w="24%" dark />
      <Bar w="86%" />
      <Bar w="64%" />
    </div>
  </div>
);

const CompactThumb = () => (
  <div className="flex h-full w-[138px] flex-col gap-2 rounded-md bg-white p-2.5 ring-1 ring-[#004643]/10">
    <Bar w="58%" dark />
    <div className="flex flex-1 gap-[7px]">
      <div className="flex w-[34px] shrink-0 flex-col gap-[5px]">
        <Bar w="70%" />
        <Bar w="54%" />
        <Bar w="62%" />
        <Bar w="48%" />
        <Bar w="66%" />
      </div>
      <div className="flex flex-1 flex-col gap-[5px]">
        <Bar w="30%" dark />
        <Bar w="98%" />
        <Bar w="82%" />
        <Bar w="30%" dark />
        <Bar w="88%" />
        <Bar w="70%" />
        <Bar w="30%" dark />
        <Bar w="74%" />
      </div>
    </div>
  </div>
);

const ProfessionalThumb = () => (
  <div className="flex h-full w-[138px] flex-col overflow-hidden rounded-md bg-white ring-1 ring-[#004643]/10">
    <div className="flex flex-col gap-1 bg-[#091c1a] p-2 text-white">
      <div className="h-[5px] w-[65%] rounded-full bg-[#dda15e]" />
      <div className="h-[3px] w-[45%] rounded-full bg-white/70" />
    </div>
    <div className="flex flex-col gap-[5px] p-2">
      <div className="flex gap-1">
        <Bar w="28%" />
        <Bar w="28%" />
        <Bar w="28%" />
      </div>
      <div className="my-[2px] h-px bg-[#e2ded5]" />
      <Bar w="28%" dark />
      <Bar w="94%" />
      <Bar w="80%" />
      <Bar w="28%" dark />
      <Bar w="88%" />
      <Bar w="72%" />
    </div>
  </div>
);

const EditorialThumb = () => (
  <div className="flex h-full w-[138px] gap-2 rounded-md bg-white p-2.5 ring-1 ring-[#004643]/10">
    <div className="flex w-[40px] shrink-0 flex-col gap-1">
      <div className="my-[2px] aspect-[3/4] w-full rounded-[2px] bg-[#004643]/20" />
      <Bar w="60%" dark />
      <Bar w="90%" />
      <Bar w="75%" />
    </div>
    <div className="flex flex-1 flex-col gap-1">
      <Bar w="85%" dark />
      <div className="h-[2px] w-[65%] rounded-full bg-[#004643]" />
      <Bar w="32%" dark />
      <Bar w="100%" />
      <Bar w="88%" />
      <div className="my-[1px] flex flex-col gap-[2px] rounded border border-dashed border-[#004643]/30 bg-[#f0ede5]/50 p-1">
        <div className="flex gap-1">
          <Bar w="48%" />
          <Bar w="48%" />
        </div>
      </div>
    </div>
  </div>
);

const DesignerThumb = () => (
  <div className="flex h-full w-[138px] flex-col rounded-md bg-white p-2.5 ring-1 ring-[#004643]/10">
    <div className="flex items-center gap-1.5 border-b border-[#e2ded5] pb-1.5">
      <div className="h-6 w-5 shrink-0 rounded-[2px] bg-[#004643]" />
      <div className="flex flex-1 flex-col gap-[3px]">
        <Bar w="80%" dark />
        <Bar w="50%" />
      </div>
    </div>
    <div className="flex flex-1 pt-1.5">
      <div className="flex w-[38%] shrink-0 flex-col gap-1 border-r border-[#e2ded5] pr-1">
        <Bar w="60%" dark />
        <Bar w="90%" />
        <Bar w="75%" />
      </div>
      <div className="flex flex-1 flex-col gap-1 pl-1.5">
        <Bar w="50%" dark />
        <Bar w="95%" />
        <Bar w="88%" />
      </div>
    </div>
  </div>
);

const templates = [
  {
    name: "Classic",
    blurb: "The timeless standard hiring managers and ATS engines prioritize.",
    note: "A4 · Highest ATS Parse Rate",
    thumb: <ClassicThumb />,
  },
  {
    name: "Modern",
    blurb: "Distinct executive tone with subtle Niseth Code forest accents.",
    note: "A4 · Vector & Selectable Text",
    thumb: <ModernThumb />,
  },
  {
    name: "Compact",
    blurb: "Maximizes density for seasoned engineers and dense project lists.",
    note: "A4 · Optimized Single-Page",
    thumb: <CompactThumb />,
  },
  {
    name: "Professional",
    blurb: "High-contrast dark header for leadership and senior roles.",
    note: "A4 · Executive Profile",
    thumb: <ProfessionalThumb />,
  },
  {
    name: "Editorial",
    blurb: "Two-column magazine layout with portrait frame and skill grid.",
    note: "A4 · Modern Two-Column",
    thumb: <EditorialThumb />,
  },
  {
    name: "Designer",
    blurb: "Structured creative layout with clean rail columns and photo slot.",
    note: "A4 · Creative & Technical CV",
    thumb: <DesignerThumb />,
  },
];

/* ----------------------------- Feature Highlights Row ---------------------------- */

const HIGHLIGHT_STRIP = [
  { count: "01", label: "ATS Tuned", desc: "Standard headers & clean structure" },
  { count: "02", label: "Live Canvas", desc: "Real-time updates as you type" },
  { count: "03", label: "AI Copilot", desc: "Suggestions you review & accept" },
  { count: "04", label: "A4 Vector PDF", desc: "100% watermark-free download" },
  { count: "05", label: "Zero Lock-in", desc: "Private sessions & local backup" },
];

/* ----------------------------- Step Journey (Timeline) ---------------------------- */

const TIMELINE_STEPS = [
  {
    step: "Step 01",
    title: "Choose or Import Your Canvas",
    desc: "Pick from 6 research-validated templates or import an existing PDF/JSON. Your sections stay structured and ready to edit without layout fighting.",
    tag: "Instant Canvas Setup",
    metric: "< 60 seconds",
  },
  {
    step: "Step 02",
    title: "Refine With AI Career Copilot",
    desc: "Our non-hallucinatory AI analyzes your bullet points, suggesting punchy action verbs and measurable results. You accept what fits, reject what doesn't.",
    tag: "Google Gemini 2.5 Flash",
    metric: "3x Impact Score",
  },
  {
    step: "Step 03",
    title: "Export & Apply With Confidence",
    desc: "Download a clean, high-resolution A4 PDF formatted to perfection. No watermarks, no recurring monthly fees, no hidden download gates.",
    tag: "ATS-Ready Vector",
    metric: "Watermark-Free",
  },
];

/* ----------------------------- What's Included Grid ---------------------------- */

const INCLUDED_FEATURES: {
  icon: LucideIcon;
  title: string;
  body: string;
  badge: string;
}[] = [
  {
    icon: Sparkles,
    title: "Intelligent Writing Copilot",
    body: "Transform raw job duties into quantified achievements. Never generates false claims or hallucinates unearned degrees.",
    badge: "AI Powered",
  },
  {
    icon: Eye,
    title: "Live Synchronous Canvas",
    body: "Split-screen editor updates with zero latency. What you craft in the form fields is 100% identical to the generated PDF.",
    badge: "WYSIWYG",
  },
  {
    icon: ShieldCheck,
    title: "ATS Architecture",
    body: "Optimized fonts, hierarchy, and standard headings parsed effortlessly by Workday, Greenhouse, Taleo, and Lever.",
    badge: "High Scan Pass",
  },
  {
    icon: FileDown,
    title: "Clean A4 Vector Export",
    body: "Industry-standard A4 dimensions with selectable text, clickable links, and balanced margins. Watermark-free forever.",
    badge: "Print Ready",
  },
];

/* ----------------------------- Testimonials ---------------------------- */

const REVIEWS = [
  {
    name: "Alexandre Moreau",
    role: "Senior Full-Stack Engineer",
    company: "Tech Lead @ Scale",
    avatar: "AM",
    text: "Niseth Code completely streamlined my job hunt. The AI suggestions sharpened my metrics without making stuff up, and the clean A4 PDF export sailed through recruiter screens.",
  },
  {
    name: "Soraya Varma",
    role: "Product Designer",
    company: "Fintech Collective",
    avatar: "SV",
    text: "The Editorial template is stunning. Usually resume builders feel clunky and full of paywalls, but Niseth Code delivered high-end typography and total creative control.",
  },
  {
    name: "Marcus Sterling",
    role: "Cloud Architect",
    company: "Enterprise Infrastructure",
    avatar: "MS",
    text: "Exporting a watermark-free resume without a surprise subscription popup is rare. Niseth Code is now my go-to recommendation for every developer.",
  },
];

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#included", label: "What's Included" },
  { href: "#templates", label: "Templates" },
  { href: "#reviews", label: "Reviews" },
  { href: "#launch", label: "Quick Launch" },
];

export default function Home() {
  const router = useRouter();
  const [launchName, setLaunchName] = useState("");
  const [launchRole, setLaunchRole] = useState("");
  const [launchEmail, setLaunchEmail] = useState("");

  const handleLaunchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (launchName.trim()) params.set("name", launchName.trim());
    if (launchRole.trim()) params.set("role", launchRole.trim());
    if (launchEmail.trim()) params.set("email", launchEmail.trim());
    params.set("mode", "signup");
    router.push(`/login?${params.toString()}`);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#faf8f5] text-[#102422]">
      {/* ----------------------------- Top Navigation ---------------------------- */}
      <header className="sticky top-0 z-50 border-b border-[#e2ded5] bg-[#faf8f5]/85 backdrop-blur-md">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="shrink-0" aria-label="Niseth Code Home">
            <Wordmark />
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-[#586e6b] md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition hover:text-[#004643]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-[#586e6b] transition hover:text-[#004643]"
            >
              Log in
            </Link>
            <Link
              href="/login?mode=signup"
              className="rounded-full bg-[#004643] px-5 py-2 text-sm font-semibold text-[#f0ede5] shadow-sm transition hover:bg-[#003330] hover:shadow-md"
            >
              Start Free
            </Link>
          </div>
        </nav>
      </header>

      {/* ----------------------------- Hero Section (With 3D Template Intact) ---------------------------- */}
      <section className="relative overflow-hidden border-b border-[#e2ded5] pb-20 pt-12 sm:pt-20">
        {/* Ambient subtle glow background */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-full max-w-6xl -translate-x-1/2 opacity-35 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at top, #004643 0%, #dda15e 40%, transparent 70%)",
          }}
        />

        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_360px] lg:gap-14">
          <div className="rise-in max-w-xl" style={{ animationDelay: "0.05s" }}>
            <Kicker>Niseth Code · Precision Career Platform</Kicker>

            <h1 className="mt-5 font-display text-[44px] font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl text-[#102422]">
              Architect your career with{" "}
              <span className="text-[#004643] underline decoration-[#dda15e] decoration-wavy underline-offset-8">
                precision
              </span>
              .
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-[#586e6b]">
              Build an ATS-optimized, executive-ready resume in one sitting.
              Crafted with a real-time live canvas, respectful AI suggestions you
              always control, and pristine watermark-free A4 PDF downloads.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#004643] px-7 py-3.5 text-[15px] font-semibold text-[#f0ede5] shadow-md transition hover:bg-[#003330] hover:shadow-lg"
              >
                Start building free
                <ArrowRight size={16} />
              </Link>
              <a
                href="#templates"
                className="rounded-full border border-[#004643]/30 bg-white px-6 py-3.5 text-[15px] font-semibold text-[#004643] transition hover:border-[#004643] hover:bg-[#f0ede5]/40"
              >
                Browse templates
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap items-center gap-2 text-xs font-medium text-[#586e6b]">
              {[
                "100% Free Core",
                "Zero Watermark",
                "A4 Vector PDF",
                "Privacy Guaranteed",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 rounded-full border border-[#e2ded5] bg-white/70 px-3 py-1 shadow-2xs"
                >
                  <CheckCircle2 size={12} className="text-[#004643]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 3D Template Kept Intact as Requested */}
          <div className="relative">
            <StoryCard />
          </div>
        </div>

        {/* ----------------------------- Horizontal Highlight Strip (from ui_ref.png) ---------------------------- */}
        <div className="mx-auto mt-16 w-full max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {HIGHLIGHT_STRIP.map((item) => (
              <div
                key={item.count}
                className="rounded-2xl border border-[#e2ded5] bg-white p-4 shadow-xs transition hover:border-[#004643]/40 hover:shadow-sm last:col-span-2 sm:last:col-span-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold text-[#dda15e]">
                    {item.count}
                  </span>
                  <span className="size-1.5 rounded-full bg-[#004643]" />
                </div>
                <h4 className="mt-2 text-sm font-bold text-[#102422]">
                  {item.label}
                </h4>
                <p className="mt-0.5 text-xs text-[#586e6b]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- Section 1: About / Stepper Flow (ui_ref.png) ---------------------------- */}
      <section id="about" className="scroll-mt-20 bg-white py-20 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <SectionDivider title="About Niseth Code" />

          <div className="mt-8 grid items-start gap-12 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <Kicker>Streamlined Architecture</Kicker>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl text-[#102422]">
                Blank canvas to executive PDF in three deliberate steps.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#586e6b]">
                We eliminated the frustration of broken document margins,
                unresponsive text boxes, and aggressive trial clocks. With Niseth
                Code, you focus on articulating your career narrative while our
                engine handles the typography, spacing, and ATS formatting.
              </p>

              <div className="mt-8 rounded-2xl border border-[#e2ded5] bg-[#f0ede5]/50 p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#004643] text-white">
                    <Award size={20} />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#102422]">
                      Recruiter Tested & Approved
                    </h4>
                    <p className="text-xs text-[#586e6b]">
                      Validated across 40+ hiring manager formats
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper Timeline with Connecting Line (from ui_ref.png) */}
            <div className="relative pl-6 before:absolute before:bottom-3 before:left-[11px] before:top-3 before:w-0.5 before:bg-[#004643]/20">
              <div className="flex flex-col gap-8">
                {TIMELINE_STEPS.map((step, idx) => (
                  <div key={step.step} className="relative flex items-start gap-4">
                    <span className="relative z-10 -ml-[19px] grid size-7 shrink-0 place-items-center rounded-full bg-[#004643] text-xs font-bold text-white shadow-sm ring-4 ring-white">
                      {idx + 1}
                    </span>
                    <div className="flex-1 rounded-2xl border border-[#e2ded5] bg-[#faf8f5] p-5 shadow-xs transition hover:border-[#004643]/30">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#dda15e]">
                          {step.step}
                        </span>
                        <span className="rounded-full bg-[#004643]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#004643]">
                          {step.tag}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-[#102422]">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#586e6b]">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------- Section 2: What's Included (ui_ref.png) ---------------------------- */}
      <section id="included" className="scroll-mt-20 border-t border-[#e2ded5] py-20 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <SectionDivider title="What's Included" />

          <div className="mt-6 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-[#102422]">
              Engineered for career impact.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-[#586e6b]">
              Every tool you need to build, iterate, and share world-class resumes
              without predatory fees or watermarks.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {INCLUDED_FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="niseth-glow-card relative flex flex-col justify-between rounded-2xl border border-[#e2ded5] bg-white p-6 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-[#f0ede5] text-[#004643]">
                      <feat.icon size={22} strokeWidth={2} />
                    </span>
                    <span className="rounded-full border border-[#004643]/20 bg-[#f0ede5] px-2.5 py-0.5 text-[10px] font-bold text-[#004643]">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-[#102422]">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#586e6b]">
                    {feat.body}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-[#004643]">
                  <span>Included Free</span>
                  <CheckCircle2 size={13} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- Section 3: Curated Templates ---------------------------- */}
      <section id="templates" className="scroll-mt-20 border-t border-[#e2ded5] bg-white py-20 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <SectionDivider title="Curated Templates" />

          <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-[#102422]">
                Six layouts. Serious on paper.
              </h2>
              <p className="mt-2 text-sm text-[#586e6b]">
                Tested for strict A4 page geometry, legible contrast, and high ATS readability.
              </p>
            </div>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-full border border-[#004643]/30 px-5 py-2.5 text-sm font-semibold text-[#004643] transition hover:bg-[#f0ede5]"
            >
              Explore all templates
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {templates.map((tpl) => (
              <Link
                key={tpl.name}
                href={`/login?template=${tpl.name.toLowerCase()}&mode=signup`}
                className="group flex flex-col rounded-2xl border border-[#e2ded5] bg-[#faf8f5] p-4 transition hover:border-[#004643]/50 hover:shadow-md cursor-pointer"
              >
                <div className="relative flex h-[190px] items-center justify-center overflow-hidden rounded-xl bg-white p-2 shadow-2xs">
                  {tpl.thumb}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#004643]/80 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#004643] shadow-sm">
                      Select
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="font-display text-sm font-bold text-[#102422]">
                    {tpl.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#586e6b] line-clamp-2">
                    {tpl.blurb}
                  </p>
                  <p className="mt-2 text-[10px] font-semibold text-[#004643]">
                    {tpl.note}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- Section 4: Reviews ---------------------------- */}
      <section id="reviews" className="scroll-mt-20 border-t border-[#e2ded5] py-20 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <SectionDivider title="Member Stories" />

          <div className="mt-6 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-[#102422]">
              Trusted by builders and leaders.
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-[#586e6b]">
              Read how candidates landed interviews at world-class companies using Niseth Code.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {REVIEWS.map((rev) => (
              <article
                key={rev.name}
                className="flex flex-col justify-between rounded-2xl border border-[#e2ded5] bg-white p-6 shadow-xs transition hover:border-[#004643]/30 hover:shadow-sm"
              >
                <p className="text-sm leading-relaxed text-[#102422]/90 italic">
                  &ldquo;{rev.text}&rdquo;
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-[#e2ded5] pt-4">
                  <span className="grid size-10 place-items-center rounded-full bg-[#004643] text-xs font-bold text-white">
                    {rev.avatar}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#102422]">
                      {rev.name}
                    </h4>
                    <p className="text-xs text-[#586e6b]">{rev.role}</p>
                    <p className="text-[10px] font-semibold text-[#dda15e]">
                      {rev.company}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- Section 5: Atmospheric Quick Launch / Contact Card (ui_ref.png) ---------------------------- */}
      <section id="launch" className="scroll-mt-20 px-6 pb-20 sm:pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-[#091c1a] px-8 py-16 text-white sm:px-14 sm:py-20 shadow-2xl">
          {/* Large Watermark text (similar to JAPAN in ui_ref.png) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 select-none font-display text-[90px] font-black tracking-widest text-white/5 sm:text-[160px]"
          >
            NISETH
          </div>

          <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-[#dda15e]">
                <Sparkles size={13} />
                Ready to Upgrade Your Career?
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-5xl text-[#f0ede5]">
                Start building your resume in 2 minutes.
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
                Join thousands of engineers and professionals using Niseth Code to
                land high-impact positions. No credit card required.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/login?mode=signup"
                  className="rounded-full bg-[#dda15e] px-7 py-3.5 text-sm font-bold text-[#091c1a] shadow-md transition hover:bg-[#e2a855] hover:shadow-lg"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/templates"
                  className="rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                >
                  View Layouts
                </Link>
              </div>
            </div>

            {/* Frosted Glass Launch Box (inspired by ui_ref.png "Want to join us?") */}
            <div className="niseth-glass-dark rounded-2xl p-6 sm:p-8">
              <h3 className="font-display text-lg font-bold text-[#f0ede5]">
                Fast Launch Assistant
              </h3>
              <p className="mt-1 text-xs text-white/70">
                Have questions or ready to begin? Start your setup:
              </p>

              <form
                onSubmit={handleLaunchSubmit}
                className="mt-5 flex flex-col gap-3.5"
              >
                <div>
                  <label className="text-xs font-medium text-white/80">Your Name</label>
                  <input
                    type="text"
                    required
                    value={launchName}
                    onChange={(e) => setLaunchName(e.target.value)}
                    placeholder="Amara Chen"
                    className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#dda15e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/80">Target Role</label>
                  <input
                    type="text"
                    value={launchRole}
                    onChange={(e) => setLaunchRole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#dda15e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/80">Email</label>
                  <input
                    type="email"
                    required
                    value={launchEmail}
                    onChange={(e) => setLaunchEmail(e.target.value)}
                    placeholder="amara@example.com"
                    className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#dda15e] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-[#004643] transition hover:bg-[#f0ede5]"
                >
                  <Send size={15} />
                  Launch Niseth Code
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------- Footer ---------------------------- */}
      <footer className="mt-auto border-t border-[#e2ded5] bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#586e6b]">
              Niseth Code provides developers, engineers, and professionals with
              modern resume architecture. Free, private, and watermark-free forever.
            </p>
            <p className="mt-4 text-xs text-[#586e6b]">
              Theme inspired by deep forest teal (#004643) and warm linen (#F0EDE5).
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#004643]">
              Navigation
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-[#586e6b]">
              <li>
                <a href="#about" className="hover:text-[#004643]">
                  About Niseth Code
                </a>
              </li>
              <li>
                <a href="#included" className="hover:text-[#004643]">
                  What&rsquo;s Included
                </a>
              </li>
              <li>
                <Link href="/templates" className="hover:text-[#004643]">
                  Templates Gallery
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#004643]">
                  Your Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#004643]">
              Trust & Legal
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-[#586e6b]">
              <li>
                <Link href="/privacy" className="hover:text-[#004643]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy#ai-practices" className="hover:text-[#004643]">
                  AI Data Handling
                </Link>
              </li>
              <li>
                <Link href="/privacy#data-retention" className="hover:text-[#004643]">
                  Security & Encryption
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#e2ded5]">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 text-xs text-[#586e6b]">
            <span>© 2026 Niseth Code. All rights reserved.</span>
            <span>Built for ambitious professionals.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  FileDown,
  Globe,
  Layers,
  Send,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const InstagramIcon = ({
  size = 15,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

import { Wordmark } from "@/components/wordmark";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/lib/i18n/context";
import { Hero3dCv } from "@/components/marketing/hero-3d-cv";

/* ----------------------------- Template Thumbnails ---------------------------- */

const Bar = ({ w, dark }: { w: string; dark?: boolean }) => (
  <div
    className={`h-[3px] shrink-0 rounded-full ${
      dark ? "bg-neutral-800 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-700"
    }`}
    style={{ width: w }}
  />
);

const ClassicThumb = () => (
  <div className="flex h-full w-[138px] flex-col gap-[5px] rounded-md bg-white p-2.5 ring-1 ring-black/5 dark:bg-[#18181b] dark:ring-white/10">
    <Bar w="55%" dark />
    <Bar w="34%" />
    <div className="my-[2px] h-px bg-neutral-200 dark:bg-neutral-800" />
    <Bar w="26%" dark />
    <Bar w="90%" />
    <Bar w="76%" />
    <Bar w="26%" dark />
    <Bar w="84%" />
    <Bar w="68%" />
  </div>
);

const ModernThumb = () => (
  <div className="flex h-full w-[138px] flex-col overflow-hidden rounded-md bg-white ring-1 ring-black/5 dark:bg-[#18181b] dark:ring-white/10">
    <div className="flex h-[32px] items-center bg-[#004643] p-2.5">
      <div className="h-[6px] w-[44px] rounded-full bg-white/90" />
    </div>
    <div className="flex flex-col gap-[5px] p-2.5">
      <Bar w="24%" dark />
      <Bar w="92%" />
      <Bar w="78%" />
      <div className="my-[1px] h-[2px] w-[38px] rounded-full bg-[#dda15e]" />
      <Bar w="24%" dark />
      <Bar w="86%" />
    </div>
  </div>
);

const CompactThumb = () => (
  <div className="flex h-full w-[138px] flex-col gap-2 rounded-md bg-white p-2.5 ring-1 ring-black/5 dark:bg-[#18181b] dark:ring-white/10">
    <Bar w="58%" dark />
    <div className="flex flex-1 gap-[7px]">
      <div className="flex w-[34px] shrink-0 flex-col gap-[5px]">
        <Bar w="70%" />
        <Bar w="54%" />
        <Bar w="62%" />
      </div>
      <div className="flex flex-1 flex-col gap-[5px]">
        <Bar w="30%" dark />
        <Bar w="98%" />
        <Bar w="82%" />
      </div>
    </div>
  </div>
);

const ProfessionalThumb = () => (
  <div className="flex h-full w-[138px] flex-col gap-1.5 rounded-md bg-white p-2.5 ring-1 ring-black/5 dark:bg-[#18181b] dark:ring-white/10">
    <div className="flex items-center gap-2">
      <div className="size-6 shrink-0 rounded-full bg-[#004643] text-white flex items-center justify-center text-[8px] font-bold">
        NC
      </div>
      <div className="flex flex-1 flex-col gap-[3px]">
        <Bar w="85%" dark />
        <Bar w="50%" />
      </div>
    </div>
    <div className="my-[2px] h-px bg-neutral-200 dark:bg-neutral-800" />
    <Bar w="28%" dark />
    <Bar w="94%" />
    <Bar w="80%" />
  </div>
);

const EditorialThumb = () => (
  <div className="flex h-full w-[138px] gap-2 rounded-md bg-white p-2.5 ring-1 ring-black/5 dark:bg-[#18181b] dark:ring-white/10">
    <div className="flex w-[38px] shrink-0 flex-col gap-1">
      <div className="my-[2px] aspect-[3/4] w-full rounded-[2px] bg-neutral-300 dark:bg-neutral-700" />
      <Bar w="60%" dark />
      <Bar w="85%" />
    </div>
    <div className="flex flex-1 flex-col gap-1">
      <Bar w="85%" dark />
      <div className="h-[2px] w-[65%] rounded-full bg-[#004643]" />
      <Bar w="32%" dark />
      <Bar w="100%" />
    </div>
  </div>
);

const DesignerThumb = () => (
  <div className="flex h-full w-[138px] flex-col rounded-md bg-white p-2.5 ring-1 ring-black/5 dark:bg-[#18181b] dark:ring-white/10">
    <div className="flex items-center gap-1.5 border-b border-neutral-200 pb-1.5 dark:border-neutral-800">
      <div className="h-5 w-4 shrink-0 rounded-[2px] bg-[#004643]" />
      <div className="flex flex-1 flex-col gap-[3px]">
        <Bar w="80%" dark />
        <Bar w="50%" />
      </div>
    </div>
    <div className="flex flex-1 pt-1.5">
      <div className="flex w-[38%] shrink-0 flex-col gap-1 border-r border-neutral-200 pr-1 dark:border-neutral-800">
        <Bar w="60%" dark />
        <Bar w="85%" />
      </div>
      <div className="flex flex-1 flex-col gap-1 pl-1.5">
        <Bar w="50%" dark />
        <Bar w="95%" />
      </div>
    </div>
  </div>
);

const TEMPLATE_THUMBS = [
  <ClassicThumb key="classic" />,
  <ModernThumb key="modern" />,
  <CompactThumb key="compact" />,
  <ProfessionalThumb key="professional" />,
  <EditorialThumb key="editorial" />,
  <DesignerThumb key="designer" />,
];

export default function Home() {
  const router = useRouter();
  const { t, isKhmer } = useLanguage();
  const [launchName, setLaunchName] = useState("");
  const [launchRole, setLaunchRole] = useState("");
  const [launchEmail, setLaunchEmail] = useState("");

  const navLinks = [
    { href: "#about", label: isKhmer ? "អំពីប្រព័ន្ធ" : "About" },
    { href: "#workflow", label: isKhmer ? "ដំណើរការ" : "Workflow" },
    { href: "#included", label: isKhmer ? "លក្ខណៈពិសេស" : "Included" },
    { href: "#templates", label: t.nav.templates },
    { href: "#reviews", label: isKhmer ? "ការវាយតម្លៃ" : "Reviews" },
    { href: "#contact", label: isKhmer ? "ទំនាក់ទំនង" : "Contacts" },
  ];

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
    <div className="relative min-h-dvh flex flex-col bg-white text-neutral-900 dark:bg-[#001715] dark:text-[#F0EDE5] antialiased selection:bg-[#dda15e] selection:text-black transition-colors duration-200">
      {/* ----------------------------- Frosted Floating Top Nav ---------------------------- */}
      <header className="sticky top-0 z-50 border-b border-black/[0.08] bg-white/85 dark:border-white/10 dark:bg-[#002422]/80 backdrop-blur-xl transition-colors duration-200">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-90"
            aria-label="Niseth Code Home"
          >
            <Wordmark />
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden items-center gap-8 text-[13px] font-medium tracking-wide text-neutral-600 dark:text-[#F0EDE5]/85 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-neutral-950 dark:hover:text-white hover:underline underline-offset-8 decoration-[#004643]/70 dark:decoration-[#dda15e]/70"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <LanguageToggle compact />
            <ThemeToggle compact />
            <Link
              href="/login"
              className="hidden sm:inline-block text-[13px] font-medium text-neutral-700 dark:text-[#F0EDE5]/85 transition hover:text-neutral-950 dark:hover:text-white"
            >
              {t.nav.signIn}
            </Link>
            <Link
              href="/login?mode=signup"
              className="rounded-full bg-[#004643] text-white hover:bg-[#003835] dark:bg-white dark:text-neutral-950 dark:hover:bg-[#F0EDE5] px-5 py-2 text-xs font-semibold shadow-md backdrop-blur-sm transition active:scale-95 cursor-pointer"
            >
              {isKhmer ? "ចាប់ផ្តើម" : "Get Started"}
            </Link>

            {/* Social icons pill on right edge */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-white/15 text-neutral-500 dark:text-white/70">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="p-1 hover:text-neutral-950 dark:hover:text-white transition-colors"
              >
                <Globe size={15} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="p-1 hover:text-neutral-950 dark:hover:text-white transition-colors"
              >
                <InstagramIcon size={15} />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="p-1 hover:text-neutral-950 dark:hover:text-white transition-colors"
              >
                <Send size={15} />
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* ----------------------------- Hero Section ---------------------------- */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Clean Ambient Radial Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] opacity-25 dark:opacity-40 blur-[130px]"
            style={{
              background:
                "radial-gradient(circle, rgba(0, 70, 67, 0.45) 0%, rgba(221, 161, 94, 0.18) 50%, transparent 75%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Hero Copy & Actions */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Elegant Pill Kicker */}
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100/90 dark:border-white/20 dark:bg-white/[0.06] px-4 py-1.5 text-xs font-medium text-neutral-800 dark:text-white/90 backdrop-blur-md w-fit">
                <span className="size-2 rounded-full bg-[#dda15e] animate-pulse" />
                <span>{t.landing.badge}</span>
              </div>

              {/* Hero Title */}
              <h1 className="mt-6 font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-950 dark:text-white leading-[1.25] sm:leading-[1.15]">
                {t.landing.heroTitle}
              </h1>

              {/* Subtitle */}
              <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-neutral-600 dark:text-[#F0EDE5]/85">
                {t.landing.heroSubtitle}
              </p>

              {/* Primary Call to Action buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/login?mode=signup"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#004643] text-white hover:bg-[#003835] dark:bg-white dark:text-neutral-950 dark:hover:bg-[#F0EDE5] px-7 py-3.5 text-sm font-bold shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 group cursor-pointer"
                >
                  <span>{t.landing.ctaCreate}</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/templates"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 px-6 py-3.5 text-sm font-semibold backdrop-blur-md transition active:scale-95 cursor-pointer"
                >
                  <span>{t.landing.ctaTemplates}</span>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs font-medium text-neutral-600 dark:text-[#F0EDE5]/75">
                {[
                  isKhmer ? "ឥតគិតថ្លៃ ១០០%" : "100% Free Core",
                  isKhmer ? "គ្មាន Watermark" : "Zero Watermark",
                  isKhmer ? "A4 Vector PDF គុណភាពខ្ពស់" : "A4 Vector PDF",
                  isKhmer ? "រក្សាភាពឯកជនពេញលេញ" : "Absolute Privacy",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#004643] dark:text-[#dda15e]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: Just the 3D Template CV */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <Hero3dCv defaultTemplate="modern" showRibbon={false} showBottomBar={false} />
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------- Signature Niseth Rule 1 ---------------------------- */}
      <div id="about" className="scroll-mt-20 my-10 sm:my-14 px-6">
        <div className="niseth-section-rule mx-auto max-w-5xl text-[#004643] dark:text-[#F0EDE5]">
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-[0.22em] text-center whitespace-nowrap px-4">
            {isKhmer ? "អំពីប្រព័ន្ធដំណើរការ" : "ABOUT THE STUDIO"}
          </h2>
        </div>
      </div>

      {/* ----------------------------- About The Platform & Workflow Section ---------------------------- */}
      <section id="workflow" className="relative scroll-mt-20 py-12 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            {/* Left Column: Narrative with Highlights */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full pt-2">
              <div>
                <p className="text-base sm:text-lg leading-relaxed text-neutral-800 dark:text-[#F0EDE5]/90">
                  {isKhmer ? (
                    <>
                      យើងបានរៀបចំដំណើរការដ៏សាមញ្ញ និងងាយស្រួលបំផុតសម្រាប់អាជីពរបស់អ្នក។ អ្នកនឹងស្ទាត់ជំនាញលើ ៣ ជំហាន៖{" "}
                      <span className="text-[#004643] dark:text-[#dda15e] font-semibold">
                        ការជ្រើសរើសទម្រង់គំរូ ការសម្រួលអត្ថបទជាមួយ AI និងការទាញយក Vector PDF
                      </span>
                      ។
                    </>
                  ) : (
                    <>
                      We&apos;ve engineered a focused, distraction-free workflow for your career journey. You&apos;ll master three milestones:{" "}
                      <span className="text-[#004643] dark:text-[#dda15e] font-semibold">
                        Template Selection, AI Writing Polish, and Flawless Vector Export
                      </span>
                      .
                    </>
                  )}
                </p>

                <p className="mt-8 text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-[#F0EDE5]/75">
                  {isKhmer ? (
                    <>
                      មិនចាំបាច់បារម្ភអំពីការធ្លាក់ ATS កំហុសទម្រង់ ឬការគិតលុយលួចលាក់នោះទេ — អ្វីៗទាំងអស់ត្រូវបានរៀបចំយ៉ាងល្អឥតខ្ចោះ។ យើងផ្តល់សិទ្ធិអំណាចពេញលេញដល់អ្នក ដូច្នេះអ្នកអាច{" "}
                      <span className="text-[#004643] dark:text-[#dda15e] font-semibold">រីករាយជាមួយដំណើរការស្វែងរកការងារ</span>
                      ។
                    </>
                  ) : (
                    <>
                      No need to worry about ATS rejections, formatting glitches, or surprise subscription gates — everything is cleanly organized. We give you full control, so you can{" "}
                      <span className="text-[#004643] dark:text-[#dda15e] font-semibold">
                        simply enjoy the journey
                      </span>
                      .
                    </>
                  )}
                </p>
              </div>

              <div className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-5 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-[#004643] flex items-center justify-center text-[#dda15e]">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-neutral-900 dark:text-white">
                      Zero Telemetry Leak
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-[#F0EDE5]/60">
                      Your resume data is strictly stored in your private session.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Vertical Journey Timeline */}
            <div className="lg:col-span-7 flex flex-col gap-10">
              {/* Step 1: Canvas Selection */}
              <div className="flex gap-6 sm:gap-8 items-start">
                <div className="relative flex flex-col items-center">
                  <div className="size-5 rounded-full bg-[#004643] dark:bg-white ring-4 ring-[#004643]/20 dark:ring-white/20 shadow-md" />
                  <div className="w-px h-36 sm:h-40 bg-neutral-200 dark:bg-white/30 my-2" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#004643] dark:text-[#dda15e]">
                      {isKhmer ? "ដំណាក់កាលទី ១" : "Step 01"}
                    </span>
                    <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
                      {isKhmer ? "ជ្រើសរើសទម្រង់គំរូ" : "Select Canvas & Architecture"}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-[#F0EDE5]/75 leading-relaxed">
                    {t.landing.timelineSteps[0]?.desc ??
                      "Pick from 6 research-validated templates or import an existing PDF/JSON."}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="size-16 sm:size-20 rounded-xl border border-neutral-200 bg-[#004643] p-2 flex flex-col justify-center items-center shadow-md shrink-0">
                      <Layers size={22} className="text-[#dda15e]" />
                      <span className="mt-1 font-mono text-[9px] font-bold text-white/90">6 ATS</span>
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-[#F0EDE5]/60">
                      <span className="font-semibold text-neutral-900 dark:text-white block">
                        6 ATS-Engineered Designs
                      </span>
                      <span>Classic · Modern · Compact · Professional · Editorial · Designer</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: AI Copilot */}
              <div className="flex gap-6 sm:gap-8 items-start">
                <div className="relative flex flex-col items-center">
                  <div className="size-5 rounded-full bg-[#dda15e] ring-4 ring-[#dda15e]/25 shadow-md" />
                  <div className="w-px h-36 sm:h-40 bg-neutral-200 dark:bg-white/30 my-2" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#004643] dark:text-[#dda15e]">
                      {isKhmer ? "ដំណាក់កាលទី ២" : "Step 02"}
                    </span>
                    <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
                      {isKhmer ? "កែសម្រួលជាមួយ AI" : "AI Career Copilot & Live Canvas"}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-[#F0EDE5]/75 leading-relaxed">
                    {t.landing.timelineSteps[1]?.desc ??
                      "Grounded Gemini 2.5 suggestions that sharpen bullet points without hallucinating unearned accomplishments."}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="size-16 sm:size-20 rounded-xl border border-neutral-200 bg-[#003633] p-2 flex flex-col justify-center items-center shadow-md shrink-0">
                      <Sparkles size={22} className="text-amber-300 animate-pulse" />
                      <span className="mt-1 font-mono text-[9px] font-bold text-white/90">GEMINI</span>
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-[#F0EDE5]/60">
                      <span className="font-semibold text-neutral-900 dark:text-white block">
                        Google Gemini 2.5 Flash
                      </span>
                      <span>3x Impact Score · Side-by-side diff review</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Pure Vector PDF Export */}
              <div className="flex gap-6 sm:gap-8 items-start">
                <div className="relative flex flex-col items-center">
                  <div className="size-5 rounded-full bg-[#004643] dark:bg-white ring-4 ring-[#004643]/20 dark:ring-white/20 shadow-md" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#004643] dark:text-[#dda15e]">
                      {isKhmer ? "ដំណាក់កាលទី ៣" : "Step 03"}
                    </span>
                    <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
                      {isKhmer ? "ទាញយក Vector PDF" : "Flawless Vector PDF Compilation"}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-[#F0EDE5]/75 leading-relaxed">
                    {t.landing.timelineSteps[2]?.desc ??
                      "Download a clean, high-resolution A4 PDF formatted to perfection. Zero watermarks, zero recurring fees."}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="size-16 sm:size-20 rounded-xl border border-neutral-200 bg-[#004643] p-2 flex flex-col justify-center items-center shadow-md shrink-0">
                      <FileDown size={22} className="text-emerald-400" />
                      <span className="mt-1 font-mono text-[9px] font-bold text-white/90">A4 PDF</span>
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-[#F0EDE5]/60">
                      <span className="font-semibold text-neutral-900 dark:text-white block">
                        Print-Ready A4 Vector
                      </span>
                      <span>Zero Watermarks · Selectable Text · ATS 100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------- Signature Niseth Rule 2 ---------------------------- */}
      <div id="included" className="scroll-mt-20 my-10 sm:my-14 px-6">
        <div className="niseth-section-rule mx-auto max-w-5xl text-[#004643] dark:text-[#F0EDE5]">
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-[0.22em] text-center whitespace-nowrap px-4">
            {isKhmer ? "អ្វីដែលត្រូវបានរួមបញ្ចូល" : "WHAT'S INCLUDED"}
          </h2>
        </div>
      </div>

      {/* ----------------------------- What's Included (4 Glass Cards) ---------------------------- */}
      <section className="relative py-8 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: AI Copilot */}
            <div className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md dark:border-white/15 dark:bg-white/[0.04] dark:hover:border-white/35 dark:hover:bg-white/[0.07]">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#004643] text-[#dda15e] shadow-md">
                  <Sparkles size={22} />
                </div>
                <h3 className="mt-6 font-display text-lg font-bold text-neutral-900 dark:text-white">
                  {t.landing.features[0]?.title ?? "AI Career Copilot"}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-[#F0EDE5]/75">
                  {t.landing.features[0]?.body ??
                    "Grounded Gemini 2.5 recommendations that respect your real career without fabricating accomplishments."}
                </p>
              </div>
              <p className="mt-6 font-mono text-[11px] font-semibold text-[#004643] dark:text-[#dda15e]">
                BYOK Architecture
              </p>
            </div>

            {/* Card 2: Live Canvas */}
            <div className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md dark:border-white/15 dark:bg-white/[0.04] dark:hover:border-white/35 dark:hover:bg-white/[0.07]">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#004643] text-emerald-400 shadow-md">
                  <Eye size={22} />
                </div>
                <h3 className="mt-6 font-display text-lg font-bold text-neutral-900 dark:text-white">
                  {t.landing.features[1]?.title ?? "True A4 Live Canvas"}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-[#F0EDE5]/75">
                  {t.landing.features[1]?.body ??
                    "Instant dual-column editing with live pagination preview. What you see is precisely what compiles into your vector PDF."}
                </p>
              </div>
              <p className="mt-6 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                WYSIWYG Dual View
              </p>
            </div>

            {/* Card 3: Privacy */}
            <div className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md dark:border-white/15 dark:bg-white/[0.04] dark:hover:border-white/35 dark:hover:bg-white/[0.07]">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#004643] text-sky-400 shadow-md">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="mt-6 font-display text-lg font-bold text-neutral-900 dark:text-white">
                  {t.landing.features[2]?.title ?? "Absolute Privacy"}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-[#F0EDE5]/75">
                  {t.landing.features[2]?.body ??
                    "Strict session-scoped database ownership on Neon Postgres with TLS 1.3 encryption. Your data is never sold or trained on."}
                </p>
              </div>
              <p className="mt-6 font-mono text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                Encrypted Session
              </p>
            </div>

            {/* Card 4: Vector PDF */}
            <div className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md dark:border-white/15 dark:bg-white/[0.04] dark:hover:border-white/35 dark:hover:bg-white/[0.07]">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#004643] text-[#F0EDE5] shadow-md">
                  <FileDown size={22} />
                </div>
                <h3 className="mt-6 font-display text-lg font-bold text-neutral-900 dark:text-white">
                  {t.landing.features[3]?.title ?? "Flawless Vector PDF"}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-[#F0EDE5]/75">
                  {t.landing.features[3]?.body ??
                    "High-resolution vector compilation with embedded glyphs. 100% ATS parser compliant with clean selectable text."}
                </p>
              </div>
              <p className="mt-6 font-mono text-[11px] font-semibold text-[#004643] dark:text-[#F0EDE5]">
                Zero Watermark Forever
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------- Signature Niseth Rule 3 ---------------------------- */}
      <div id="templates" className="scroll-mt-20 my-10 sm:my-14 px-6">
        <div className="niseth-section-rule mx-auto max-w-5xl text-[#004643] dark:text-[#F0EDE5]">
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-[0.22em] text-center whitespace-nowrap px-4">
            {isKhmer ? "ទម្រង់គំរូទាំង ៦" : "CURATED TEMPLATES"}
          </h2>
        </div>
      </div>

      {/* ----------------------------- Template Gallery Showcase ---------------------------- */}
      <section className="relative py-8 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#004643] dark:text-[#dda15e]">
                {t.landing.templatesKicker}
              </p>
              <h3 className="mt-2 font-display text-2xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
                {t.landing.templatesTitle}
              </h3>
            </div>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-100 dark:border-white/20 dark:bg-white/10 px-5 py-2 text-xs font-semibold text-neutral-800 dark:text-white backdrop-blur-md transition hover:bg-neutral-200 dark:hover:bg-white dark:hover:text-neutral-950 w-fit"
            >
              <span>{t.landing.ctaTemplates}</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {t.landing.templates.map((tpl, idx) => (
              <Link
                key={tpl.name}
                href={`/login?template=${tpl.name.toLowerCase()}&mode=signup`}
                className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md dark:border-white/15 dark:bg-white/[0.04] dark:hover:border-white/35 dark:hover:bg-white/[0.08]"
              >
                <div className="relative flex h-[190px] items-center justify-center overflow-hidden rounded-xl bg-neutral-100 p-2 dark:bg-black/40">
                  {TEMPLATE_THUMBS[idx]}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-2xs transition-opacity group-hover:opacity-100">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-neutral-950 shadow-md">
                      {isKhmer ? "ជ្រើសរើស" : "Select"}
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-1 flex-col justify-between">
                  <div>
                    <h4 className="font-display text-sm font-bold text-neutral-900 dark:text-white">
                      {tpl.name}
                    </h4>
                    <p className="mt-1 text-xs text-neutral-600 dark:text-[#F0EDE5]/65 line-clamp-2">
                      {tpl.blurb}
                    </p>
                  </div>
                  <p className="mt-3 text-[11px] font-semibold text-[#004643] dark:text-[#dda15e]">
                    {tpl.note}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- Signature Niseth Rule 4 ---------------------------- */}
      <div id="reviews" className="scroll-mt-20 my-10 sm:my-14 px-6">
        <div className="niseth-section-rule mx-auto max-w-5xl text-[#004643] dark:text-[#F0EDE5]">
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-[0.22em] text-center whitespace-nowrap px-4">
            {isKhmer ? "មតិយោបល់ពីអ្នកប្រើប្រាស់" : "COMMUNITY REVIEWS"}
          </h2>
        </div>
      </div>

      {/* ----------------------------- Community Reviews ---------------------------- */}
      <section className="relative py-8 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-3">
            {t.landing.reviews.map((rev) => (
              <div
                key={rev.name}
                className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-7 shadow-xs transition hover:border-neutral-300 hover:shadow-md dark:border-white/15 dark:bg-white/[0.04] dark:hover:border-white/30"
              >
                <p className="text-sm leading-relaxed text-neutral-700 dark:text-[#F0EDE5]/85">
                  &ldquo;{rev.text}&rdquo;
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-neutral-200 dark:border-white/10 pt-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#004643] text-xs font-bold text-[#F0EDE5] border border-white/20">
                    {rev.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{rev.name}</h4>
                    <p className="text-xs text-neutral-500 dark:text-[#F0EDE5]/65">{rev.role}</p>
                    <p className="text-[11px] font-semibold text-[#004643] dark:text-[#dda15e]">
                      {rev.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- Clean Bottom Contact / Quick Launch ---------------------------- */}
      <section id="contact" className="relative scroll-mt-20 mt-16 px-6 py-16 sm:py-24">
        {/* Soft Ambient Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] opacity-15 dark:opacity-30 blur-[140px]"
            style={{
              background: "radial-gradient(circle, #004643 0%, rgba(221,161,94,0.15) 50%, transparent 80%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-6xl relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Glassmorphic Quick Launch Card */}
            <div className="lg:col-span-6">
              <div className="rounded-[28px] border border-neutral-200 bg-white p-8 sm:p-10 shadow-lg dark:border-white/15 dark:bg-white/[0.04] dark:backdrop-blur-xl">
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white leading-tight">
                  {isKhmer
                    ? "ចង់បានប្រវត្តិរូបអាជីព ប៉ុន្តែនៅមានសំណួរ?"
                    : "Want to craft a standout resume, but still have questions?"}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-[#F0EDE5]/70">
                  {isKhmer ? "ផ្ញើសំណើរបស់អ្នក — ចាប់ផ្តើមភ្លាមៗ" : "Leave a request — start your draft in seconds"}
                </p>

                <form onSubmit={handleLaunchSubmit} className="mt-8 flex flex-col gap-6">
                  <div>
                    <label className="text-xs uppercase tracking-wider font-semibold text-neutral-700 dark:text-[#F0EDE5]/70 block">
                      {isKhmer ? "ឈ្មោះរបស់អ្នក" : "Your name"}
                    </label>
                    <input
                      type="text"
                      required
                      value={launchName}
                      onChange={(e) => setLaunchName(e.target.value)}
                      placeholder={isKhmer ? "ឈ្មោះពេញ..." : "Sokha Chan"}
                      className="mt-1.5 w-full border-b border-neutral-300 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#004643] focus:outline-none transition-colors dark:border-white/35 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white bg-transparent"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider font-semibold text-neutral-700 dark:text-[#F0EDE5]/70 block">
                      {isKhmer ? "តួនាទី ឬមុខងារ" : "Target role"}
                    </label>
                    <input
                      type="text"
                      value={launchRole}
                      onChange={(e) => setLaunchRole(e.target.value)}
                      placeholder={isKhmer ? "ឧ. Senior Frontend Engineer" : "Principal Product Designer"}
                      className="mt-1.5 w-full border-b border-neutral-300 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#004643] focus:outline-none transition-colors dark:border-white/35 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white bg-transparent"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider font-semibold text-neutral-700 dark:text-[#F0EDE5]/70 block">
                      {isKhmer ? "អ៊ីមែល ឬលេខទូរស័ព្ទ" : "Email or phone number"}
                    </label>
                    <input
                      type="email"
                      required
                      value={launchEmail}
                      onChange={(e) => setLaunchEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="mt-1.5 w-full border-b border-neutral-300 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#004643] focus:outline-none transition-colors dark:border-white/35 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white bg-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#004643] text-white hover:bg-[#003835] dark:bg-white dark:text-neutral-950 dark:hover:bg-[#F0EDE5] py-3.5 px-8 text-sm font-bold shadow-xl transition active:scale-95 cursor-pointer"
                  >
                    <span>{isKhmer ? "ចាប់ផ្តើមកសាងប្រវត្តិរូប" : "Launch Live Editor"}</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Studio Note & Socials */}
            <div className="lg:col-span-6 flex flex-col justify-end text-left lg:text-right">
              <div className="lg:ml-auto max-w-md">
                <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 text-neutral-800 dark:border-white/20 dark:bg-white/[0.06] px-3.5 py-1 text-xs font-semibold text-[#004643] dark:text-[#dda15e] backdrop-blur-md mb-4">
                  ✦ {isKhmer ? "ឥតគិតថ្លៃ ១០០%" : "Free & Open Source"}
                </span>
                <h4 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">
                  Niseth Code Studio
                </h4>
                <p className="mt-2 text-sm text-neutral-600 dark:text-[#F0EDE5]/75 leading-relaxed">
                  {isKhmer
                    ? "កសាងប្រវត្តិរូបការងារដែលមានប្រសិទ្ធភាពខ្ពស់ ឆ្លងកាត់ប្រព័ន្ធ ATS ដោយមិនចាំបាច់បង់ប្រាក់ប្រចាំខែ។"
                    : "Empowering professionals with precision vector typography, grounded AI writing tools, and absolute session privacy."}
                </p>

                {/* Social Icons */}
                <div className="mt-8 flex items-center justify-start lg:justify-end gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="size-10 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 dark:border-white/20 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white dark:hover:text-neutral-950 flex items-center justify-center transition-colors"
                  >
                    <InstagramIcon size={17} />
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                    className="size-10 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 dark:border-white/20 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white dark:hover:text-neutral-950 flex items-center justify-center transition-colors"
                  >
                    <Globe size={17} />
                  </a>
                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Telegram"
                    className="size-10 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 dark:border-white/20 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white dark:hover:text-neutral-950 flex items-center justify-center transition-colors"
                  >
                    <Send size={17} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------- Clean Bottom Footer ---------------------------- */}
      <footer className="mt-auto border-t border-neutral-200 bg-neutral-50/80 text-neutral-600 dark:border-white/10 dark:bg-[#001210] dark:text-[#F0EDE5]/75 py-12 transition-colors">
        <div className="mx-auto flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl px-6">
          <Link href="/" aria-label="Niseth Code Home">
            <Wordmark />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-neutral-600 dark:text-[#F0EDE5]/80">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-neutral-950 dark:hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link href="/privacy" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
              {isKhmer ? "ឯកជនភាព" : "Privacy"}
            </Link>
          </div>

          <Link
            href="/login?mode=signup"
            className="rounded-full bg-[#004643] text-white hover:bg-[#003835] dark:bg-white dark:text-neutral-950 dark:hover:bg-[#F0EDE5] px-5 py-2 text-xs font-bold shadow-sm transition cursor-pointer"
          >
            {isKhmer ? "ចុះឈ្មោះឥតគិតថ្លៃ" : "Create Resume"}
          </Link>
        </div>

        <div className="mx-auto mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-neutral-200 dark:border-white/10 max-w-7xl px-6 pt-6 text-[11px] text-neutral-500 dark:text-[#F0EDE5]/50">
          <span>{t.landing.footerCopyright}</span>
          <span>
            {isKhmer
              ? "រចនាឡើងប្រកបដោយភាពផ្ចិតផ្ចង់ជាមួយ Poppins និង Kantumruy Pro."
              : "Crafted with Poppins & Kantumruy Pro."}
          </span>
        </div>
      </footer>
    </div>
  );
}

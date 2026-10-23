"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  FileDown,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export type HeroTemplateKey = "modern" | "editorial" | "designer" | "classic" | "compact";

interface Hero3dCvProps {
  defaultTemplate?: HeroTemplateKey;
  className?: string;
  showRibbon?: boolean;
  showBottomBar?: boolean;
}

export function Hero3dCv({
  defaultTemplate = "modern",
  className = "",
  showRibbon = false,
  showBottomBar = false,
}: Hero3dCvProps) {
  const { isKhmer } = useLanguage();
  const [activeTemplate, setActiveTemplate] = useState<HeroTemplateKey>(defaultTemplate);
  const [isHovered, setIsHovered] = useState(false);
  const [rotX, setRotX] = useState(8);
  const [rotY, setRotY] = useState(-14);
  const [sheenPos, setSheenPos] = useState({ x: 50, y: 50 });

  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Tilt limits: rotateY between -18 and +18 deg, rotateX between -14 and +14 deg
    const newRotY = (x - 0.5) * 28;
    const newRotX = (0.5 - y) * 22;

    setRotY(newRotY);
    setRotX(newRotX);
    setSheenPos({ x: x * 100, y: y * 100 });
  }, []);

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    // Smoothly return to inviting isometric resting angle
    setRotX(8);
    setRotY(-14);
    setSheenPos({ x: 50, y: 50 });
  }, []);

  const templateOptions: { id: HeroTemplateKey; label: string; badge: string }[] = [
    { id: "modern", label: isKhmer ? "Modern" : "Modern", badge: "ATS Preferred" },
    { id: "editorial", label: isKhmer ? "Editorial" : "Editorial", badge: "2-Column" },
    { id: "designer", label: isKhmer ? "Designer" : "Designer", badge: "Precision" },
    { id: "classic", label: isKhmer ? "Classic" : "Classic", badge: "Gold Standard" },
    { id: "compact", label: isKhmer ? "Compact" : "Compact", badge: "High Density" },
  ];

  return (
    <div className={`relative mx-auto w-full max-w-[460px] select-none ${className}`}>
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 -z-10 rounded-full opacity-60 blur-3xl transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(0, 70, 67, 0.5) 0%, rgba(221, 161, 94, 0.15) 50%, transparent 80%)",
        }}
      />

      {/* Top Template Selector Ribbon */}
      {showRibbon && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100/90 p-1 backdrop-blur-md dark:border-white/20 dark:bg-black/40">
            {templateOptions.map((opt) => {
              const isActive = activeTemplate === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActiveTemplate(opt.id)}
                  className={`relative rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#004643] text-white shadow-md ring-1 ring-[#004643]/30 dark:ring-white/30"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-[#004643] dark:text-[#dda15e]">
            <Zap size={13} />
            <span>{isKhmer ? "បង្វិល 3D ដោយសេរី" : "Interactive 3D"}</span>
          </div>
        </div>
      )}

      {/* 3D Perspective Stage */}
      <div
        className="perspective-[1200px] w-full"
        style={{ perspective: "1200px" }}
      >
        <div
          ref={cardRef}
          onPointerMove={handlePointerMove}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          className="relative w-full cursor-grab active:cursor-grabbing transition-transform duration-200 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(1deg)`,
            transition: isHovered ? "transform 0.08s ease-out" : "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          {/* Floating 3D Badge 1: ATS Score (Top-Right) */}
          <div
            className="pointer-events-none absolute -top-3 -right-2 sm:-right-4 z-30 flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-[#002724]/90 px-3.5 py-1 text-[11px] font-bold text-white shadow-xl backdrop-blur-md"
            style={{
              transform: "translateZ(38px)",
            }}
          >
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ATS 98/100 · Optimal</span>
          </div>

          {/* Floating 3D Badge 2: Grounded AI Copilot (Left Edge) */}
          <div
            className="pointer-events-none absolute top-28 -left-3 sm:-left-5 z-30 hidden sm:flex items-center gap-1.5 rounded-full border border-[#dda15e]/30 bg-[#001f1d]/95 px-3 py-1 text-[10.5px] font-bold text-[#dda15e] shadow-xl backdrop-blur-md"
            style={{
              transform: "translateZ(32px)",
            }}
          >
            <Sparkles size={12} className="text-[#dda15e]" />
            <span>Gemini 2.5 · Grounded</span>
          </div>

          {/* Floating 3D Badge 3: Vector PDF Export (Bottom-Right) */}
          <div
            className="pointer-events-none absolute -bottom-3 -right-2 sm:-right-4 z-30 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/85 px-3.5 py-1 text-[11px] font-bold text-white shadow-xl backdrop-blur-md"
            style={{
              transform: "translateZ(34px)",
            }}
          >
            <FileDown size={13} className="text-[#dda15e]" />
            <span>Pure Vector A4 PDF</span>
          </div>

          {/* Main 3D CV Paper Sheet */}
          <div
            className="relative overflow-hidden rounded-[18px] border border-white/30 bg-white text-neutral-900 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85),0_0_50px_rgba(0,70,67,0.3)]"
            style={{
              aspectRatio: "1 / 1.414", // Exact A4 proportions
              transform: "translateZ(0px)",
            }}
          >
            {/* Specular Light Sheen Overlay (Tracks pointer) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 opacity-30 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle 380px at ${sheenPos.x}% ${sheenPos.y}%, rgba(255,255,255,0.7) 0%, transparent 65%)`,
              }}
            />

            {/* Subtle Page Edge Depth */}
            <div className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-inset ring-black/10" />

            {/* Template Render Inside the 3D Sheet */}
            {activeTemplate === "modern" && <ModernHeroLayout />}
            {activeTemplate === "editorial" && <EditorialHeroLayout />}
            {activeTemplate === "designer" && <DesignerHeroLayout />}
            {activeTemplate === "classic" && <ClassicHeroLayout />}
            {activeTemplate === "compact" && <CompactHeroLayout />}
          </div>
        </div>
      </div>

      {/* Bottom CTA & Template Quick Launch */}
      {showBottomBar && (
        <div className="mt-5 flex items-center justify-between gap-3 px-1">
          <div className="text-xs text-neutral-600 dark:text-[#F0EDE5]/70">
            <span className="font-semibold text-neutral-900 dark:text-white block">
              {templateOptions.find((t) => t.id === activeTemplate)?.badge}
            </span>
            <span className="text-[11px]">Ready to customize in live canvas</span>
          </div>

          <Link
            href={`/login?mode=signup&template=${activeTemplate}`}
            className="inline-flex items-center gap-2 rounded-full bg-[#004643] text-white hover:bg-[#003835] dark:bg-white dark:text-neutral-950 dark:hover:bg-[#F0EDE5] px-4 py-2 text-xs font-bold shadow-lg transition active:scale-95 group"
          >
            <span>{isKhmer ? "ប្រើទម្រង់នេះ" : "Use This Template"}</span>
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               TEMPLATE LAYOUTS                             */
/* -------------------------------------------------------------------------- */

function ModernHeroLayout() {
  return (
    <div className="flex h-full flex-col font-sans text-[11px] leading-tight">
      {/* Top Teal Brand Header */}
      <div className="bg-[#004643] px-5 py-4 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-base sm:text-lg font-bold tracking-tight">
              Alex Rivera
            </h1>
            <p className="text-[10px] sm:text-[11px] font-medium text-[#dda15e]">
              Principal Cloud & Distributed Systems Architect
            </p>
          </div>
          <span className="rounded bg-white/15 px-1.5 py-0.5 text-[8px] font-mono tracking-wider uppercase">
            A4 ATS
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-white/80 border-t border-white/15 pt-2">
          <span>San Francisco, CA</span>
          <span>•</span>
          <span>alex@rivera.dev</span>
          <span>•</span>
          <span>github.com/alexrivera</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 space-y-3.5 p-5 text-neutral-800">
        {/* Summary */}
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#004643] border-b border-[#004643]/20 pb-0.5">
            Professional Profile
          </h2>
          <p className="mt-1 text-[9px] sm:text-[10px] leading-relaxed text-neutral-700">
            Systems Architect with 8+ years designing high-throughput distributed microservices,
            zero-trust infrastructure, and multi-region Kubernetes control planes. Cut annualized cloud
            spend by $1.4M while achieving 99.995% service uptime at global scale.
          </p>
        </div>

        {/* Experience */}
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#004643] border-b border-[#004643]/20 pb-0.5">
            Key Experience
          </h2>

          <div className="mt-2 space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-[9.5px]">
                <span className="font-bold text-neutral-900">
                  Principal Infrastructure Architect
                </span>
                <span className="text-neutral-500 font-mono text-[8.5px]">2022 — Present</span>
              </div>
              <p className="text-[9px] font-semibold text-[#004643]">Starlight Cloud Platforms</p>
              <ul className="mt-1 space-y-1 text-[8.5px] sm:text-[9px] text-neutral-600 list-disc list-inside">
                <li>
                  Architected multi-region Kubernetes control plane managing 4,000+ nodes with sub-second failover.
                </li>
                <li>
                  Reduced p99 API latency by 42% across 18M daily events using Kafka & Rust microservices.
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center justify-between text-[9.5px]">
                <span className="font-bold text-neutral-900">Lead Platform Engineer</span>
                <span className="text-neutral-500 font-mono text-[8.5px]">2019 — 2022</span>
              </div>
              <p className="text-[9px] font-semibold text-[#004643]">Apex Distributed Data</p>
              <ul className="mt-1 space-y-1 text-[8.5px] sm:text-[9px] text-neutral-600 list-disc list-inside">
                <li>
                  Standardized GitOps CI/CD with Terraform, shrinking deployment cycle from 4 days to 15 minutes.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Skills Pills */}
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#004643] border-b border-[#004643]/20 pb-0.5">
            Core Competencies
          </h2>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {[
              "Distributed Systems",
              "Kubernetes",
              "Next.js 16",
              "TypeScript",
              "PostgreSQL",
              "Terraform",
              "Rust",
              "GraphQL",
            ].map((skill) => (
              <span
                key={skill}
                className="rounded-sm bg-neutral-100 px-1.5 py-0.5 text-[8.5px] font-medium text-neutral-700 border border-neutral-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorialHeroLayout() {
  return (
    <div className="flex h-full font-sans text-[11px] leading-tight">
      {/* Left Column (35%) */}
      <div className="w-[34%] bg-[#f5f5f7] border-r border-neutral-200 p-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Photo Monogram Block */}
          <div className="size-14 rounded-xl bg-[#004643] text-[#dda15e] flex items-center justify-center font-display text-xl font-bold shadow-md">
            AR
          </div>

          <div>
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-0.5">
              Contact
            </h3>
            <div className="mt-1.5 space-y-1 text-[8px] text-neutral-600">
              <p className="font-medium text-neutral-800">San Francisco, CA</p>
              <p>alex@rivera.dev</p>
              <p>+1 (555) 234-5678</p>
              <p className="text-[#004643] font-medium">rivera-cloud.dev</p>
            </div>
          </div>

          <div>
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-0.5">
              Education
            </h3>
            <div className="mt-1.5 text-[8px] text-neutral-700">
              <p className="font-bold text-neutral-900">B.S. Computer Science</p>
              <p className="text-neutral-500">UC Berkeley · 2018</p>
              <p className="text-[7.5px] text-[#dda15e] font-semibold mt-0.5">Magna Cum Laude</p>
            </div>
          </div>

          <div>
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-0.5">
              Expertise
            </h3>
            <div className="mt-1.5 flex flex-col gap-1 text-[8px] text-neutral-600">
              <span>✦ Multi-Cloud Kubernetes</span>
              <span>✦ Zero-Trust Identity</span>
              <span>✦ Event-Driven Kafka</span>
              <span>✦ Vector Databases</span>
            </div>
          </div>
        </div>

        <div className="text-[7.5px] text-neutral-400 font-mono">
          Niseth Code · Editorial
        </div>
      </div>

      {/* Right Column (65%) */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="space-y-3.5">
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-neutral-900">
              Alex Rivera
            </h1>
            <p className="text-[10px] font-semibold text-[#004643] uppercase tracking-wide">
              Principal Systems Architect
            </p>
            <div className="my-2 h-[2px] w-12 bg-[#dda15e]" />
            <p className="text-[9px] leading-relaxed text-neutral-600">
              Architecting high-throughput distributed infrastructure, resilient data pipelines, and developer platforms across modern hybrid clouds.
            </p>
          </div>

          <div>
            <h2 className="text-[9.5px] font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-0.5">
              Experience
            </h2>

            <div className="mt-2 space-y-2">
              <div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className="font-bold text-neutral-900">Starlight Platforms</span>
                  <span className="text-neutral-500 font-mono text-[8px]">2022 — Present</span>
                </div>
                <p className="text-[8.5px] font-medium text-[#004643]">Principal Infrastructure Architect</p>
                <p className="mt-0.5 text-[8.5px] text-neutral-600 leading-snug">
                  • Led migration of 180 microservices to zero-trust architecture, eliminating perimeter breaches.
                </p>
                <p className="mt-0.5 text-[8.5px] text-neutral-600 leading-snug">
                  • Cut cloud egress spend by $1.4M with edge cache optimization.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className="font-bold text-neutral-900">Apex Distributed Data</span>
                  <span className="text-neutral-500 font-mono text-[8px]">2019 — 2022</span>
                </div>
                <p className="text-[8.5px] font-medium text-[#004643]">Senior Platform Engineer</p>
                <p className="mt-0.5 text-[8.5px] text-neutral-600 leading-snug">
                  • Scaled Kafka data streaming pipeline to 180,000 events/second with sub-5ms latency.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-2 flex items-center justify-between text-[8px] text-neutral-500">
          <span>ATS Compliant Layout</span>
          <span className="font-semibold text-[#004643]">100% Verified</span>
        </div>
      </div>
    </div>
  );
}

function DesignerHeroLayout() {
  return (
    <div className="flex h-full flex-col p-5 font-sans text-[11px] leading-tight">
      {/* Top Banner with Accent Line */}
      <div className="flex items-center justify-between border-b-2 border-[#004643] pb-3">
        <div>
          <h1 className="font-display text-lg font-bold tracking-tight text-neutral-900">
            Alex Rivera
          </h1>
          <p className="text-[10px] font-semibold text-[#dda15e] uppercase tracking-wider">
            Lead Infrastructure Architect & Full-Stack Engineer
          </p>
        </div>
        <div className="size-10 rounded-full border-2 border-[#004643] flex items-center justify-center font-display text-xs font-bold text-[#004643]">
          AR
        </div>
      </div>

      {/* Grid Content */}
      <div className="mt-3.5 grid grid-cols-12 gap-4 flex-1">
        {/* Left Column (4 cols) */}
        <div className="col-span-4 space-y-3 border-r border-neutral-200 pr-3">
          <div>
            <h3 className="text-[8.5px] font-bold uppercase tracking-wider text-neutral-900">
              Contacts
            </h3>
            <div className="mt-1 space-y-0.5 text-[8px] text-neutral-600">
              <p>SF Bay Area</p>
              <p>alex@rivera.dev</p>
              <p>+1 555-234-5678</p>
            </div>
          </div>

          <div>
            <h3 className="text-[8.5px] font-bold uppercase tracking-wider text-neutral-900">
              Stack
            </h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {["Kubernetes", "Next.js", "TypeScript", "Postgres", "Terraform", "Rust"].map((s) => (
                <span
                  key={s}
                  className="rounded-xs bg-[#004643]/10 px-1 py-0.5 text-[7.5px] font-semibold text-[#004643]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[8.5px] font-bold uppercase tracking-wider text-neutral-900">
              Honors
            </h3>
            <p className="mt-0.5 text-[7.5px] text-neutral-600">
              AWS Certified Solutions Architect Pro · CKA Certified Kubernetes Admin
            </p>
          </div>
        </div>

        {/* Right Column (8 cols) */}
        <div className="col-span-8 space-y-3">
          <div>
            <h3 className="text-[8.5px] font-bold uppercase tracking-wider text-neutral-900">
              Statement
            </h3>
            <p className="mt-1 text-[8.5px] text-neutral-700 leading-snug">
              Designing carrier-grade infrastructure with mathematical cut-point precision. Committed to open systems, clean code, and zero-downtime deployments.
            </p>
          </div>

          <div>
            <h3 className="text-[8.5px] font-bold uppercase tracking-wider text-neutral-900">
              Selected Engagements
            </h3>
            <div className="mt-1.5 space-y-2 text-[8px] text-neutral-700">
              <div>
                <p className="font-bold text-neutral-900">Starlight Platforms — Principal Architect</p>
                <p className="text-neutral-500">2022 — Present · Multi-Cloud</p>
                <p className="mt-0.5 text-neutral-600">
                  • Scaled distributed cluster across 4,000+ nodes with automated failure mitigation.
                </p>
              </div>
              <div>
                <p className="font-bold text-neutral-900">Apex Distributed — Lead Engineer</p>
                <p className="text-neutral-500">2019 — 2022 · Kafka Architecture</p>
                <p className="mt-0.5 text-neutral-600">
                  • Deployed high-throughput event bus handling 180k msgs/sec.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Declaration Statement */}
      <div className="border-t border-neutral-200 pt-2 text-[7.5px] text-neutral-400 font-mono flex justify-between">
        <span>Formal ATS Portfolio Declaration</span>
        <span>Verified Vector Clean</span>
      </div>
    </div>
  );
}

function ClassicHeroLayout() {
  return (
    <div className="flex h-full flex-col p-5 font-serif text-[11px] leading-tight text-neutral-900">
      {/* Centered Classic Header */}
      <div className="text-center border-b border-neutral-300 pb-3">
        <h1 className="text-base font-bold tracking-normal uppercase">Alex Rivera</h1>
        <p className="font-sans text-[9px] text-neutral-600 mt-1">
          San Francisco, CA • (555) 234-5678 • alex@rivera.dev • linkedin.com/in/alexrivera
        </p>
      </div>

      <div className="mt-3 space-y-3 flex-1 font-sans">
        <div>
          <h2 className="font-serif text-[10px] font-bold uppercase tracking-wider border-b border-neutral-300 pb-0.5">
            Professional Summary
          </h2>
          <p className="mt-1 text-[8.5px] leading-relaxed text-neutral-700 font-serif">
            Distinguished Infrastructure Architect with extensive experience in cloud architecture, distributed systems, and team leadership. Demonstrated track record delivering high-availability services and optimizing compute costs.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-[10px] font-bold uppercase tracking-wider border-b border-neutral-300 pb-0.5">
            Work Experience
          </h2>
          <div className="mt-1.5 space-y-2">
            <div>
              <div className="flex justify-between text-[9px] font-bold">
                <span>Starlight Cloud Platforms</span>
                <span>2022 – Present</span>
              </div>
              <p className="italic text-[8.5px] text-neutral-600">Principal Systems Architect</p>
              <ul className="list-disc list-inside mt-0.5 text-[8px] text-neutral-700 space-y-0.5">
                <li>Managed global Kubernetes deployment spanning 4,000+ server instances.</li>
                <li>Achieved 99.995% uptime across mission-critical services.</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-[10px] font-bold uppercase tracking-wider border-b border-neutral-300 pb-0.5">
            Education
          </h2>
          <div className="mt-1 flex justify-between text-[8.5px]">
            <span className="font-bold">University of California, Berkeley</span>
            <span>2014 – 2018</span>
          </div>
          <p className="text-[8px] text-neutral-600">Bachelor of Science in Computer Science, Magna Cum Laude</p>
        </div>
      </div>
    </div>
  );
}

function CompactHeroLayout() {
  return (
    <div className="flex h-full flex-col p-4 font-sans text-[10.5px] leading-tight">
      <div className="flex justify-between items-baseline border-b border-neutral-300 pb-2">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Alex Rivera</h1>
          <p className="text-[9.5px] font-semibold text-[#004643]">Senior Infrastructure Architect</p>
        </div>
        <p className="text-[8px] text-neutral-500 font-mono text-right">
          alex@rivera.dev • +1 555-234-5678<br />San Francisco, CA
        </p>
      </div>

      <div className="mt-2.5 flex-1 space-y-2.5 text-[8px]">
        <div>
          <span className="font-bold uppercase tracking-wider text-[#004643] block border-b border-neutral-200 pb-0.5">
            Experience (Dense Flow)
          </span>
          <div className="mt-1 space-y-1.5">
            <div>
              <div className="flex justify-between font-bold text-neutral-900">
                <span>Starlight Cloud · Principal Architect</span>
                <span className="font-mono text-neutral-500">2022 — Pres.</span>
              </div>
              <p className="text-neutral-600">
                • Engineered multi-region cluster with automated failover and zero perimeter breach events.
              </p>
            </div>
            <div>
              <div className="flex justify-between font-bold text-neutral-900">
                <span>Apex Data · Lead Platform Engineer</span>
                <span className="font-mono text-neutral-500">2019 — 2022</span>
              </div>
              <p className="text-neutral-600">
                • Built Kafka pipeline handling 180,000 events/sec with sub-5ms latency.
              </p>
            </div>
          </div>
        </div>

        <div>
          <span className="font-bold uppercase tracking-wider text-[#004643] block border-b border-neutral-200 pb-0.5">
            Skills & Certifications
          </span>
          <p className="mt-1 text-neutral-700 leading-normal">
            Kubernetes, Terraform, Next.js, TypeScript, PostgreSQL, Rust, AWS Certified Solutions Architect Pro, CKA.
          </p>
        </div>
      </div>
    </div>
  );
}

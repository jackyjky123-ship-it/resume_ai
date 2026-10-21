import {
  ArrowRight,
  CloudOff,
  Download,
  Eye,
  FileDown,
  FilePlus,
  Heart,
  Infinity as InfinityIcon,
  Lock,
  MoreHorizontal,
  PenLine,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { StoryCard } from "@/components/marketing/story-card";
import { Wordmark } from "@/components/wordmark";

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-3 py-1 text-xs font-semibold text-graphite">
    <span aria-hidden className="ig-line size-1.5 rounded-full" />
    {children}
  </p>
);

const steps: { icon: LucideIcon; title: string; caption: string }[] = [
  {
    icon: FilePlus,
    title: "Create",
    caption: "A blank resume is one click away",
  },
  {
    icon: PenLine,
    title: "Write",
    caption: "Sections for the real story: work, school, skills",
  },
  {
    icon: Sparkles,
    title: "Ask AI",
    caption: "Suggestions you accept or reject — never auto-applied",
  },
  {
    icon: Eye,
    title: "Preview",
    caption: "Your template fills in as you type",
  },
  {
    icon: Download,
    title: "Export",
    caption: "Download an A4 PDF, watermark-free",
  },
];

const features: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: InfinityIcon,
    title: "Free for real",
    body: "The full editor, every template, and unlimited PDF exports. No trial clock, no upgrade wall.",
  },
  {
    icon: Eye,
    title: "Editor with a live preview",
    body: "Fill structured sections and watch the template update with every keystroke.",
  },
  {
    icon: Sparkles,
    title: "AI that waits for your approval",
    body: "Suggestions arrive next to the original. Accept one, reject the rest — nothing is rewritten on its own.",
  },
  {
    icon: CloudOff,
    title: "Works when AI is down",
    body: "A slow provider never blocks your edit. Writing and exporting keep working through outages and spent quotas.",
  },
  {
    icon: FileDown,
    title: "PDF without watermarks",
    body: "A4 pages, selectable text, sensible margins. The document you send is the document you made.",
  },
  {
    icon: Lock,
    title: "Private by design",
    body: "AI requests carry only the field you are improving. Your full resume never travels for a small suggestion.",
  },
];

const Bar = ({ w, dark }: { w: string; dark?: boolean }) => (
  <div
    className={`h-[3px] shrink-0 rounded-full ${dark ? "bg-foreground/70" : "bg-foreground/20"}`}
    style={{ width: w }}
  />
);

const ClassicThumb = () => (
  <div className="flex h-full w-[138px] flex-col gap-[5px] rounded-md bg-white p-2.5 ring-1 ring-black/5">
    <Bar w="55%" dark />
    <Bar w="34%" />
    <div className="my-[2px] h-px bg-hairline" />
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
  <div className="flex h-full w-[138px] flex-col overflow-hidden rounded-md bg-white ring-1 ring-black/5">
    <div className="ig-panel flex h-[34px] items-center p-2.5">
      <div className="h-[6px] w-[44px] rounded-full bg-white/90" />
    </div>
    <div className="flex flex-col gap-[5px] p-2.5">
      <Bar w="24%" dark />
      <Bar w="92%" />
      <Bar w="78%" />
      <div className="ig-line my-[1px] h-[2px] w-[38px] rounded-full" />
      <Bar w="24%" dark />
      <Bar w="86%" />
      <Bar w="64%" />
    </div>
  </div>
);

const CompactThumb = () => (
  <div className="flex h-full w-[138px] flex-col gap-2 rounded-md bg-white p-2.5 ring-1 ring-black/5">
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
  <div className="flex h-full w-[138px] flex-col overflow-hidden rounded-md bg-white ring-1 ring-black/5">
    {/* Dark executive header */}
    <div className="flex flex-col gap-1 bg-[#1e293b] p-2 text-white">
      <div className="h-[5px] w-[65%] rounded-full bg-white" />
      <div className="h-[3px] w-[45%] rounded-full bg-white/70" />
    </div>
    <div className="flex flex-col gap-[5px] p-2">
      <div className="flex gap-1">
        <Bar w="28%" />
        <Bar w="28%" />
        <Bar w="28%" />
      </div>
      <div className="my-[2px] h-px bg-hairline" />
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
  <div className="flex h-full w-[138px] gap-2 rounded-md bg-white p-2.5 ring-1 ring-black/5">
    {/* Left column */}
    <div className="flex w-[40px] shrink-0 flex-col gap-1">
      <div className="my-[2px] aspect-[3/4] w-full rounded-[2px] bg-neutral-300" />
      <Bar w="60%" dark />
      <Bar w="90%" />
      <Bar w="75%" />
      <Bar w="60%" dark />
      <Bar w="80%" />
    </div>
    {/* Right column */}
    <div className="flex flex-1 flex-col gap-1">
      <Bar w="85%" dark />
      <div className="h-[2px] w-[65%] rounded-full bg-[#3b6998]" />
      <Bar w="32%" dark />
      <Bar w="100%" />
      <Bar w="88%" />
      {/* Dashed skill box */}
      <div className="my-[1px] flex flex-col gap-[2px] rounded border border-dashed border-neutral-300 bg-neutral-50 p-1">
        <div className="flex gap-1">
          <Bar w="48%" />
          <Bar w="48%" />
        </div>
        <div className="flex gap-1">
          <Bar w="48%" />
          <Bar w="48%" />
        </div>
      </div>
      <Bar w="32%" dark />
      <Bar w="95%" />
      <Bar w="85%" />
      <Bar w="32%" dark />
      <Bar w="90%" />
    </div>
  </div>
);

const DesignerThumb = () => (
  <div className="flex h-full w-[138px] flex-col rounded-md bg-white p-2.5 ring-1 ring-black/5">
    {/* Header with portrait photo placeholder */}
    <div className="flex items-center gap-1.5 border-b border-neutral-200 pb-1.5">
      <div className="h-6 w-5 shrink-0 rounded-xs bg-[#2563eb]" />
      <div className="flex flex-1 flex-col gap-[3px]">
        <Bar w="80%" dark />
        <Bar w="50%" />
      </div>
    </div>
    {/* Two columns with vertical divider */}
    <div className="flex flex-1 pt-1.5">
      <div className="flex w-[38%] shrink-0 flex-col gap-1 border-r border-neutral-200 pr-1">
        <Bar w="60%" dark />
        <Bar w="90%" />
        <Bar w="75%" />
        <Bar w="60%" dark />
        <Bar w="85%" />
      </div>
      <div className="flex flex-1 flex-col gap-1 pl-1.5">
        <Bar w="50%" dark />
        <Bar w="95%" />
        <Bar w="88%" />
        <Bar w="50%" dark />
        <Bar w="92%" />
      </div>
    </div>
  </div>
);

const templates: {
  name: string;
  blurb: string;
  note: string;
  thumb: React.ReactNode;
}[] = [
  {
    name: "Classic",
    blurb: "The layout hiring managers expect.",
    note: "A4 · ATS-friendly",
    thumb: <ClassicThumb />,
  },
  {
    name: "Modern",
    blurb: "Calm typography with one quiet accent.",
    note: "A4 · Selectable text",
    thumb: <ModernThumb />,
  },
  {
    name: "Compact",
    blurb: "Fits a growing career, stays readable.",
    note: "A4 · Best for long resumes",
    thumb: <CompactThumb />,
  },
  {
    name: "Professional",
    blurb: "Executive layout with high-contrast header.",
    note: "A4 · Executive layout",
    thumb: <ProfessionalThumb />,
  },
  {
    name: "Editorial",
    blurb: "Clean two-column layout with photo and skill box.",
    note: "A4 · Modern two-column",
    thumb: <EditorialThumb />,
  },
  {
    name: "Designer",
    blurb: "Two-column clean CV layout with photo banner and divider.",
    note: "A4 · Creative & engineering",
    thumb: <DesignerThumb />,
  },
];

const comments = [
  {
    name: "Fatima R.",
    handle: "@fatimar.builds",
    initials: "FR",
    text: "Filled in my experience after class, downloaded the PDF before dinner. No watermark to crop out — it went into the application as-is.",
    likes: 47,
    tilt: "-rotate-[0.6deg]",
  },
  {
    name: "Mara O.",
    handle: "@maraoakes",
    initials: "MO",
    text: "I asked the AI for a summary rewrite twice. The first suggestion missed. The second was my own story, but sharper — and I had to approve it. That is the part I trust.",
    likes: 89,
    tilt: "rotate-[0.6deg]",
  },
  {
    name: "Dallin S.",
    handle: "@devdallin",
    initials: "DS",
    text: "The AI provider was down for a day and my editing did not even notice. Everything still saved and exported. That is the whole point.",
    likes: 32,
    tilt: "-rotate-[0.4deg]",
  },
];

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#inside", label: "What you get" },
  { href: "/templates", label: "Templates" },
];

const FOOTER_EXPLORE = [
  { href: "/#how", label: "How it works" },
  { href: "/#inside", label: "Features" },
  { href: "/templates", label: "Templates Gallery" },
  { href: "/dashboard", label: "Your Resumes" },
  { href: "/#feedback", label: "Community Feedback" },
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-hairline bg-white/85 backdrop-blur">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center gap-8 px-6">
          <a href="#" className="shrink-0">
            <Wordmark />
          </a>
          <div className="hidden items-center gap-7 text-sm font-medium text-foreground/75 md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </a>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-5">
            <a href="/login" className="hidden text-sm font-semibold hover:text-graphite sm:block">
              Log in
            </a>
            <a
              href="/login"
              className="rounded-full bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-strong"
            >
              Start free
            </a>
          </div>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-14 sm:pt-20 lg:grid lg:grid-cols-[1fr_370px] lg:items-center lg:gap-14">
        <div className="rise-in max-w-xl" style={{ animationDelay: "0.05s" }}>
          <p className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-3 py-1 text-xs font-semibold text-graphite">
            <span aria-hidden className="ig-line size-1.5 rounded-full" />
            A resume builder that stays free
          </p>
          <h1 className="mt-5 font-display text-[44px] font-bold leading-[0.98] tracking-[-0.03em] sm:text-6xl">
            The <span className="text-ig">best-looking</span> resume you&rsquo;ll
            ever send.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-graphite">
            Write it in one evening with a structured editor, AI suggestions you
            accept or reject, and a watermark-free PDF download.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#start"
              className="rounded-full bg-action px-6 py-3 text-[15px] font-semibold text-white hover:bg-action-strong"
            >
              Start building free
            </a>
            <a
              href="#templates"
              className="rounded-full border border-hairline bg-white px-6 py-3 text-[15px] font-semibold hover:border-foreground/40"
            >
              See the templates
            </a>
          </div>
          <ul className="mt-8 flex items-center text-xs font-medium text-graphite">
            {["Free forever", "A4 PDF export", "No watermark"].map((item) => (
              <li key={item} className="after:mx-2.5 after:content-['·'] last:after:content-none">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <StoryCard />
      </section>

      <section id="how" className="scroll-mt-20 border-t border-hairline bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <Kicker>How it works</Kicker>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
                Blank page to PDF in one evening.
              </h2>
            </div>
            <p className="hidden max-w-xs pb-1 text-sm leading-relaxed text-graphite md:block">
              Fill the sections in order. Keep the suggestions you like. Download
              when you are proud of it.
            </p>
          </div>
          <ol className="mt-10 flex snap-x gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-5 sm:overflow-visible">
            {steps.map((step) => (
              <li key={step.title} className="snap-start shrink-0 sm:shrink">
                <div className="flex w-32 flex-col items-center gap-2.5 sm:w-full sm:items-center sm:text-center">
                  <span className="ig-ring rounded-full p-[3px] transition-transform hover:-translate-y-1">
                    <span className="grid size-16 place-items-center rounded-full bg-white">
                      <step.icon size={22} strokeWidth={1.8} />
                    </span>
                  </span>
                  <span className="text-sm font-semibold">{step.title}</span>
                  <span className="text-xs leading-snug text-graphite">
                    {step.caption}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="inside" className="scroll-mt-20 border-t border-hairline">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
          <Kicker>What you get</Kicker>
          <h2 className="mt-4 max-w-lg font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
            The whole builder, free for real.
          </h2>
          <div className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-hairline bg-white p-6 transition hover:border-foreground/25"
              >
                <span className="mb-4 grid size-10 place-items-center rounded-full bg-background">
                  <feature.icon size={18} strokeWidth={1.8} />
                </span>
                <h3 className="text-[15px] font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-graphite">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="scroll-mt-20 border-y border-hairline bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <Kicker>Templates</Kicker>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
                Curated templates, serious on paper.
              </h2>
            </div>
            <p className="hidden max-w-xs pb-1 text-sm leading-relaxed text-graphite md:block">
              Every template renders to clean A4 pages with selectable text. Scan
              on a phone, print on real paper.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {templates.map((template) => (
              <div
                key={template.name}
                className="group rounded-2xl border border-hairline bg-background p-5"
              >
                <div className="relative flex h-[210px] items-center justify-center">
                  <div className="h-full rounded-md">{template.thumb}</div>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 opacity-0 transition group-hover:opacity-100">
                    <Heart size={15} className="absolute right-4 top-4 text-heart fill-heart" />
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold shadow-sm">
                      Opens in the editor
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold">{template.name}</h3>
                  <MoreHorizontal size={16} className="ml-auto text-graphite" aria-hidden />
                </div>
                <p className="mt-1 text-sm text-graphite">{template.blurb}</p>
                <p className="mt-3 text-xs font-medium text-graphite">
                  {template.note}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <a
              href="/templates"
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-foreground/30 hover:shadow-sm"
            >
              Explore all 5 templates in detail
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      <section id="feedback" className="scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
          <Kicker>Feedback</Kicker>
          <h2 className="mt-4 max-w-lg font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
            Comments from the beta.
          </h2>
          <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3">
            {comments.map((comment) => (
              <article
                key={comment.handle}
                className={`flex gap-3 rounded-2xl border border-hairline bg-white p-4 sm:p-5 ${comment.tilt}`}
              >
                <span className="ig-ring grid size-10 shrink-0 place-items-center rounded-full p-[2px]">
                  <span className="grid size-full place-items-center rounded-full bg-white text-[11px] font-bold">
                    {comment.initials}
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {comment.name}
                    <span className="ml-1.5 text-xs font-medium text-graphite">
                      {comment.handle}
                    </span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/85">
                    {comment.text}
                  </p>
                </div>
                <p className="ml-auto hidden shrink-0 items-center gap-1 text-xs text-graphite sm:flex">
                  <Heart size={13} className="text-heart" />
                  {comment.likes}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="start" className="scroll-mt-20 px-6 pb-20 sm:pb-24">
        <div className="ig-panel relative mx-auto max-w-6xl overflow-hidden rounded-[28px] px-8 py-14 text-center text-white sm:px-16 sm:py-20">
          <span
            aria-hidden
            className="absolute -right-14 -top-16 hidden size-64 rounded-full border border-white/20 sm:block"
          />
          <span
            aria-hidden
            className="absolute -right-8 -top-10 hidden size-40 rounded-full border-[10px] border-white/15 sm:block"
          />
          <h2 className="font-display text-4xl font-bold leading-tight tracking-[-0.02em] sm:text-5xl">
            Your next job starts with one page.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/85">
            Sign up in a minute, fill what you know, keep the suggestions you
            like, and download the PDF the same night.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#"
              className="rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-foreground hover:bg-white/90"
            >
              Start your resume
            </a>
            <a
              href="#templates"
              className="rounded-full border border-white/50 px-6 py-3 text-[15px] font-semibold text-white hover:border-white"
            >
              Browse templates
            </a>
          </div>
          <p className="mt-6 text-xs font-medium text-white/70">
            Free forever · No credit card · No watermark
          </p>
        </div>
      </section>

      <footer className="mt-auto border-t border-hairline bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1fr_auto_auto]">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-4 text-sm leading-relaxed text-graphite">
              Free resume building for students and early-career professionals.
              Five templates, clean PDF export, and AI suggestions that always
              wait for your approval.
            </p>
            <p className="mt-4 text-xs text-graphite">
              ResumeAI is not affiliated with Instagram or Meta.
            </p>
          </div>
          <nav aria-label="Explore" className="justify-self-start md:justify-self-end">
            <h3 className="text-sm font-semibold">Explore</h3>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm text-graphite">
              {FOOTER_EXPLORE.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Legal" className="justify-self-start md:justify-self-end">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm text-graphite">
              <li>
                <a href="/privacy" className="hover:text-foreground">
                  Privacy Notice
                </a>
              </li>
              <li>
                <a href="/privacy#ai-practices" className="hover:text-foreground">
                  How AI is used
                </a>
              </li>
              <li>
                <a href="/privacy#data-retention" className="hover:text-foreground">
                  Data Retention & Security
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-hairline">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 text-xs text-graphite">
            <span>© 2026 ResumeAI</span>
            <span>Built to stay free.</span>
          </div>
        </div>
      </footer>
    </>
  );
}

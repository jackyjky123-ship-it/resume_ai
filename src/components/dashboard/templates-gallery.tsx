"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/lib/i18n/context";
import { TEMPLATES, type TemplateId } from "@/lib/resume-meta";
import { createResumeAction } from "@/server/actions/resume.actions";
import { TemplateSheet } from "./template-sheet";

type TemplatesGalleryProps = {
  user: {
    name: string | null;
    email: string;
  };
};

type FilterCategory = "all" | "recommended" | "single" | "two-column";

export function TemplatesGallery({ user }: TemplatesGalleryProps) {
  const router = useRouter();
  const { t, isKhmer } = useLanguage();
  const [category, setCategory] = useState<FilterCategory>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null);
  const [resumeTitle, setResumeTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((template) => {
      if (category === "recommended") return template.isRecommended;
      if (category === "single") return template.category === "single";
      if (category === "two-column") return template.category === "two-column";
      return true;
    });
  }, [category]);

  const handleOpenCreate = (id: TemplateId) => {
    setSelectedTemplate(id);
    const tmpl = TEMPLATES.find((t) => t.id === id);
    setResumeTitle(isKhmer ? `ប្រវត្តិរូប ${tmpl?.name ?? "ថ្មី"}` : `My ${tmpl?.name ?? "Resume"}`);
    setCreateError(null);
  };

  const handleConfirmCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    const trimmed = resumeTitle.trim() || (isKhmer ? "ប្រវត្តិរូបគ្មានចំណងជើង" : "Untitled resume");

    setIsCreating(true);
    setCreateError(null);
    try {
      const result = await createResumeAction({
        title: trimmed,
        templateId: selectedTemplate,
      });

      if (!result.ok) {
        setCreateError(result.error);
        setIsCreating(false);
        return;
      }

      toast.success(
        isKhmer
          ? `បានបង្កើត “${result.data.title}”។ កំពុងប្តូរទៅកាន់ផ្ទាំងកែសម្រួល...`
          : `Created “${result.data.title}”. Redirecting to editor...`
      );
      setSelectedTemplate(null);
      router.push(`/resumes/${result.data.id}/edit`);
    } catch {
      setCreateError(
        isKhmer
          ? "មិនអាចបង្កើតប្រវត្តិរូបបានទេ។ សូមព្យាយាមម្តងទៀត។"
          : "Failed to initialize resume. Please try again."
      );
      setIsCreating(false);
    }
  };

  const userName = user.name?.trim() || (isKhmer ? "អ្នក" : "you");

  return (
    <div className="flex-1 flex flex-col p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-hairline pb-6">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {t.templatesGallery.title}
          </h1>
          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 dark:border dark:border-emerald-800/60">
            {t.templatesGallery.badgeDesigns}
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          {t.templatesGallery.desc.replace("{name}", userName)}
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              category === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-hairline bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            {t.templatesGallery.allFilter.replace("{count}", String(TEMPLATES.length))}
          </button>
          <button
            type="button"
            onClick={() => setCategory("recommended")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              category === "recommended"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-hairline bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <Star className="size-3.5 text-amber-500 fill-amber-500" />
            {t.templatesGallery.recommendedFilter}
          </button>
          <button
            type="button"
            onClick={() => setCategory("single")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              category === "single"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-hairline bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            {t.templatesGallery.singleFilter}
          </button>
          <button
            type="button"
            onClick={() => setCategory("two-column")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              category === "two-column"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-hairline bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            {t.templatesGallery.twoColumnFilter}
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => {
          return (
            <div
              key={template.id}
              className={`group relative flex flex-col rounded-2xl border bg-card p-5 transition-all duration-200 hover:shadow-md ${
                template.isRecommended
                  ? "border-primary/40 ring-1 ring-primary/20"
                  : "border-hairline hover:border-primary/40"
              }`}
            >
              {/* Recommended Badge */}
              {template.isRecommended && (
                <div className="absolute right-4 top-4 z-10">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase text-primary-foreground shadow-xs">
                    <Sparkles className="size-3" />
                    {t.templatesGallery.recommendedBadge}
                  </span>
                </div>
              )}

              {/* Preview Sheet Container */}
              <div className="relative mb-4 h-56 w-full overflow-hidden rounded-xl bg-stone-100/70 dark:bg-muted/30 p-3 border border-hairline/80 flex items-center justify-center group-hover:bg-[#F0EDE5]/40 dark:group-hover:bg-muted/50 transition-colors">
                <div className="w-full max-w-[210px] h-full overflow-hidden rounded-lg bg-card text-card-foreground shadow-xs ring-1 ring-border/50 transform transition-transform group-hover:scale-[1.02] duration-200">
                  <TemplateSheet templateId={template.id} />
                </div>
              </div>

              {/* Template Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {template.name}
                  </h3>
                  <span className="text-xs font-mono font-medium text-muted-foreground">
                    ({template.originalName})
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {template.blurb}
                </p>

                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-primary uppercase tracking-wider font-mono">
                    {t.templatesGallery.bestFor}
                  </p>
                  <p className="text-xs text-foreground/80 mt-0.5 font-medium">
                    {template.bestFor}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-4 border-t border-hairline flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono font-medium">
                  {template.category === "two-column"
                    ? t.templatesGallery.twoColumn
                    : t.templatesGallery.standard}
                </span>

                <Button
                  type="button"
                  size="sm"
                  aria-label={`${t.templatesGallery.useTemplate} ${template.name}`}
                  onClick={() => handleOpenCreate(template.id)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer gap-1.5 h-8.5 rounded-lg active:scale-95 transition-all"
                >
                  <span>{t.templatesGallery.useTemplate}</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Creation Modal */}
      <Dialog
        open={Boolean(selectedTemplate)}
        onOpenChange={(open) => {
          if (!open && !isCreating) setSelectedTemplate(null);
        }}
      >
        <DialogContent className="sm:max-w-md bg-card border border-border/80 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-foreground">
              {t.templatesGallery.createModalTitle.replace(
                "{name}",
                selectedTemplate
                  ? TEMPLATES.find((t) => t.id === selectedTemplate)?.name ?? "Template"
                  : "Template"
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t.templatesGallery.createModalDesc}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="create-title-input" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t.templatesGallery.resumeTitleLabel}
              </label>
              <Input
                id="create-title-input"
                type="text"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                required
                maxLength={80}
                autoFocus
                placeholder={t.templatesGallery.resumeTitlePlaceholder}
                className="bg-background font-medium text-sm"
              />
            </div>

            {createError && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-800">
                {createError}
              </p>
            )}

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isCreating}
                onClick={() => setSelectedTemplate(null)}
                className="cursor-pointer"
              >
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreating}
                className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                {isCreating ? <Spinner className="size-3.5 mr-1.5" /> : null}
                {t.templatesGallery.launchEditor}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

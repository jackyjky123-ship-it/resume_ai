"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  Check,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  GENERATE_SECTIONS,
  generateCvInputSchema,
  type AiMode,
  type GenerateSection,
  type GenerationResult,
} from "@/lib/validations/ai";
import {
  createResumeId,
  type ResumeDocument,
  type ResumeEditorFormValues,
} from "@/lib/validations/resume";
import { useApiKey } from "@/lib/api-key-context";
import { useLanguage } from "@/lib/i18n/context";
import { generateCvSuggestionsAction } from "@/server/actions/cv.actions";

type GenerateCvDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiMode?: AiMode;
};

const getSectionCopy = (isKhmer: boolean): Record<
  GenerateSection,
  { label: string; description: string }
> => ({
  summary: {
    label: isKhmer ? "សេចក្តីសង្ខេបវិជ្ជាជីវៈ" : "Professional summary",
    description: isKhmer
      ? "កែសម្រួលផ្អែកលើតួនាទី និងចំណុចខ្លាំងបច្ចុប្បន្នរបស់អ្នក។"
      : "A grounded rewrite using your current role and strengths.",
  },
  skills: {
    label: isKhmer ? "ជំនាញ" : "Skills",
    description: isKhmer
      ? "ជំនាញដែលបានលើកឡើងនៅក្នុងប្រវត្តិរូបរបស់អ្នក។"
      : "Only skills mentioned elsewhere in your resume.",
  },
  projectHighlights: {
    label: isKhmer ? "គំនួសពណ៌គម្រោង" : "Project highlights",
    description: isKhmer
      ? "បំលែងការពិពណ៌នាគម្រោងទៅជាចំណុចខ្លីៗ និងច្បាស់លាស់។"
      : "Turn existing project descriptions into concise bullets.",
  },
  languages: {
    label: isKhmer ? "ភាសា" : "Languages",
    description: isKhmer
      ? "រៀបចំទម្រង់ភាសាដែលមានស្រាប់ ដោយគ្មានការប្រឌិតកម្រិតជំនាញឡើយ។"
      : "Format entries you already have. Fluency is never invented.",
  },
});

function availableSections(document: ResumeDocument): GenerateSection[] {
  return GENERATE_SECTIONS.filter((section) => {
    if (section === "projectHighlights") return document.projects.length > 0;
    if (section === "languages") return document.languages.length > 0;
    return true;
  });
}

function countLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function GenerateCvDialog({
  open,
  onOpenChange,
  aiMode: propAiMode,
}: GenerateCvDialogProps) {
  const { apiKey, aiMode: contextAiMode } = useApiKey();
  const { t, isKhmer } = useLanguage();
  const effectiveMode = propAiMode ?? contextAiMode;
  const sectionCopy = getSectionCopy(isKhmer);

  const form = useFormContext<ResumeEditorFormValues>();
  const watched = useWatch({ control: form.control, name: "content" });
  const document = watched ?? form.getValues("content");

  const [phase, setPhase] = useState<"setup" | "results">("setup");
  const [targetRole, setTargetRole] = useState("");
  const [selected, setSelected] = useState<GenerateSection[]>(() =>
    availableSections(form.getValues("content"))
  );
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [mode, setMode] = useState<AiMode>(effectiveMode);
  const [appliedSummary, setAppliedSummary] = useState(false);
  const [appliedSkills, setAppliedSkills] = useState(false);
  const [appliedProjects, setAppliedProjects] = useState<Set<string>>(
    () => new Set()
  );
  const [appliedLanguages, setAppliedLanguages] = useState<Set<string>>(
    () => new Set()
  );
  const [skipped, setSkipped] = useState<Set<string>>(() => new Set());

  const availability = {
    summary: true,
    skills: true,
    projectHighlights: document.projects.length > 0,
    languages: document.languages.length > 0,
  } satisfies Record<GenerateSection, boolean>;

  function toggleSection(section: GenerateSection, checked: boolean) {
    setSelected((current) => {
      if (checked) {
        return current.includes(section) ? current : [...current, section];
      }
      return current.filter((value) => value !== section);
    });
  }

  async function generate() {
    if (generating) return;
    const input = {
      apiKey: apiKey ?? undefined,
      targetRole: targetRole.trim(),
      sections: selected,
      document: form.getValues("content"),
    };
    const parsed = generateCvInputSchema.safeParse(input);
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Check the role and sections."
      );
      return;
    }

    setGenerating(true);
    setError(null);
    try {
      const response = await generateCvSuggestionsAction(parsed.data);
      if (!response.ok) {
        setError(response.error);
        return;
      }
      setResult(response.data.result);
      setMode(response.data.mode);
      setPhase("results");
      setAppliedSummary(false);
      setAppliedSkills(false);
      setAppliedProjects(new Set());
      setAppliedLanguages(new Set());
      setSkipped(new Set());
    } catch {
      setError(
        "We couldn't reach the suggestion service. Check your connection and try again."
      );
    } finally {
      setGenerating(false);
    }
  }

  function applySummary() {
    if (!result?.summary) return;
    form.setValue("content.summary", result.summary.suggested, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setAppliedSummary(true);
    setSkipped((current) => {
      const next = new Set(current);
      next.delete("summary");
      return next;
    });
    toast.success("Summary updated. Autosave will save it.");
  }

  function applySkills() {
    if (!result || result.skills.length === 0) return;
    const current = form.getValues("content.skills");
    const existing = new Set(
      current.map((skill) => skill.name.trim().toLowerCase())
    );
    const additions = result.skills
      .filter((skill) => !existing.has(skill.name.trim().toLowerCase()))
      .map((skill) => ({ id: createResumeId(), name: skill.name.trim() }));
    if (additions.length === 0) {
      setAppliedSkills(true);
      toast.info("Those skills are already in your resume.");
      return;
    }
    form.setValue("content.skills", [...current, ...additions].slice(0, 50), {
      shouldDirty: true,
      shouldValidate: true,
    });
    setAppliedSkills(true);
    setSkipped((currentSet) => {
      const next = new Set(currentSet);
      next.delete("skills");
      return next;
    });
    toast.success(
      `${countLabel(additions.length, "skill")} added. Autosave will save them.`
    );
  }

  function applyProject(projectId: string, bullets: string[]) {
    const current = form.getValues("content.projects");
    form.setValue(
      "content.projects",
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              bullets: bullets.map((text) => ({
                id: createResumeId(),
                text,
              })),
            }
          : project
      ),
      { shouldDirty: true, shouldValidate: true }
    );
    setAppliedProjects((applied) => new Set(applied).add(projectId));
    setSkipped((currentSet) => {
      const next = new Set(currentSet);
      next.delete(`project:${projectId}`);
      return next;
    });
    toast.success("Project highlights updated. Autosave will save them.");
  }

  function applyLanguage(
    languageId: string,
    name: string,
    proficiency: string
  ) {
    const current = form.getValues("content.languages");
    form.setValue(
      "content.languages",
      current.map((language) =>
        language.id === languageId
          ? { ...language, name, proficiency }
          : language
      ),
      { shouldDirty: true, shouldValidate: true }
    );
    setAppliedLanguages((applied) => new Set(applied).add(languageId));
    setSkipped((currentSet) => {
      const next = new Set(currentSet);
      next.delete(`language:${languageId}`);
      return next;
    });
    toast.success("Language entry updated. Autosave will save it.");
  }

  function skip(key: string) {
    setSkipped((current) => new Set(current).add(key));
  }

  function isSkipped(key: string) {
    return skipped.has(key);
  }

  function backToSetup() {
    setPhase("setup");
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {t.aiDialogs.generateCvTitle}
            <Badge variant="secondary">{mode === "mock" ? "Demo AI" : "Gemini"}</Badge>
          </DialogTitle>
          <DialogDescription>
            {phase === "setup"
              ? t.aiDialogs.generateCvDescSetup
              : t.aiDialogs.generateCvDescResults}
          </DialogDescription>
        </DialogHeader>

        {phase === "setup" ? (
          <>
            {mode === "mock" && (
              <Alert>
                <AlertTitle>{isKhmer ? "ទម្រង់សាកល្បង" : "Demo mode"}</AlertTitle>
                <AlertDescription>
                  {isKhmer
                    ? "មិនទាន់បានកំណត់ Gemini API key ទេ។ គំនិតយោបល់ត្រូវបានបង្កើតក្នុងស្រុកតាមទម្រង់សាកល្បង។ សូមបន្ថែម Google AI Studio key ឥតគិតថ្លៃរបស់អ្នកតាមរយៈប៊ូតុង “API Key” ដើម្បីប្រើ Gemini។"
                    : "No Gemini API key configured. Suggestions are generated locally using mock heuristics. Add your free Google AI Studio key via the “API Key” button in the editor toolbar to use Gemini."}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTitle>{isKhmer ? "មិនអាចបង្កើតគំនិតយោបល់បានទេ" : "Couldn't generate suggestions"}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="target-role">{t.aiDialogs.targetRole}</Label>
              <Input
                id="target-role"
                value={targetRole}
                maxLength={100}
                onChange={(event) => {
                  setTargetRole(event.target.value);
                  if (error) setError(null);
                }}
                placeholder={t.aiDialogs.targetRolePlaceholder}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                {t.aiDialogs.targetRoleHelp}
              </p>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-medium">{t.aiDialogs.sections}</legend>
              {GENERATE_SECTIONS.map((section) => {
                const available = availability[section];
                const copy = sectionCopy[section];
                return (
                  <label
                    key={section}
                    className="flex items-start gap-3 rounded-lg border border-border p-3 has-disabled:opacity-60"
                  >
                    <Checkbox
                      checked={selected.includes(section)}
                      disabled={!available}
                      onCheckedChange={(checked) =>
                        toggleSection(section, checked === true)
                      }
                      className="mt-0.5"
                      aria-label={copy.label}
                    />
                    <span className="flex flex-col gap-1">
                      <span className="text-sm font-medium">{copy.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {available
                          ? copy.description
                          : section === "projectHighlights"
                            ? isKhmer
                              ? "សូមបន្ថែមគម្រោងជាមុនសិន ដើម្បីបង្កើតគំនួសពណ៌។"
                              : "Add a project first to generate highlights."
                            : isKhmer
                              ? "សូមបន្ថែមភាសាជាមុនសិន។"
                              : "Add a language first; fluency is never invented."}
                      </span>
                    </span>
                  </label>
                );
              })}
            </fieldset>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={generating}
              >
                {t.common.cancel}
              </Button>
              <Button
                type="button"
                onClick={() => void generate()}
                disabled={generating || selected.length === 0}
              >
                {generating ? (
                  <>
                    <Spinner />
                    {t.aiDialogs.generatingBtn}
                  </>
                ) : (
                  <>
                    <Sparkles />
                    {t.aiDialogs.generateBtn}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : result ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">
                  {t.aiDialogs.suggestionsFor.replace("{role}", targetRole.trim())}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.aiDialogs.groundedInFacts}
                </p>
              </div>
              <Badge variant="outline">{t.aiDialogs.notSavedUntilAccepted}</Badge>
            </div>

            {mode === "mock" && (
              <Alert>
                <AlertTitle>Demo suggestions</AlertTitle>
                <AlertDescription>
                  These are local, deterministic suggestions derived from your
                  current content. They are not Gemini output.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result.summary && (
              <SuggestionCard
                title="Professional summary"
                applied={appliedSummary}
                skipped={isSkipped("summary")}
                onApply={applySummary}
                onSkip={() => skip("summary")}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Current
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {result.summary.original || "No summary yet."}
                    </p>
                  </div>
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-primary">
                      Suggested
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {result.summary.suggested}
                    </p>
                  </div>
                </div>
              </SuggestionCard>
            )}

            {selected.includes("skills") && (
              <SuggestionCard
                title="Skills"
                applied={appliedSkills}
                skipped={isSkipped("skills")}
                onApply={applySkills}
                onSkip={() => skip("skills")}
                applyLabel={
                  result.skills.length === 0
                    ? "Nothing to add"
                    : `Add ${countLabel(result.skills.length, "skill")}`
                }
                applyDisabled={result.skills.length === 0}
              >
                {result.skills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No grounded skill suggestions were found. Add skills you have
                    used, then generate again.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {result.skills.map((skill) => (
                      <div
                        key={skill.name}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <Badge variant="secondary">{skill.name}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {skill.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </SuggestionCard>
            )}

            {selected.includes("projectHighlights") && (
              <SuggestionCard title="Project highlights">
                {result.projectHighlights.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No project highlights were generated. Add a description or
                    bullet to a project first.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {result.projectHighlights.map((project) => (
                      <div
                        key={project.projectId}
                        className="rounded-lg border border-border p-3"
                      >
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium">
                            {project.projectName}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              onClick={() => skip(`project:${project.projectId}`)}
                              disabled={
                                appliedProjects.has(project.projectId) ||
                                isSkipped(`project:${project.projectId}`)
                              }
                            >
                              Keep current
                            </Button>
                            <Button
                              type="button"
                              size="xs"
                              onClick={() =>
                                applyProject(
                                  project.projectId,
                                  project.suggestedBullets
                                )
                              }
                              disabled={
                                appliedProjects.has(project.projectId) ||
                                isSkipped(`project:${project.projectId}`)
                              }
                            >
                              {appliedProjects.has(project.projectId) ? (
                                <>
                                  <Check /> Applied
                                </>
                              ) : isSkipped(
                                  `project:${project.projectId}`
                                ) ? (
                                "Kept current"
                              ) : (
                                "Use these highlights"
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Current
                            </p>
                            {project.originalBullets.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No highlights yet.
                              </p>
                            ) : (
                              <ul className="list-disc space-y-1 pl-4 text-sm">
                                {project.originalBullets.map((bullet, bIdx) => (
                                  <li key={`orig-${project.projectId}-${bIdx}`}>{bullet}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-primary">
                              Suggested
                            </p>
                            <ul className="list-disc space-y-1 pl-4 text-sm">
                              {project.suggestedBullets.map((bullet, bIdx) => (
                                <li key={`sugg-${project.projectId}-${bIdx}`}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SuggestionCard>
            )}

            {selected.includes("languages") && (
              <SuggestionCard title="Languages">
                {result.languages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No language formatting changes were needed. Suggestions never
                    add a language or fluency level.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {result.languages.map((language) => (
                      <div
                        key={language.languageId}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
                      >
                        <p className="text-sm">
                          <span className="text-muted-foreground line-through">
                            {[language.originalName, language.originalProficiency]
                              .filter(Boolean)
                              .join(" · ") || "Empty"}
                          </span>{" "}
                          <span className="font-medium">
                            {[
                              language.suggestedName,
                              language.suggestedProficiency,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            onClick={() => skip(`language:${language.languageId}`)}
                            disabled={
                              appliedLanguages.has(language.languageId) ||
                              isSkipped(`language:${language.languageId}`)
                            }
                          >
                            Keep current
                          </Button>
                          <Button
                            type="button"
                            size="xs"
                            onClick={() =>
                              applyLanguage(
                                language.languageId,
                                language.suggestedName,
                                language.suggestedProficiency
                              )
                            }
                            disabled={
                              appliedLanguages.has(language.languageId) ||
                              isSkipped(`language:${language.languageId}`)
                            }
                          >
                            {appliedLanguages.has(language.languageId)
                              ? "Applied"
                              : "Use this"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SuggestionCard>
            )}

            {result.notes.length > 0 && (
              <Alert>
                <AlertTitle>Hints</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc space-y-1 pl-4">
                    {result.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={backToSetup}>
                <RotateCcw />
                Change settings
              </Button>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function SuggestionCard({
  title,
  applied = false,
  skipped = false,
  onApply,
  onSkip,
  applyLabel,
  applyDisabled = false,
  children,
}: {
  title: string;
  applied?: boolean;
  skipped?: boolean;
  onApply?: () => void;
  onSkip?: () => void;
  applyLabel?: string;
  applyDisabled?: boolean;
  children: React.ReactNode;
}) {
  const { isKhmer } = useLanguage();
  const defaultApplyLabel = isKhmer ? "ប្រើប្រាស់គំនិតនេះ" : "Use this suggestion";
  const effectiveApplyLabel = applyLabel ?? defaultApplyLabel;

  return (
    <section className="rounded-xl border border-border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {applied ? (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 /> {isKhmer ? "បានអនុវត្ត" : "Applied"}
          </Badge>
        ) : skipped ? (
          <Badge variant="outline" className="gap-1">
            <X /> {isKhmer ? "រក្សាបច្ចុប្បន្ន" : "Kept current"}
          </Badge>
        ) : (
          (onApply || onSkip) && (
            <div className="flex gap-2">
              {onSkip && (
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={onSkip}
                >
                  {isKhmer ? "រក្សាបច្ចុប្បន្ន" : "Keep current"}
                </Button>
              )}
              {onApply && (
                <Button
                  type="button"
                  size="xs"
                  onClick={onApply}
                  disabled={applyDisabled}
                >
                  <Check />
                  {effectiveApplyLabel}
                </Button>
              )}
            </div>
          )
        )}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

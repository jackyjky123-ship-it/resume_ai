"use client";

import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Link2, Sparkles, Trash2, Upload, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { resizeImageToDataUrl } from "@/lib/image-utils";
import { useLanguage } from "@/lib/i18n/context";
import type { ResumeEditorFormValues } from "@/lib/validations/resume";
import { FixGrammarDialog } from "./fix-grammar-dialog";
import { SectionShell, TextAreaField, TextField } from "./form-fields";

function ProfilePhotoUploader() {
  const form = useFormContext<ResumeEditorFormValues>();
  const { isKhmer } = useLanguage();
  const photoUrl = form.watch("content.personal.photoUrl") ?? "";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const dataUrl = await resizeImageToDataUrl(file);
      const currentPersonal = form.getValues("content.personal");
      form.setValue(
        "content.personal",
        {
          ...currentPersonal,
          photoUrl: dataUrl,
        },
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }
      );
      toast.success(isKhmer ? "បានកែសម្រួលរូបថតរួចរាល់។" : "Profile photo updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (isKhmer ? "បរាជ័យក្នុងការផ្ទុករូបភាព។" : "Failed to load image."));
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = () => {
    const currentPersonal = form.getValues("content.personal");
    form.setValue(
      "content.personal",
      {
        ...currentPersonal,
        photoUrl: "",
      },
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      }
    );
    setShowUrlInput(false);
    toast.success(isKhmer ? "បានលុបរូបថតរួចរាល់។" : "Profile photo removed.");
  };

  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-border/80 bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
      <div className="flex items-center gap-3.5">
        <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/60 text-muted-foreground shadow-2xs">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt="Profile photo preview"
              className="size-full object-cover object-top"
            />
          ) : (
            <User className="size-8 text-muted-foreground/60" aria-hidden />
          )}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {isKhmer ? "រូបថតផ្ទាល់ខ្លួន" : "Profile photo"}
          </h4>
          <p className="text-xs text-muted-foreground">
            {isKhmer
              ? "បង្ហាញលើគំរូ Editorial, Designer, និង Professional។ ណែនាំរូបថតមុខត្រង់ច្បាស់។"
              : "Featured on Editorial, Designer, and Professional templates. Clean portrait headshot recommended."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isProcessing}
          onClick={() => fileInputRef.current?.click()}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <Upload className="size-3.5" />
          {isProcessing
            ? isKhmer ? "កំពុងដំណើរការ…" : "Optimizing…"
            : photoUrl
              ? isKhmer ? "ប្តូររូបថត" : "Change photo"
              : isKhmer ? "បញ្ចូលរូបថត" : "Upload photo"}
        </Button>

        {photoUrl ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleRemovePhoto}
          >
            <Trash2 className="size-3.5" />
            {isKhmer ? "លុប" : "Remove"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowUrlInput((prev) => !prev)}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Link2 className="size-3.5" />
            {isKhmer ? "តំណរូបភាព" : "Image link"}
          </Button>
        )}
      </div>

      {showUrlInput && !photoUrl && (
        <div className="mt-2 w-full">
          <TextField
            name="content.personal.photoUrl"
            label={isKhmer ? "តំណរូបភាព (URL)" : "Image link (URL)"}
            placeholder="https://example.com/photo.jpg"
            maxLength={2_000_000}
          />
        </div>
      )}
    </div>
  );
}

export function PersonalSection({ action }: { action?: React.ReactNode } = {}) {
  const { t, isKhmer } = useLanguage();

  return (
    <SectionShell
      id="section-personal"
      title={t.editor.sectionPersonal}
      description={t.editor.personalDesc}
      action={action}
    >
      <FieldGroup>
        <ProfilePhotoUploader />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="content.personal.fullName"
            label={t.editor.fullName}
            placeholder={isKhmer ? "សុខា ចាន់" : "Amara Chen"}
            autoComplete="name"
            maxLength={100}
          />
          <TextField
            name="content.personal.roleApplied"
            label={t.editor.roleApplied}
            placeholder={isKhmer ? "វិស្វករផ្នែកទន់ជាន់ខ្ពស់" : "e.g. Senior Software Engineer"}
            autoComplete="organization-title"
            maxLength={120}
          />
          <TextField
            name="content.personal.email"
            label={t.editor.email}
            placeholder={isKhmer ? "sokha@example.com" : "you@example.com"}
            autoComplete="email"
            inputMode="email"
            maxLength={200}
          />
          <TextField
            name="content.personal.phone"
            label={t.editor.phone}
            placeholder={isKhmer ? "+855 12 345 678" : "+1 555 010 7788"}
            autoComplete="tel"
            inputMode="tel"
            maxLength={40}
          />
          <TextField
            name="content.personal.location"
            label={t.editor.location}
            placeholder={isKhmer ? "ភ្នំពេញ, កម្ពុជា" : "Toronto, Canada"}
            autoComplete="address-level2"
            maxLength={120}
          />
          <TextField
            name="content.personal.website"
            label={t.editor.website}
            placeholder="you.dev"
            inputMode="url"
            maxLength={200}
          />
          <TextField
            name="content.personal.linkedin"
            label={t.editor.linkedin}
            placeholder="linkedin.com/in/you"
            inputMode="url"
            maxLength={200}
          />
          <TextField
            name="content.personal.github"
            label={t.editor.github}
            placeholder="github.com/you"
            inputMode="url"
            maxLength={200}
          />
          <TextField
            name="content.personal.telegram"
            label="Telegram"
            placeholder={isKhmer ? "@គណនី ឬ t.me/គណនី" : "@yourusername or t.me/yourusername"}
            maxLength={120}
          />
        </div>
      </FieldGroup>
    </SectionShell>
  );
}

export function SummarySection() {
  const form = useFormContext<ResumeEditorFormValues>();
  const { t } = useLanguage();
  const [grammarOpen, setGrammarOpen] = useState(false);
  const summary = form.watch("content.summary") ?? "";
  const hasContent = summary.trim().length >= 5;

  return (
    <SectionShell
      id="section-summary"
      title={t.editor.sectionSummary}
      description={t.editor.summaryDesc}
      action={
        hasContent ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setGrammarOpen(true)}
          >
            <Sparkles className="size-3.5" />
            {t.cvTools.fixGrammar}
          </Button>
        ) : null
      }
    >
      <TextAreaField
        name="content.summary"
        label={t.editor.sectionSummary}
        placeholder={t.editor.summaryPlaceholder}
        rows={5}
        maxLength={2_000}
      />
      {grammarOpen && (
        <FixGrammarDialog
          open
          onOpenChange={setGrammarOpen}
          text={summary}
          label={t.editor.sectionSummary}
          onApply={(corrected) => {
            form.setValue("content.summary", corrected, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />
      )}
    </SectionShell>
  );
}

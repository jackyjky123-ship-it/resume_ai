"use client";

import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Link2, Sparkles, Trash2, Upload, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { resizeImageToDataUrl } from "@/lib/image-utils";
import type { ResumeEditorFormValues } from "@/lib/validations/resume";
import { FixGrammarDialog } from "./fix-grammar-dialog";
import { SectionShell, TextAreaField, TextField } from "./form-fields";

function ProfilePhotoUploader() {
  const form = useFormContext<ResumeEditorFormValues>();
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
      toast.success("Profile photo updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load image.");
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
    toast.success("Profile photo removed.");
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/60 text-muted-foreground shadow-sm">
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
          <h4 className="text-sm font-medium text-foreground">Profile photo</h4>
          <p className="text-xs text-muted-foreground">
            Featured on the Professional template. Clean square headshot recommended.
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
        >
          <Upload className="size-3.5" />
          {isProcessing ? "Optimizing…" : photoUrl ? "Change photo" : "Upload photo"}
        </Button>

        {photoUrl ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleRemovePhoto}
          >
            <Trash2 className="size-3.5" />
            Remove
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowUrlInput((prev) => !prev)}
          >
            <Link2 className="size-3.5" />
            Image link
          </Button>
        )}
      </div>

      {showUrlInput && !photoUrl && (
        <div className="mt-2 w-full">
          <TextField
            name="content.personal.photoUrl"
            label="Image link (URL)"
            placeholder="https://example.com/photo.jpg"
            maxLength={2_000_000}
          />
        </div>
      )}
    </div>
  );
}

export function PersonalSection({ action }: { action?: React.ReactNode }) {
  return (
    <SectionShell
      id="section-personal"
      title="Personal information"
      description="How employers reach you. Only what you fill in appears in the preview."
      action={action}
    >
      <FieldGroup>
        <ProfilePhotoUploader />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="content.personal.fullName"
            label="Full name"
            placeholder="Amara Chen"
            autoComplete="name"
            maxLength={100}
          />
          <TextField
            name="content.personal.roleApplied"
            label="Role applied for"
            placeholder="e.g. Senior Software Engineer"
            autoComplete="organization-title"
            maxLength={120}
          />
          <TextField
            name="content.personal.email"
            label="Email"
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            maxLength={200}
          />
          <TextField
            name="content.personal.phone"
            label="Phone"
            placeholder="+1 555 010 7788"
            autoComplete="tel"
            inputMode="tel"
            maxLength={40}
          />
          <TextField
            name="content.personal.location"
            label="Location"
            placeholder="Toronto, Canada"
            autoComplete="address-level2"
            maxLength={120}
          />
          <TextField
            name="content.personal.website"
            label="Website"
            placeholder="you.dev"
            inputMode="url"
            maxLength={200}
          />
          <TextField
            name="content.personal.linkedin"
            label="LinkedIn"
            placeholder="linkedin.com/in/you"
            inputMode="url"
            maxLength={200}
          />
          <TextField
            name="content.personal.github"
            label="GitHub"
            placeholder="github.com/you"
            inputMode="url"
            maxLength={200}
          />
          <TextField
            name="content.personal.telegram"
            label="Telegram"
            placeholder="@yourusername or t.me/yourusername"
            maxLength={120}
          />
        </div>
      </FieldGroup>
    </SectionShell>
  );
}

export function SummarySection() {
  const form = useFormContext<ResumeEditorFormValues>();
  const [grammarOpen, setGrammarOpen] = useState(false);
  const summary = form.watch("content.summary") ?? "";
  const hasContent = summary.trim().length >= 5;

  return (
    <SectionShell
      id="section-summary"
      title="Professional summary"
      description="Two or three sentences about what you do and the impact you make."
      action={
        hasContent ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setGrammarOpen(true)}
          >
            <Sparkles className="size-3.5" />
            Proofread
          </Button>
        ) : null
      }
    >
      <TextAreaField
        name="content.summary"
        label="Summary"
        placeholder="Frontend-leaning developer who ships accessible interfaces and measurable performance wins…"
        rows={5}
        maxLength={2_000}
      />
      {grammarOpen && (
        <FixGrammarDialog
          open
          onOpenChange={setGrammarOpen}
          text={summary}
          label="Professional summary"
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

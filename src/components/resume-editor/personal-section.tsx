"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import type { ResumeEditorFormValues } from "@/lib/validations/resume";
import { FixGrammarDialog } from "./fix-grammar-dialog";
import { SectionShell, TextAreaField, TextField } from "./form-fields";

export function PersonalSection({ action }: { action?: React.ReactNode }) {
  return (
    <SectionShell
      id="section-personal"
      title="Personal information"
      description="How employers reach you. Only what you fill in appears in the preview."
      action={action}
    >
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="content.personal.fullName"
            label="Full name"
            placeholder="Amara Chen"
            autoComplete="name"
            maxLength={100}
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

"use client";

import { FieldGroup } from "@/components/ui/field";
import { SectionShell, TextAreaField, TextField } from "./form-fields";

export function PersonalSection() {
  return (
    <SectionShell
      id="section-personal"
      title="Personal information"
      description="How employers reach you. Only what you fill in appears in the preview."
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
  return (
    <SectionShell
      id="section-summary"
      title="Professional summary"
      description="Two or three sentences about what you do and the impact you make."
    >
      <TextAreaField
        name="content.summary"
        label="Summary"
        placeholder="Frontend-leaning developer who ships accessible interfaces and measurable performance wins…"
        rows={5}
        maxLength={2_000}
      />
    </SectionShell>
  );
}

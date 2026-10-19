"use client";

import { useId } from "react";
import { Controller, useFormContext, type FieldPath } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  newBullet,
  type ResumeBullet,
  type ResumeEditorFormValues,
} from "@/lib/validations/resume";

type BulletLinesFieldProps = {
  name: FieldPath<ResumeEditorFormValues>;
  label: string;
  description?: string;
  placeholder?: string;
  rows?: number;
};

/**
 * Bullets stay structured ({ id, text }) but edit like a plain list:
 * one bullet per line. Existing ids are preserved so future AI suggestions
 * can target a single bullet without index drift.
 */
export function BulletLinesField({
  name,
  label,
  description = "One bullet per line. Keep each line short and metric-driven.",
  placeholder,
  rows = 5,
}: BulletLinesFieldProps) {
  const form = useFormContext<ResumeEditorFormValues>();
  const id = useId();
  const { error } = form.getFieldState(name, form.formState);

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => {
          const bullets = (Array.isArray(field.value) ? field.value : []) as ResumeBullet[];
          const value = bullets.map((bullet) => bullet.text).join("\n");

          return (
            <Textarea
              id={id}
              rows={rows}
              value={value}
              placeholder={placeholder}
              aria-invalid={Boolean(error)}
              onBlur={field.onBlur}
              onChange={(event) => {
                const lines = event.target.value.split("\n");
                field.onChange(
                  lines.map((line, index) => ({
                    id: bullets[index]?.id ?? newBullet().id,
                    text: line,
                  }))
                );
              }}
            />
          );
        }}
      />
      <FieldDescription>{description}</FieldDescription>
      <FieldError errors={[error]} />
    </Field>
  );
}

"use client";

import { useId, useState } from "react";
import { Controller, useFormContext, type FieldPath } from "react-hook-form";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useApiKey } from "@/lib/api-key-context";
import { useLanguage } from "@/lib/i18n/context";
import {
  newBullet,
  type ResumeBullet,
  type ResumeEditorFormValues,
} from "@/lib/validations/resume";
import { ImproveBulletDialog } from "./improve-bullet-dialog";

type BulletLinesFieldProps = {
  name: FieldPath<ResumeEditorFormValues>;
  label: string;
  description?: string;
  placeholder?: string;
  rows?: number;
  role?: string;
  company?: string;
};

/**
 * Bullets stay structured ({ id, text }) but edit like a plain list:
 * one bullet per line. Existing ids are preserved so future AI suggestions
 * can target a single bullet without index drift.
 */
export function BulletLinesField({
  name,
  label,
  description,
  placeholder,
  rows = 5,
  role = "",
  company = "",
}: BulletLinesFieldProps) {
  const form = useFormContext<ResumeEditorFormValues>();
  const { hasKey, promptApiKey } = useApiKey();
  const { t, isKhmer } = useLanguage();
  const id = useId();
  const [improveOpen, setImproveOpen] = useState(false);
  const { error } = form.getFieldState(name, form.formState);

  const defaultDesc = isKhmer
    ? "ចំណុចមួយក្នុងមួយជួរ។ សរសេរឱ្យខ្លី និងបង្ហាញលទ្ធផលជាក់ស្តែង។"
    : "One bullet per line. Keep each line short and metric-driven.";
  const effectiveDesc = description ?? defaultDesc;

  const rawBullets = form.watch(name);
  const bullets = (Array.isArray(rawBullets) ? rawBullets : []) as ResumeBullet[];
  const hasContent = bullets.some((b) => b.text && b.text.trim().length >= 3);

  return (
    <Field data-invalid={Boolean(error)}>
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {hasContent && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              if (!hasKey) {
                promptApiKey?.(isKhmer ? "ការកែលម្អចំណុចការងារ" : "Bullet improvement");
                return;
              }
              setImproveOpen(true);
            }}
            className="h-6 gap-1 px-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Sparkles className="size-3" />
            {t.aiDialogs.polishBtn}
          </Button>
        )}
      </div>
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => {
          const fieldBullets = (Array.isArray(field.value) ? field.value : []) as ResumeBullet[];
          const value = fieldBullets.map((bullet) => bullet.text).join("\n");

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
                    id: fieldBullets[index]?.id ?? newBullet().id,
                    text: line,
                  }))
                );
              }}
            />
          );
        }}
      />
      <FieldDescription>{effectiveDesc}</FieldDescription>
      <FieldError errors={[error]} />

      {improveOpen && (
        <ImproveBulletDialog
          open
          onOpenChange={setImproveOpen}
          bullets={bullets}
          role={role}
          company={company}
          onApply={(bulletId, improvedText) => {
            const next = bullets.map((b) =>
              b.id === bulletId ? { ...b, text: improvedText } : b
            );
            form.setValue(name, next, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />
      )}
    </Field>
  );
}

"use client";

import { useId } from "react";
import { useFormContext, type FieldPath } from "react-hook-form";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeEditorFormValues } from "@/lib/validations/resume";

type FieldName = FieldPath<ResumeEditorFormValues>;

type TextFieldProps = {
  name: FieldName;
  label: string;
  placeholder?: string;
  description?: string;
  autoComplete?: string;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

export function TextField({
  name,
  label,
  placeholder,
  description,
  autoComplete,
  maxLength,
  inputMode,
}: TextFieldProps) {
  const form = useFormContext<ResumeEditorFormValues>();
  const id = useId();
  const { error } = form.getFieldState(name, form.formState);

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        {...form.register(name)}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[error]} />
    </Field>
  );
}

type TextAreaFieldProps = {
  name: FieldName;
  label: string;
  placeholder?: string;
  description?: string;
  rows?: number;
  maxLength?: number;
};

export function TextAreaField({
  name,
  label,
  placeholder,
  description,
  rows = 5,
  maxLength,
}: TextAreaFieldProps) {
  const form = useFormContext<ResumeEditorFormValues>();
  const id = useId();
  const { error } = form.getFieldState(name, form.formState);

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        {...form.register(name)}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[error]} />
    </Field>
  );
}

type SectionShellProps = {
  id: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function SectionShell({ id, title, description, action, children }: SectionShellProps) {
  return (
    <Card id={id} className="scroll-mt-28">
      <CardHeader className="border-b border-border/70">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="font-display text-lg font-bold">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

type EntryControlsProps = {
  index: number;
  total: number;
  label: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

export function EntryControls({
  index,
  total,
  label,
  onMoveUp,
  onMoveDown,
  onRemove,
}: EntryControlsProps) {
  return (
    <div className="flex items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="Move up"
        aria-label={`Move ${label} up`}
        disabled={index === 0}
        onClick={onMoveUp}
      >
        <ChevronUp />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="Move down"
        aria-label={`Move ${label} down`}
        disabled={index === total - 1}
        onClick={onMoveDown}
      >
        <ChevronDown />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="Remove"
        aria-label={`Remove ${label}`}
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 />
      </Button>
    </div>
  );
}

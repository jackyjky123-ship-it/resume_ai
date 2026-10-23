"use client";

import { useRef, useState } from "react";
import { Check } from "lucide-react";
import type { DashboardResume, TemplateId } from "@/lib/resume-meta";
import { TEMPLATES } from "@/lib/resume-meta";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { TemplateSheet } from "./template-sheet";

/* ---------------------------------- Create --------------------------------- */

type NewResumeDialogProps = {
  open: boolean;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onCreate: (title: string, templateId: TemplateId) => void;
};

export function NewResumeDialog({
  open,
  pending,
  error,
  onClose,
  onCreate,
}: NewResumeDialogProps) {
  const { t, isKhmer } = useLanguage();
  // The workspace remounts this dialog via `key` on every open, so fresh
  // defaults need no effect — see dashboard-workspace.tsx.
  const [title, setTitle] = useState(isKhmer ? "ប្រវត្តិរូបថ្មី" : "Untitled resume");
  const [templateId, setTemplateId] = useState<TemplateId>("classic");
  const titleRef = useRef<HTMLInputElement>(null);

  const trimmed = title.trim();

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !pending) onClose();
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">{t.dashboard.newResumeTitle}</DialogTitle>
          <DialogDescription>
            {isKhmer
              ? "កំណត់ចំណងជើង និងជ្រើសរើសគំរូចាប់ផ្តើម។ អ្នកអាចផ្លាស់ប្តូរបាននៅពេលក្រោយ។"
              : "Pick a title and a starting template. You can change both later."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (trimmed && !pending) onCreate(trimmed, templateId);
          }}
          className="flex flex-col gap-5"
        >
          <Field>
            <FieldLabel htmlFor="new-resume-title">{t.dashboard.resumeTitleLabel}</FieldLabel>
            <Input
              id="new-resume-title"
              ref={titleRef}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={80}
              autoFocus
            />
          </Field>

          <FieldSet>
            <FieldLegend variant="label">{t.editor.templateLabel}</FieldLegend>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {TEMPLATES.map((template) => {
                const selected = templateId === template.id;
                return (
                  <label
                    key={template.id}
                    className={`relative cursor-pointer rounded-xl border p-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/40 ${
                      selected
                        ? "border-ring ring-2 ring-ring/25"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={template.id}
                      checked={selected}
                      onChange={() => setTemplateId(template.id)}
                      className="sr-only"
                    />
                    <span className="block overflow-hidden rounded-lg bg-background p-1.5 pb-0">
                      <span className="block h-[72px] overflow-hidden rounded-t-md bg-white ring-1 ring-black/5">
                        <TemplateSheet templateId={template.id} />
                      </span>
                    </span>
                    <span className="mt-2 block text-center text-xs font-semibold">
                      {template.name}
                    </span>
                    {selected && (
                      <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" strokeWidth={3} aria-hidden />
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {isKhmer
                ? "អ្នកអាចប្តូរគំរូបានគ្រប់ពេលវេលា — ព័ត៌មានរបស់អ្នកនៅដដែល។"
                : "You can switch templates any time — your content stays."}
            </p>
          </FieldSet>

          {error && (
            <FieldError role="alert" className="rounded-lg bg-destructive/10 px-3 py-2">
              {error}
            </FieldError>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={!trimmed || pending}>
              {pending && <Spinner data-icon="inline-start" />}
              {pending ? t.dashboard.creating : t.dashboard.createFirst}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------- Rename --------------------------------- */

type RenameResumeDialogProps = {
  resume: DashboardResume | null;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onRename: (title: string) => void;
};

export function RenameResumeDialog({
  resume,
  pending,
  error,
  onClose,
  onRename,
}: RenameResumeDialogProps) {
  const { t, isKhmer } = useLanguage();
  // Remounted via `key={resume.id}` on the workspace side, so the initial
  // value seeds from the selected resume without a sync effect.
  const [title, setTitle] = useState(resume?.title ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = title.trim();

  return (
    <Dialog
      open={resume !== null}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !pending) onClose();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">{t.dashboard.renameTitle}</DialogTitle>
          <DialogDescription>
            {isKhmer
              ? "កំណត់ឈ្មោះដែលងាយស្រួលចំណាំនៅលើផ្ទាំងគ្រប់គ្រង។"
              : "Give this resume a name that is easy to spot on the dashboard."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (trimmed && !pending) onRename(trimmed);
          }}
          className="flex flex-col gap-5"
        >
          <Field>
            <FieldLabel htmlFor="rename-resume-title">{t.dashboard.resumeTitleLabel}</FieldLabel>
            <Input
              id="rename-resume-title"
              ref={inputRef}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={80}
              autoFocus
            />
          </Field>

          {error && (
            <FieldError role="alert" className="rounded-lg bg-destructive/10 px-3 py-2">
              {error}
            </FieldError>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={!trimmed || pending}>
              {pending && <Spinner data-icon="inline-start" />}
              {pending ? t.dashboard.renaming : t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------- Delete --------------------------------- */

type DeleteResumeDialogProps = {
  resume: DashboardResume | null;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onDelete: () => void;
};

export function DeleteResumeDialog({
  resume,
  pending,
  error,
  onClose,
  onDelete,
}: DeleteResumeDialogProps) {
  const { t, isKhmer } = useLanguage();

  return (
    <AlertDialog
      open={resume !== null}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !pending) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-lg font-bold">
            {t.dashboard.deleteConfirmTitle}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-semibold text-foreground">“{resume?.title}”</span>{" "}
            {isKhmer
              ? "នឹងត្រូវបានលុបចេញពីប្រព័ន្ធ។ សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។"
              : "will be removed from the list. This can't be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <FieldError role="alert" className="rounded-lg bg-destructive/10 px-3 py-2">
            {error}
          </FieldError>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{isKhmer ? "រក្សាទុក" : "Keep resume"}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              onDelete();
            }}
          >
            {pending && <Spinner data-icon="inline-start" />}
            {pending ? t.dashboard.deleting : t.common.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

"use client";

import { useRef, useState } from "react";
import { Check } from "lucide-react";
import { TEMPLATES, type DashboardResume, type TemplateId } from "@/lib/mock/dashboard";
import { Modal } from "./modal";
import { TemplateSheet } from "./template-sheet";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-action px-5 py-2.5 text-sm font-semibold text-white hover:bg-action-strong disabled:opacity-50";
const ghostButton =
  "rounded-full border border-hairline bg-white px-5 py-2.5 text-sm font-semibold hover:border-foreground/40";

/* ---------------------------------- Create --------------------------------- */

type NewResumeDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, templateId: TemplateId) => void;
};

export function NewResumeDialog({ open, onClose, onCreate }: NewResumeDialogProps) {
  // The workspace remounts this dialog via `key` on every open, so fresh
  // defaults need no effect — see dashboard-workspace.tsx.
  const [title, setTitle] = useState("Untitled resume");
  const [templateId, setTemplateId] = useState<TemplateId>("classic");
  const titleRef = useRef<HTMLInputElement>(null);

  const trimmed = title.trim();

  return (
    <Modal open={open} onClose={onClose} title="Start a new resume" initialFocus={titleRef}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (trimmed) onCreate(trimmed, templateId);
        }}
      >
        <label className="block text-sm font-medium">
          Resume title
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={80}
            className="mt-1.5 block w-full rounded-lg border border-hairline px-3 py-2 text-sm"
          />
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium">Template</legend>
          <div className="mt-2 grid grid-cols-3 gap-2.5">
            {TEMPLATES.map((template) => {
              const selected = templateId === template.id;
              return (
                <label
                  key={template.id}
                  className={`relative cursor-pointer rounded-xl border p-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-action/40 ${
                    selected ? "border-action ring-2 ring-action/25" : "border-hairline hover:border-foreground/30"
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
                    <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-action text-white">
                      <Check size={12} strokeWidth={3} aria-hidden />
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-graphite">
            You can switch templates any time — your content stays.
          </p>
        </fieldset>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={ghostButton}>
            Cancel
          </button>
          <button type="submit" disabled={!trimmed} className={primaryButton}>
            Create resume
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------------------------- Rename --------------------------------- */

type RenameResumeDialogProps = {
  resume: DashboardResume | null;
  onClose: () => void;
  onRename: (title: string) => void;
};

export function RenameResumeDialog({ resume, onClose, onRename }: RenameResumeDialogProps) {
  // Remounted via `key={resume.id}` on the workspace side, so the initial
  // value seeds from the selected resume without a sync effect.
  const [title, setTitle] = useState(resume?.title ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = title.trim();

  return (
    <Modal open={resume !== null} onClose={onClose} title="Rename resume" initialFocus={inputRef}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (trimmed) onRename(trimmed);
        }}
      >
        <label className="block text-sm font-medium">
          Resume title
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={80}
            className="mt-1.5 block w-full rounded-lg border border-hairline px-3 py-2 text-sm"
          />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={ghostButton}>
            Cancel
          </button>
          <button type="submit" disabled={!trimmed} className={primaryButton}>
            Save name
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------------------------- Delete --------------------------------- */

type DeleteResumeDialogProps = {
  resume: DashboardResume | null;
  onClose: () => void;
  onDelete: () => void;
};

export function DeleteResumeDialog({ resume, onClose, onDelete }: DeleteResumeDialogProps) {
  return (
    <Modal open={resume !== null} onClose={onClose} title="Delete this resume?">
      <p className="text-sm leading-relaxed text-graphite">
        <span className="font-semibold text-foreground">“{resume?.title}”</span> will be removed from
        the list. This can&rsquo;t be undone.
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={onClose} className={ghostButton}>
          Keep resume
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-full bg-heart px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}

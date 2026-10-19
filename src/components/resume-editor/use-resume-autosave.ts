"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { saveResumeAction } from "@/server/actions/resume.actions";
import {
  resumeEditorSchema,
  type ResumeEditorFormValues,
} from "@/lib/validations/resume";

export type SaveStatus = "saved" | "dirty" | "saving" | "invalid" | "error";

const DEBOUNCE_MS = 1_200;

/**
 * Debounced autosave with a single in-flight request per editor.
 *
 * The form instance is passed in explicitly: `ResumeEditor` owns the form and
 * renders `<FormProvider>` below it, so calling `useFormContext()` here would
 * return null at runtime (and crash during hydration).
 *
 * A change marks the form dirty and schedules a save; saves only run when the
 * full document passes the Zod schema, so invalid drafts stay on the client
 * with visible errors instead of being persisted broken. If edits arrive while
 * a save is running, the latest snapshot is saved immediately afterwards.
 */
export function useResumeAutosave(
  resumeId: string,
  form: UseFormReturn<ResumeEditorFormValues>
) {
  const [status, setStatus] = useState<SaveStatus>("saved");

  const dirtyRef = useRef(false);
  const inFlightRef = useRef(false);
  const queuedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const snapshot = useCallback(() => {
    const parsed = resumeEditorSchema.safeParse(form.getValues());
    return parsed.success ? JSON.stringify(parsed.data) : null;
  }, [form]);

  const performSaveRef = useRef<() => Promise<boolean>>(async () => false);

  const performSave = useCallback(async (): Promise<boolean> => {
    if (inFlightRef.current) {
      queuedRef.current = true;
      return true;
    }

    const parsed = resumeEditorSchema.safeParse(form.getValues());
    if (!parsed.success) {
      await form.trigger();
      setStatus("invalid");
      return false;
    }

    const savedSnapshot = JSON.stringify(parsed.data);
    inFlightRef.current = true;
    setStatus("saving");

    let result: Awaited<ReturnType<typeof saveResumeAction>>;
    try {
      result = await saveResumeAction({ resumeId, ...parsed.data });
    } catch {
      // Network/server failures must not leave the editor stuck on "Saving…".
      inFlightRef.current = false;
      setStatus("error");
      return false;
    }

    inFlightRef.current = false;

    if (!result.ok) {
      setStatus("error");
      return false;
    }

    if (snapshot() === savedSnapshot) {
      dirtyRef.current = false;
      setStatus("saved");
    } else {
      dirtyRef.current = true;
      setStatus("dirty");
    }

    if (queuedRef.current) {
      queuedRef.current = false;
      void performSaveRef.current();
    }

    return true;
  }, [form, resumeId, snapshot]);

  useEffect(() => {
    performSaveRef.current = performSave;
  }, [performSave]);

  useEffect(() => {
    const subscription = form.watch((_values, info) => {
      if (!info.name) return;
      dirtyRef.current = true;
      setStatus((current) => (current === "saving" ? "saving" : "dirty"));

      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        void performSaveRef.current();
      }, DEBOUNCE_MS);
    });

    return () => {
      subscription.unsubscribe();
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [form]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const saveNow = useCallback(async () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const result = await performSaveRef.current();
    if (!result) {
      toast.error("Couldn’t save your changes. Check the highlighted fields and try again.");
    }
    return result;
  }, []);

  return {
    status,
    saveNow,
    hasUnsavedChanges: () => dirtyRef.current,
  };
}

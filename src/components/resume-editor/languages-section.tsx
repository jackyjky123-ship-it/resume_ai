"use client";

import { useFieldArray, useFormContext, type FieldPath } from "react-hook-form";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { newLanguageEntry, type ResumeEditorFormValues } from "@/lib/validations/resume";
import { EntryControls, SectionShell, TextField } from "./form-fields";

type FormPath = FieldPath<ResumeEditorFormValues>;

export function LanguagesSection() {
  const form = useFormContext<ResumeEditorFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "content.languages",
  });

  return (
    <SectionShell
      id="section-languages"
      title="Languages"
      description="Include proficiency so expectations are clear."
      action={
        <Button type="button" variant="outline" size="sm" onClick={() => append(newLanguageEntry())}>
          <Plus data-icon="inline-start" />
          Add language
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">No languages yet.</p>
      ) : (
        <FieldGroup>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2">
              <div className="grid flex-1 gap-5 sm:grid-cols-2">
                <TextField
                  name={`content.languages.${index}.name` as FormPath}
                  label="Language"
                  placeholder="English"
                  maxLength={60}
                />
                <TextField
                  name={`content.languages.${index}.proficiency` as FormPath}
                  label="Proficiency"
                  placeholder="Native · Fluent · B2"
                  maxLength={40}
                />
              </div>
              <div className="pb-px">
                <EntryControls
                  index={index}
                  total={fields.length}
                  label={`language ${index + 1}`}
                  onMoveUp={() => move(index, index - 1)}
                  onMoveDown={() => move(index, index + 1)}
                  onRemove={() => remove(index)}
                />
              </div>
            </div>
          ))}
        </FieldGroup>
      )}
    </SectionShell>
  );
}

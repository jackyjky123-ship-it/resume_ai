"use client";

import { useFieldArray, useFormContext, type FieldPath } from "react-hook-form";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { newSkillEntry, type ResumeEditorFormValues } from "@/lib/validations/resume";
import { EntryControls, SectionShell, TextField } from "./form-fields";

type FormPath = FieldPath<ResumeEditorFormValues>;

export function SkillsSection() {
  const form = useFormContext<ResumeEditorFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "content.skills",
  });

  return (
    <SectionShell
      id="section-skills"
      title="Skills"
      description="Tools and strengths the role actually asks for. Group related ideas in one line."
      action={
        <Button type="button" variant="outline" size="sm" onClick={() => append(newSkillEntry())}>
          <Plus data-icon="inline-start" />
          Add skill
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">No skills yet.</p>
      ) : (
        <FieldGroup>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2">
              <TextField
                name={`content.skills.${index}.name` as FormPath}
                label={`Skill ${index + 1}`}
                placeholder="TypeScript, React, accessibility"
                maxLength={60}
              />
              <div className="pb-px">
                <EntryControls
                  index={index}
                  total={fields.length}
                  label={`skill ${index + 1}`}
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

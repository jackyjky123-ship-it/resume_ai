"use client";

import { useFieldArray, useFormContext, type FieldPath } from "react-hook-form";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { useLanguage } from "@/lib/i18n/context";
import { newSkillEntry, type ResumeEditorFormValues } from "@/lib/validations/resume";
import { EntryControls, SectionShell, TextField } from "./form-fields";

type FormPath = FieldPath<ResumeEditorFormValues>;

export function SkillsSection() {
  const form = useFormContext<ResumeEditorFormValues>();
  const { t, isKhmer } = useLanguage();
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "content.skills",
  });

  return (
    <SectionShell
      id="section-skills"
      title={t.editor.sectionSkills}
      description={t.editor.skillsDesc}
      action={
        <Button type="button" variant="outline" size="sm" onClick={() => append(newSkillEntry())}>
          <Plus data-icon="inline-start" />
          {t.editor.addSkill}
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isKhmer ? "មិនទាន់មានជំនាញនៅឡើយទេ។" : "No skills yet."}
        </p>
      ) : (
        <FieldGroup>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2">
              <TextField
                name={`content.skills.${index}.name` as FormPath}
                label={`${isKhmer ? "ជំនាញ" : "Skill"} ${index + 1}`}
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

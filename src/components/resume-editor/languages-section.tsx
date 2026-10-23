"use client";

import { useFieldArray, useFormContext, type FieldPath } from "react-hook-form";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { useLanguage } from "@/lib/i18n/context";
import { newLanguageEntry, type ResumeEditorFormValues } from "@/lib/validations/resume";
import { EntryControls, SectionShell, TextField } from "./form-fields";

type FormPath = FieldPath<ResumeEditorFormValues>;

export function LanguagesSection() {
  const form = useFormContext<ResumeEditorFormValues>();
  const { t, isKhmer } = useLanguage();
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "content.languages",
  });

  return (
    <SectionShell
      id="section-languages"
      title={t.editor.sectionLanguages}
      description={t.editor.languagesDesc}
      action={
        <Button type="button" variant="outline" size="sm" onClick={() => append(newLanguageEntry())}>
          <Plus data-icon="inline-start" />
          {t.editor.addLanguage}
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isKhmer ? "មិនទាន់មានភាសានៅឡើយទេ។" : "No languages yet."}
        </p>
      ) : (
        <FieldGroup>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2">
              <div className="grid flex-1 gap-5 sm:grid-cols-2">
                <TextField
                  name={`content.languages.${index}.name` as FormPath}
                  label={t.editor.languageName}
                  placeholder={isKhmer ? "ភាសាខ្មែរ ឬ អង់គ្លេស" : "English"}
                  maxLength={60}
                />
                <TextField
                  name={`content.languages.${index}.proficiency` as FormPath}
                  label={t.editor.proficiency}
                  placeholder={isKhmer ? "ភាសាកំណើត · ស្ទាត់ជំនាញ" : "Native · Fluent · B2"}
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

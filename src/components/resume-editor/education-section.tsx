"use client";

import { useFieldArray, useFormContext, type FieldPath } from "react-hook-form";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { useLanguage } from "@/lib/i18n/context";
import { newEducationEntry, type ResumeEditorFormValues } from "@/lib/validations/resume";
import { EntryControls, SectionShell, TextAreaField, TextField } from "./form-fields";

type FormPath = FieldPath<ResumeEditorFormValues>;

export function EducationSection() {
  const form = useFormContext<ResumeEditorFormValues>();
  const { t, isKhmer } = useLanguage();
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "content.education",
  });

  return (
    <SectionShell
      id="section-education"
      title={t.editor.sectionEducation}
      description={t.editor.educationDesc}
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(newEducationEntry())}
        >
          <Plus data-icon="inline-start" />
          {t.editor.addEducation}
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isKhmer ? "មិនទាន់មានប្រវត្តិសិក្សានៅឡើយទេ។" : "No education entries yet."}
        </p>
      ) : (
        <FieldGroup>
          {fields.map((field, index) => (
            <Card key={field.id} size="sm" className="bg-background/60">
              <CardContent className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">
                    {field.school?.trim() || `${isKhmer ? "ការអប់រំ" : "Education"} ${index + 1}`}
                  </p>
                  <EntryControls
                    index={index}
                    total={fields.length}
                    label={field.school?.trim() || `education entry ${index + 1}`}
                    onMoveUp={() => move(index, index - 1)}
                    onMoveDown={() => move(index, index + 1)}
                    onRemove={() => remove(index)}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    name={`content.education.${index}.school` as FormPath}
                    label={t.editor.school}
                    placeholder={isKhmer ? "សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ" : "Ridgeview University"}
                    maxLength={160}
                  />
                  <TextField
                    name={`content.education.${index}.location` as FormPath}
                    label={t.editor.location}
                    placeholder={isKhmer ? "ភ្នំពេញ, កម្ពុជា" : "Vancouver, Canada"}
                    maxLength={120}
                  />
                  <TextField
                    name={`content.education.${index}.degree` as FormPath}
                    label={t.editor.degree}
                    placeholder={isKhmer ? "បរិញ្ញាបត្រ" : "BSc"}
                    maxLength={120}
                  />
                  <TextField
                    name={`content.education.${index}.field` as FormPath}
                    label={t.editor.field}
                    placeholder={isKhmer ? "វិទ្យាសាស្ត្រកុំព្យូទ័រ" : "Computer Science"}
                    maxLength={120}
                  />
                  <TextField
                    name={`content.education.${index}.startDate` as FormPath}
                    label={t.editor.startDate}
                    placeholder={isKhmer ? "កញ្ញា ២០២១" : "Sep 2021"}
                    maxLength={30}
                  />
                  <TextField
                    name={`content.education.${index}.endDate` as FormPath}
                    label={t.editor.endDate}
                    placeholder={isKhmer ? "មិថុនា ២០២៥" : "Jun 2025"}
                    maxLength={30}
                  />
                </div>

                <TextAreaField
                  name={`content.education.${index}.details` as FormPath}
                  label={isKhmer ? "ព័ត៌មានលម្អិតបន្ថែម" : "Details"}
                  description={
                    isKhmer
                      ? "មិនបង្ខំ៖ ពានរង្វាន់ កិត្តិយស ឬមុខវិជ្ជាសំខាន់ៗ។"
                      : "Optional: honors, relevant coursework, or activities."
                  }
                  rows={3}
                  maxLength={1_000}
                />
              </CardContent>
            </Card>
          ))}
        </FieldGroup>
      )}
    </SectionShell>
  );
}

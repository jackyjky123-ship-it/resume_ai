"use client";

import { Controller, useFieldArray, useFormContext, type FieldPath } from "react-hook-form";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useLanguage } from "@/lib/i18n/context";
import {
  newExperienceEntry,
  type ResumeEditorFormValues,
} from "@/lib/validations/resume";
import { BulletLinesField } from "./bullet-lines-field";
import { EntryControls, SectionShell, TextField } from "./form-fields";

type FormPath = FieldPath<ResumeEditorFormValues>;

export function ExperienceSection() {
  const form = useFormContext<ResumeEditorFormValues>();
  const { t, isKhmer } = useLanguage();
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "content.experience",
  });

  return (
    <SectionShell
      id="section-experience"
      title={t.editor.sectionExperience}
      description={t.editor.experienceDesc}
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(newExperienceEntry())}
        >
          <Plus data-icon="inline-start" />
          {t.editor.addExperience}
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isKhmer
            ? "មិនទាន់មានប្រវត្តិការងារនៅឡើយទេ។ សូមបន្ថែមបទពិសោធន៍ដំបូងរបស់អ្នក។"
            : "No roles yet. Add your first position to get started."}
        </p>
      ) : (
        <FieldGroup>
          {fields.map((field, index) => (
            <Card key={field.id} size="sm" className="bg-background/60">
              <CardContent className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">
                    {field.role?.trim() || field.company?.trim() || `${isKhmer ? "តួនាទី" : "Role"} ${index + 1}`}
                  </p>
                  <EntryControls
                    index={index}
                    total={fields.length}
                    label={field.role?.trim() || `role ${index + 1}`}
                    onMoveUp={() => move(index, index - 1)}
                    onMoveDown={() => move(index, index + 1)}
                    onRemove={() => remove(index)}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    name={`content.experience.${index}.role` as FormPath}
                    label={t.editor.jobRole}
                    placeholder={isKhmer ? "វិស្វករផ្នែកទន់" : "Frontend developer intern"}
                    maxLength={120}
                  />
                  <TextField
                    name={`content.experience.${index}.company` as FormPath}
                    label={t.editor.company}
                    placeholder={isKhmer ? "ឈ្មោះក្រុមហ៊ុន ឬស្ថាប័ន" : "Ridgeview Code Lab"}
                    maxLength={120}
                  />
                  <TextField
                    name={`content.experience.${index}.location` as FormPath}
                    label={t.editor.location}
                    placeholder={isKhmer ? "ភ្នំពេញ ឬ ពីចម្ងាយ (Remote)" : "Remote"}
                    maxLength={120}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    name={`content.experience.${index}.startDate` as FormPath}
                    label={t.editor.startDate}
                    placeholder={isKhmer ? "មិថុនា ២០២៤" : "Jun 2024"}
                    maxLength={30}
                  />
                  <TextField
                    name={`content.experience.${index}.endDate` as FormPath}
                    label={t.editor.endDate}
                    placeholder={isKhmer ? "សីហា ២០២៥" : "Aug 2025"}
                    maxLength={30}
                  />
                </div>

                <Controller
                  control={form.control}
                  name={`content.experience.${index}.current` as FormPath}
                  render={({ field: currentField }) => (
                    <Field orientation="horizontal">
                      <Checkbox
                        id={`experience-${index}-current`}
                        checked={currentField.value as boolean}
                        onCheckedChange={(checked) => currentField.onChange(checked === true)}
                      />
                      <FieldLabel htmlFor={`experience-${index}-current`}>
                        {t.editor.currentJob}
                      </FieldLabel>
                    </Field>
                  )}
                />

                <BulletLinesField
                  name={`content.experience.${index}.bullets` as FormPath}
                  label={isKhmer ? "សមិទ្ធផលការងារ (ចំណុចពិពណ៌នា)" : "Highlights"}
                  placeholder={
                    isKhmer
                      ? "បង្កើនប្រសិទ្ធភាពដំណើរការប្រព័ន្ធបាន ៣៨%\nដឹកនាំ និងបណ្តុះបណ្តាលសមាជិកក្រុមថ្មីចំនួន ២ នាក់"
                      : "Cut page load by 38% by code-splitting the dashboard\nMentored two juniors through their first shipped feature"
                  }
                  role={field.role}
                  company={field.company}
                />
              </CardContent>
            </Card>
          ))}
        </FieldGroup>
      )}
    </SectionShell>
  );
}

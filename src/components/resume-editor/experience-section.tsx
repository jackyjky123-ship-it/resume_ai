"use client";

import { Controller, useFieldArray, useFormContext, type FieldPath } from "react-hook-form";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  newExperienceEntry,
  type ResumeEditorFormValues,
} from "@/lib/validations/resume";
import { BulletLinesField } from "./bullet-lines-field";
import { EntryControls, SectionShell, TextField } from "./form-fields";

type FormPath = FieldPath<ResumeEditorFormValues>;

export function ExperienceSection() {
  const form = useFormContext<ResumeEditorFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "content.experience",
  });

  return (
    <SectionShell
      id="section-experience"
      title="Work experience"
      description="Most recent first. Focus each bullet on what changed because of you."
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(newExperienceEntry())}
        >
          <Plus data-icon="inline-start" />
          Add role
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No roles yet. Add your first position to get started.
        </p>
      ) : (
        <FieldGroup>
          {fields.map((field, index) => (
            <Card key={field.id} size="sm" className="bg-background/60">
              <CardContent className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">
                    {field.role?.trim() || field.company?.trim() || `Role ${index + 1}`}
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
                    label="Role"
                    placeholder="Frontend developer intern"
                    maxLength={120}
                  />
                  <TextField
                    name={`content.experience.${index}.company` as FormPath}
                    label="Employer"
                    placeholder="Ridgeview Code Lab"
                    maxLength={120}
                  />
                  <TextField
                    name={`content.experience.${index}.location` as FormPath}
                    label="Location"
                    placeholder="Remote"
                    maxLength={120}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    name={`content.experience.${index}.startDate` as FormPath}
                    label="Start"
                    placeholder="Jun 2024"
                    maxLength={30}
                  />
                  <TextField
                    name={`content.experience.${index}.endDate` as FormPath}
                    label="End"
                    placeholder="Aug 2025"
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
                        I currently work here
                      </FieldLabel>
                    </Field>
                  )}
                />

                <BulletLinesField
                  name={`content.experience.${index}.bullets` as FormPath}
                  label="Highlights"
                  placeholder={"Cut page load by 38% by code-splitting the dashboard\nMentored two juniors through their first shipped feature"}
                />
              </CardContent>
            </Card>
          ))}
        </FieldGroup>
      )}
    </SectionShell>
  );
}

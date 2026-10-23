"use client";

import { useFieldArray, useFormContext, type FieldPath } from "react-hook-form";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { useLanguage } from "@/lib/i18n/context";
import { newProjectEntry, type ResumeEditorFormValues } from "@/lib/validations/resume";
import { BulletLinesField } from "./bullet-lines-field";
import { EntryControls, SectionShell, TextAreaField, TextField } from "./form-fields";

type FormPath = FieldPath<ResumeEditorFormValues>;

export function ProjectsSection() {
  const form = useFormContext<ResumeEditorFormValues>();
  const { t, isKhmer } = useLanguage();
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "content.projects",
  });

  return (
    <SectionShell
      id="section-projects"
      title={t.editor.sectionProjects}
      description={t.editor.projectsDesc}
      action={
        <Button type="button" variant="outline" size="sm" onClick={() => append(newProjectEntry())}>
          <Plus data-icon="inline-start" />
          {t.editor.addProject}
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isKhmer ? "មិនទាន់មានគម្រោងនៅឡើយទេ។" : "No projects yet."}
        </p>
      ) : (
        <FieldGroup>
          {fields.map((field, index) => (
            <Card key={field.id} size="sm" className="bg-background/60">
              <CardContent className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">
                    {field.name?.trim() || `${isKhmer ? "គម្រោង" : "Project"} ${index + 1}`}
                  </p>
                  <EntryControls
                    index={index}
                    total={fields.length}
                    label={field.name?.trim() || `project ${index + 1}`}
                    onMoveUp={() => move(index, index - 1)}
                    onMoveDown={() => move(index, index + 1)}
                    onRemove={() => remove(index)}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    name={`content.projects.${index}.name` as FormPath}
                    label={t.editor.projectName}
                    placeholder={isKhmer ? "ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យ" : "Bloom — plant care tracker"}
                    maxLength={120}
                  />
                  <TextField
                    name={`content.projects.${index}.url` as FormPath}
                    label={isKhmer ? "តំណភ្ជាប់ (URL)" : "Link"}
                    placeholder="github.com/you/bloom"
                    inputMode="url"
                    maxLength={200}
                  />
                </div>

                <TextAreaField
                  name={`content.projects.${index}.description` as FormPath}
                  label={t.editor.projectDescription}
                  placeholder={
                    isKhmer
                      ? "មុខងាររបស់គម្រោង អ្នកប្រើប្រាស់គោលដៅ និងបច្ចេកវិទ្យាដែលបានប្រើប្រាស់..."
                      : "What it does, who it's for, and the stack you used."
                  }
                  rows={3}
                  maxLength={1_000}
                />

                <BulletLinesField
                  name={`content.projects.${index}.bullets` as FormPath}
                  label={isKhmer ? "សមិទ្ធផលចម្បង" : "Highlights"}
                  description={
                    isKhmer
                      ? "មិនបង្ខំ៖ លទ្ធផល ឬទិន្នន័យវាស់វែង — មួយជួរមួយចំណុច។"
                      : "Optional wins or metrics — one per line."
                  }
                  rows={3}
                  role="Project lead / contributor"
                  company={field.name}
                />
              </CardContent>
            </Card>
          ))}
        </FieldGroup>
      )}
    </SectionShell>
  );
}

"use client";

import { useFieldArray, useFormContext, type FieldPath } from "react-hook-form";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { useLanguage } from "@/lib/i18n/context";
import {
  newCertificationEntry,
  type ResumeEditorFormValues,
} from "@/lib/validations/resume";
import { EntryControls, SectionShell, TextField } from "./form-fields";

type FormPath = FieldPath<ResumeEditorFormValues>;

export function CertificationsSection() {
  const form = useFormContext<ResumeEditorFormValues>();
  const { t, isKhmer } = useLanguage();
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "content.certifications",
  });

  return (
    <SectionShell
      id="section-certifications"
      title={t.editor.sectionCertifications}
      description={t.editor.certificationsDesc}
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(newCertificationEntry())}
        >
          <Plus data-icon="inline-start" />
          {t.editor.addCertification}
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isKhmer ? "មិនទាន់មានវិញ្ញាបនបត្រនៅឡើយទេ។" : "No certifications yet."}
        </p>
      ) : (
        <FieldGroup>
          {fields.map((field, index) => (
            <Card key={field.id} size="sm" className="bg-background/60">
              <CardContent className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">
                    {field.name?.trim() || `${isKhmer ? "វិញ្ញាបនបត្រ" : "Certification"} ${index + 1}`}
                  </p>
                  <EntryControls
                    index={index}
                    total={fields.length}
                    label={field.name?.trim() || `certification ${index + 1}`}
                    onMoveUp={() => move(index, index - 1)}
                    onMoveDown={() => move(index, index + 1)}
                    onRemove={() => remove(index)}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    name={`content.certifications.${index}.name` as FormPath}
                    label={t.editor.certName}
                    placeholder="AWS Certified Cloud Practitioner"
                    maxLength={160}
                  />
                  <TextField
                    name={`content.certifications.${index}.issuer` as FormPath}
                    label={t.editor.issuer}
                    placeholder="Amazon Web Services"
                    maxLength={160}
                  />
                  <TextField
                    name={`content.certifications.${index}.issueDate` as FormPath}
                    label={t.editor.date}
                    placeholder={isKhmer ? "មីនា ២០២៥" : "Mar 2025"}
                    maxLength={30}
                  />
                  <TextField
                    name={`content.certifications.${index}.credentialUrl` as FormPath}
                    label={isKhmer ? "តំណភ្ជាប់ (URL)" : "Credential link"}
                    placeholder="credly.com/badges/…"
                    inputMode="url"
                    maxLength={200}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </FieldGroup>
      )}
    </SectionShell>
  );
}

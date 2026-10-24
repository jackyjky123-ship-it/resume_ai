"use client";

import { useFieldArray, useFormContext, type FieldPath } from "react-hook-form";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { useLanguage } from "@/lib/i18n/context";
import {
  newReferenceEntry,
  type ResumeEditorFormValues,
} from "@/lib/validations/resume";
import { EntryControls, SectionShell, TextField } from "./form-fields";

type FormPath = FieldPath<ResumeEditorFormValues>;

export function ReferencesSection() {
  const form = useFormContext<ResumeEditorFormValues>();
  const { t, isKhmer } = useLanguage();
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "content.references",
  });

  return (
    <SectionShell
      id="section-references"
      title={t.editor.sectionReferences}
      description={t.editor.referencesDesc}
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(newReferenceEntry())}
        >
          <Plus data-icon="inline-start" />
          {t.editor.addReference}
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isKhmer
            ? "មិនទាន់មានបុគ្គលយោងនៅឡើយទេ។ ចុចប៊ូតុងខាងលើដើម្បីបន្ថែម។"
            : "No references added yet. Click above to add lecturers or managers."}
        </p>
      ) : (
        <FieldGroup>
          {fields.map((field, index) => (
            <Card key={field.id} size="sm" className="bg-background/60">
              <CardContent className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">
                    {field.name?.trim() ||
                      `${isKhmer ? "បុគ្គលយោង" : "Reference"} ${index + 1}`}
                  </p>
                  <EntryControls
                    index={index}
                    total={fields.length}
                    label={field.name?.trim() || `reference ${index + 1}`}
                    onMoveUp={() => move(index, index - 1)}
                    onMoveDown={() => move(index, index + 1)}
                    onRemove={() => remove(index)}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    name={`content.references.${index}.name` as FormPath}
                    label={t.editor.refName}
                    placeholder={isKhmer ? "យឹម ស្រីយ៉ូអឺ" : "Yoem Sreyyoer"}
                    maxLength={120}
                  />
                  <TextField
                    name={`content.references.${index}.position` as FormPath}
                    label={t.editor.refPosition}
                    placeholder={
                      isKhmer
                        ? "សាស្រ្តាចារ្យ JavaScript & Vue.js"
                        : "JavaScript & Vue.js Lecturer"
                    }
                    maxLength={120}
                  />
                  <TextField
                    name={`content.references.${index}.workplace` as FormPath}
                    label={t.editor.refWorkplace}
                    placeholder={
                      isKhmer
                        ? "មជ្ឈមណ្ឌលបណ្តុះបណ្តាលបច្ចេកវិទ្យា ANT"
                        : "ANT Technology Training Center"
                    }
                    maxLength={160}
                  />
                  <TextField
                    name={`content.references.${index}.email` as FormPath}
                    label={t.editor.email}
                    placeholder="lecturer@example.com"
                    inputMode="email"
                    maxLength={120}
                  />
                  <TextField
                    name={`content.references.${index}.phone` as FormPath}
                    label={t.editor.phone}
                    placeholder={isKhmer ? "+855 12 345 678" : "+855 71 688 6209"}
                    maxLength={40}
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

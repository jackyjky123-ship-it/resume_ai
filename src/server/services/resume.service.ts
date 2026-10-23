import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import {
  emptyResumeDocument,
  generateStarterResumeDocument,
  parseResumeDocument,
  resumeTemplateSchema,
  saveResumeInputSchema,
  type CreateResumeInput,
  type ResumeDocument,
} from "@/lib/validations/resume";
import { filledSectionsOf } from "@/lib/resume-content";
import { type DashboardResume, type TemplateId } from "@/lib/resume-meta";
import {
  createResume as createResumeRecord,
  deleteResumeOwnedBy,
  getResumeOwnedBy,
  listResumes,
  updateResumeOwnedBy,
} from "@/server/repositories/resume.repository";

const TITLE_MAX = 80;

type ResumeRow = {
  id: string;
  title: string;
  templateId: string;
  content: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export type ResumeDetail = {
  id: string;
  title: string;
  templateId: TemplateId;
  content: ResumeDocument;
  createdAt: string;
  updatedAt: string;
};

function toTemplateId(value: string): TemplateId {
  const parsed = resumeTemplateSchema.safeParse(value);
  return parsed.success ? parsed.data : "classic";
}

function toDashboardResume(row: ResumeRow): DashboardResume {
  const content = parseResumeDocument(row.content);
  return {
    id: row.id,
    title: row.title,
    templateId: toTemplateId(row.templateId),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    filledSections: filledSectionsOf(content),
    content,
  };
}

function asJson(content: ResumeDocument): Prisma.InputJsonValue {
  return content as unknown as Prisma.InputJsonValue;
}

function isRecordNotFound(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2025"
  );
}

export async function listResumeCards(userId: string): Promise<DashboardResume[]> {
  const rows = await listResumes(userId);
  return rows.map(toDashboardResume);
}

export async function getResumeForEditor(
  userId: string,
  resumeId: string
): Promise<ResumeDetail | null> {
  if (!resumeId || resumeId.length > 64) return null;

  const row = await getResumeOwnedBy(userId, resumeId);
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    templateId: toTemplateId(row.templateId),
    content: parseResumeDocument(row.content),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createResumeForUser(
  userId: string,
  input: CreateResumeInput
): Promise<DashboardResume> {
  const content = input.starterRole
    ? generateStarterResumeDocument(input.starterRole)
    : emptyResumeDocument();

  const row = await createResumeRecord(userId, {
    title: input.title,
    templateId: input.templateId,
    content: asJson(content),
  });

  return toDashboardResume(row);
}

export async function saveResumeForUser(userId: string, rawInput: unknown) {
  const input = saveResumeInputSchema.parse(rawInput);

  const row = await updateResumeOwnedBy(userId, input.resumeId, {
    title: input.title,
    templateId: input.templateId,
    content: asJson(input.content),
  });

  return {
    id: row.id,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function renameResumeForUser(
  userId: string,
  resumeId: string,
  title: string
): Promise<DashboardResume | null> {
  try {
    const row = await updateResumeOwnedBy(userId, resumeId, { title });
    return toDashboardResume(row);
  } catch (error) {
    if (isRecordNotFound(error)) return null;
    throw error;
  }
}

export async function duplicateResumeForUser(
  userId: string,
  resumeId: string
): Promise<DashboardResume | null> {
  const source = await getResumeOwnedBy(userId, resumeId);
  if (!source) return null;

  const content = parseResumeDocument(source.content);
  const copyTitle = `${source.title.slice(0, TITLE_MAX - 5).trimEnd()} copy`;

  const row = await createResumeRecord(userId, {
    title: copyTitle,
    templateId: toTemplateId(source.templateId),
    content: asJson(content),
  });

  return toDashboardResume(row);
}

export async function deleteResumeForUser(
  userId: string,
  resumeId: string
): Promise<boolean> {
  try {
    await deleteResumeOwnedBy(userId, resumeId);
    return true;
  } catch (error) {
    if (isRecordNotFound(error)) return false;
    throw error;
  }
}

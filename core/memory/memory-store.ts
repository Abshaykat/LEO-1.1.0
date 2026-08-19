import {
  mkdir,
  readFile,
  rename,
  writeFile
} from "node:fs/promises";

import path from "node:path";
import { MEMORY_ROOT } from "../config/leo-config.ts";
import { randomUUID } from "node:crypto";

import type {
  CreateMemoryInput,
  LeoMemory
} from "./memory-types.ts";

const MEMORY_FILE = path.join(
  MEMORY_ROOT,
  "memories.json"
);

async function ensureStore(): Promise<void> {
  await mkdir(
    MEMORY_ROOT,
    {
      recursive: true
    }
  );
}

async function readMemories(): Promise<LeoMemory[]> {
  await ensureStore();

  try {
    const content =
      await readFile(
        MEMORY_FILE,
        "utf8"
      );

    const parsed: unknown =
      JSON.parse(content);

    if (!Array.isArray(parsed)) {
      throw new Error(
        "Memory store must contain an array."
      );
    }

    return parsed as LeoMemory[];
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return [];
    }

    throw error;
  }
}

async function writeMemories(
  memories: LeoMemory[]
): Promise<void> {
  await ensureStore();

  const temporaryFile =
    `${MEMORY_FILE}.tmp`;

  await writeFile(
    temporaryFile,
    JSON.stringify(
      memories,
      null,
      2
    ) + "\n",
    {
      encoding: "utf8"
    }
  );

  await rename(
    temporaryFile,
    MEMORY_FILE
  );
}

function normalizeTags(
  tags: string[] | undefined
): string[] {
  return [
    ...new Set(
      (tags ?? [])
        .map(
          tag => tag.trim().toLowerCase()
        )
        .filter(Boolean)
    )
  ];
}

export async function createMemory(
  input: CreateMemoryInput
): Promise<LeoMemory> {
  if (
    input.ownerId.trim().length === 0
  ) {
    throw new Error(
      "Memory ownerId is required."
    );
  }

  if (
    input.content.trim().length === 0
  ) {
    throw new Error(
      "Memory content cannot be empty."
    );
  }

  const now =
    new Date().toISOString();

  const memory: LeoMemory = {
    id: randomUUID(),
    ownerId: input.ownerId,
    category: input.category,
    access:
      input.access ?? "standard",
    content:
      input.content.trim(),
    source: input.source,
    createdAt: now,
    updatedAt: now,
    tags:
      normalizeTags(input.tags)
  };

  const memories =
    await readMemories();

  memories.push(memory);

  await writeMemories(memories);

  return memory;
}

export async function getMemory(
  ownerId: string,
  memoryId: string
): Promise<LeoMemory | undefined> {
  const memories =
    await readMemories();

  return memories.find(
    memory =>
      memory.ownerId === ownerId &&
      memory.id === memoryId
  );
}

export async function listMemories(
  ownerId: string
): Promise<LeoMemory[]> {
  const memories =
    await readMemories();

  return memories.filter(
    memory =>
      memory.ownerId === ownerId
  );
}

export async function deleteMemory(
  ownerId: string,
  memoryId: string
): Promise<boolean> {
  const memories =
    await readMemories();

  const filtered =
    memories.filter(
      memory =>
        !(
          memory.ownerId === ownerId &&
          memory.id === memoryId
        )
    );

  if (
    filtered.length === memories.length
  ) {
    return false;
  }

  await writeMemories(filtered);

  return true;
}

export async function getMemoryStorePath():
  Promise<string> {
  await ensureStore();

  return MEMORY_FILE;
}

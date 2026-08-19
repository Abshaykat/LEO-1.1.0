export type MemoryCategory =
  | "conversation"
  | "preference"
  | "personal"
  | "business"
  | "project"
  | "task"
  | "decision"
  | "security";

export type MemoryAccess =
  | "standard"
  | "restricted";

export interface LeoMemory {
  id: string;
  ownerId: string;
  category: MemoryCategory;
  access: MemoryAccess;
  content: string;
  source: "owner" | "conversation" | "system";
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface CreateMemoryInput {
  ownerId: string;
  category: MemoryCategory;
  access?: MemoryAccess;
  content: string;
  source: LeoMemory["source"];
  tags?: string[];
}

export interface MemoryQuery {
  ownerId: string;
  query: string;
  categories?: MemoryCategory[];
  ownerAuthenticated?: boolean;
  limit?: number;
}

export interface MemorySearchResult {
  memory: LeoMemory;
  score: number;
}

import { createHash } from "node:crypto";

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  tags: string[];
  source: string;
  updatedAt: string;
}

export interface KnowledgeMatch {
  document: KnowledgeDocument;
  score: number;
}

function terms(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of text.toLowerCase().match(/[a-z0-9\u0980-\u09ff]+/g) ?? []) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, aa = 0, bb = 0;
  for (const value of a.values()) aa += value * value;
  for (const value of b.values()) bb += value * value;
  for (const [key, value] of a) dot += value * (b.get(key) ?? 0);
  return aa && bb ? dot / Math.sqrt(aa * bb) : 0;
}

export class LocalKnowledgeIndex {
  private readonly documents = new Map<string, KnowledgeDocument>();

  add(input: Omit<KnowledgeDocument, "id" | "updatedAt"> & { id?: string }): KnowledgeDocument {
    const now = new Date().toISOString();
    const id = input.id ?? createHash("sha256").update(input.title + input.content).digest("hex").slice(0, 24);
    const document = { ...input, id, updatedAt: now };
    this.documents.set(id, document);
    return document;
  }

  search(query: string, limit = 5): KnowledgeMatch[] {
    const q = terms(query);
    return [...this.documents.values()]
      .map(document => ({
        document,
        score: cosine(q, terms([document.title, document.content, ...document.tags].join(" ")))
      }))
      .filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  list(): KnowledgeDocument[] {
    return [...this.documents.values()];
  }
}

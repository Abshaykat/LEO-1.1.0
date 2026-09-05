import { LocalKnowledgeIndex } from "./local-knowledge.ts";

function assert(value: boolean, message: string) {
  if (!value) throw new Error(message);
}

const index = new LocalKnowledgeIndex();
index.add({ title: "Security", content: "Owner approval is required before consequential execution.", tags: ["approval"], source: "test" });
index.add({ title: "Memory", content: "Local first contextual memory and restricted access.", tags: ["memory"], source: "test" });

const result = index.search("owner approval execution");
assert(result.length > 0, "Knowledge retrieval returned no result.");
assert(result[0].document.title === "Security", "Knowledge retrieval ranking is incorrect.");

console.log("PASS: Local knowledge retrieval.");

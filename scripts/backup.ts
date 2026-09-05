import "dotenv/config";
import { createEncryptedBackup } from "../core/backup/backup-manager.ts";

async function main(): Promise<void> {
  const result = await createEncryptedBackup();
  console.log(JSON.stringify(result, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

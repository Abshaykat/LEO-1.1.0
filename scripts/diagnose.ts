import { getConfigSummary } from "../core/config/leo-config.ts";
import { listTools } from "../core/permissions/tool-registry.ts";
import { listBackups } from "../core/backup/backup-manager.ts";

async function main(): Promise<void> {
  console.log(JSON.stringify({
    config: getConfigSummary(),
    tools: listTools().map(tool => ({
      name: tool.name,
      risk: tool.risk,
      requiresApproval: tool.requiresApproval,
      aiEnabled: tool.aiEnabled
    })),
    backups: await listBackups()
  }, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

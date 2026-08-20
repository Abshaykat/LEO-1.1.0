export type ToolRisk = "low" | "medium" | "high" | "critical";

export type ToolPermission =
  | "read_files"
  | "write_files"
  | "execute_commands"
  | "internet_access"
  | "browser_control"
  | "git_control"
  | "docker_control"
  | "agent_management"
  | "permission_management"
  | "backup_management";

export interface ToolDefinition {
  name: string;
  description: string;
  consequence: string;
  risk: ToolRisk;
  permissions: ToolPermission[];
  requiresApproval: boolean;
  affectsExternalSystems: boolean;
  destructive: boolean;
  aiEnabled: boolean;
}

const tools: ToolDefinition[] = [
  {
    name: "pc.read_file",
    description: "Read an authorized local file.",
    consequence: "The specified local file will be read by L.E.O.",
    risk: "low",
    permissions: ["read_files"],
    requiresApproval: true,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "pc.write_file",
    description: "Create or modify an authorized workspace file.",
    consequence: "The specified authorized workspace file will be created or modified.",
    risk: "medium",
    permissions: ["write_files"],
    requiresApproval: true,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "pc.list_directory",
    description: "List an authorized local directory.",
    consequence: "Directory metadata will be read from the owner's computer.",
    risk: "low",
    permissions: ["read_files"],
    requiresApproval: false,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "pc.run_command",
    description: "Execute a policy-checked command on the owner's computer.",
    consequence: "The command will execute on the owner's computer.",
    risk: "high",
    permissions: ["execute_commands"],
    requiresApproval: true,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "browser.open",
    description: "Open a public website in the owner's default browser.",
    consequence: "A public URL will be opened in the owner's browser.",
    risk: "low",
    permissions: ["browser_control", "internet_access"],
    requiresApproval: false,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "browser.search",
    description: "Search the public web using a configured search engine URL.",
    consequence: "A public web search will be opened in the owner's browser.",
    risk: "low",
    permissions: ["browser_control", "internet_access"],
    requiresApproval: false,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "web.fetch",
    description: "Fetch a public HTTP(S) page for research.",
    consequence: "L.E.O. will make a read-only public web request.",
    risk: "medium",
    permissions: ["internet_access"],
    requiresApproval: false,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "git.status",
    description: "Inspect Git status in the authorized repository.",
    consequence: "Git metadata will be read from the authorized repository.",
    risk: "low",
    permissions: ["git_control"],
    requiresApproval: false,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "git.diff",
    description: "Inspect the Git diff in the authorized repository.",
    consequence: "Git changes will be read from the authorized repository.",
    risk: "low",
    permissions: ["git_control"],
    requiresApproval: false,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "git.commit",
    description: "Create a Git commit in the authorized repository.",
    consequence: "A new Git commit will be created in the authorized repository.",
    risk: "medium",
    permissions: ["git_control"],
    requiresApproval: true,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "docker.control",
    description: "Inspect or control an authorized Docker resource.",
    consequence: "The selected Docker resource may be inspected or changed.",
    risk: "high",
    permissions: ["docker_control"],
    requiresApproval: true,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "agent.list",
    description: "List locally configured L.E.O. agents.",
    consequence: "Local agent metadata will be read.",
    risk: "low",
    permissions: ["agent_management"],
    requiresApproval: false,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "agent.create",
    description: "Create a local L.E.O. agent definition.",
    consequence: "A new local agent definition will be created.",
    risk: "critical",
    permissions: ["agent_management"],
    requiresApproval: true,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "agent.activate",
    description: "Activate a local L.E.O. agent definition.",
    consequence: "The selected local draft agent will transition to active state.",
    risk: "critical",
    permissions: ["agent_management"],
    requiresApproval: true,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "agent.disable",
    description: "Disable a local L.E.O. agent definition.",
    consequence: "The selected local active agent will transition to disabled state.",
    risk: "critical",
    permissions: ["agent_management"],
    requiresApproval: true,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "agent.delete",
    description: "Delete a local L.E.O. agent definition.",
    consequence: "The selected local agent definition will be deleted.",
    risk: "critical",
    permissions: ["agent_management"],
    requiresApproval: true,
    affectsExternalSystems: false,
    destructive: true,
    aiEnabled: true
  },
  {
    name: "permissions.modify",
    description: "Modify an L.E.O. permission policy entry.",
    consequence: "A local L.E.O. permission policy will be changed.",
    risk: "critical",
    permissions: ["permission_management"],
    requiresApproval: true,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "backup.create",
    description: "Create an encrypted L.E.O. backup.",
    consequence: "An encrypted backup archive will be written to the configured backup root.",
    risk: "medium",
    permissions: ["backup_management", "read_files", "write_files"],
    requiresApproval: true,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  },
  {
    name: "backup.verify",
    description: "Verify an L.E.O. backup manifest and hashes.",
    consequence: "Backup integrity metadata will be read and verified.",
    risk: "low",
    permissions: ["backup_management", "read_files"],
    requiresApproval: false,
    affectsExternalSystems: false,
    destructive: false,
    aiEnabled: true
  }
];

export function getTool(name: string): ToolDefinition | undefined {
  return tools.find(tool => tool.name === name);
}

export function listTools(): ToolDefinition[] {
  return tools.map(tool => ({ ...tool, permissions: [...tool.permissions] }));
}

export function listAiTools(): ToolDefinition[] {
  return listTools().filter(tool => tool.aiEnabled);
}

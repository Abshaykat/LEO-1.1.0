import type {
  CapabilityDefinition
} from "./capability-types.ts";

export class CapabilityRegistry {

  private readonly capabilities =
    new Map<string, CapabilityDefinition>();

  register(
    capability: CapabilityDefinition
  ): void {

    if (!capability.id.trim()) {
      throw new Error(
        "Capability id is required."
      );
    }

    if (
      this.capabilities.has(
        capability.id
      )
    ) {
      throw new Error(
        "Capability is already registered: " +
        capability.id
      );
    }

    this.capabilities.set(
      capability.id,
      Object.freeze({
        ...capability,
        tags: [
          ...capability.tags
        ]
      })
    );
  }

  get(
    id: string
  ):
    CapabilityDefinition |
    undefined {

    return this.capabilities.get(id);
  }

  list():
    CapabilityDefinition[] {

    return [
      ...this.capabilities.values()
    ];
  }

  hasAvailable(
    id: string
  ): boolean {

    return (
      this.get(id)?.status ===
      "available"
    );
  }
}

export function
createDefaultCapabilityRegistry():
  CapabilityRegistry {

  const registry =
    new CapabilityRegistry();

  registry.register({
    id:
      "local.command.execute",
    name:
      "Local command execution",
    description:
      "Execute a policy-checked local command.",
    kind:
      "tool",
    status:
      "available",
    tags:
      [
        "computer",
        "windows",
        "command"
      ],
    consequential:
      true
  });

  registry.register({
    id:
      "local.file.read",
    name:
      "Local file read",
    description:
      "Read a file inside the authorized L.E.O. boundary.",
    kind:
      "tool",
    status:
      "available",
    tags:
      [
        "computer",
        "file"
      ]
  });

  registry.register({
    id:
      "local.file.write",
    name:
      "Local file write",
    description:
      "Write a file inside the authorized L.E.O. boundary.",
    kind:
      "tool",
    status:
      "available",
    tags:
      [
        "computer",
        "file"
      ],
    consequential:
      true
  });

  registry.register({
    id:
      "local.file.list",
    name:
      "Local file listing",
    description:
      "List files inside the authorized L.E.O. boundary.",
    kind:
      "tool",
    status:
      "available",
    tags:
      [
        "computer",
        "file"
      ]
  });

  registry.register({
    id:
      "web.search",
    name:
      "Web search",
    description:
      "Search public web information.",
    kind:
      "tool",
    status:
      "available",
    tags:
      [
        "web",
        "research"
      ]
  });

  registry.register({
    id:
      "web.read",
    name:
      "Public web read",
    description:
      "Read public web content.",
    kind:
      "tool",
    status:
      "available",
    tags:
      [
        "web",
        "research"
      ]
  });

  registry.register({
    id:
      "spreadsheet.create",
    name:
      "Spreadsheet creation",
    description:
      "Create and validate spreadsheet files.",
    kind:
      "integration",
    status:
      "unavailable",
    tags:
      [
        "file",
        "spreadsheet"
      ]
  });

  const controlledIntegrations = [
    ["integration.marketing.meta_ads", "Meta Ads controlled adapter boundary", ["marketing", "meta", "ads"]],
    ["integration.marketing.tiktok_ads", "TikTok Ads controlled adapter boundary", ["marketing", "tiktok", "ads"]],
    ["integration.marketing.google_ads", "Google Ads controlled adapter boundary", ["marketing", "google", "ads"]],
    ["integration.trading.broker", "Broker/trading controlled adapter boundary", ["trading", "broker", "risk"]],
    ["integration.business.crm", "CRM controlled adapter boundary", ["business", "crm"]],
    ["integration.business.courier", "Courier/shipment controlled adapter boundary", ["business", "courier", "shipment"]],
    ["integration.business.payment", "Payment gateway controlled adapter boundary", ["business", "payment"]],
    ["integration.ecommerce.store", "E-commerce/store controlled adapter boundary", ["ecommerce", "store"]]
  ] as const;

  for (const [id, name, tags] of controlledIntegrations) {
    registry.register({
      id,
      name,
      description:
        "Provider-neutral, owner-controlled integration boundary. Live execution requires an explicitly configured provider adapter, credentials, approval and verification.",
      kind: "integration",
      status: "available",
      tags: [...tags],
      consequential: true
    });
  }

  registry.register({
    id:
      "browser.interact",
    name:
      "Browser interaction",
    description:
      "Interact with browser pages beyond read/search.",
    kind:
      "tool",
    status:
      "unavailable",
    tags:
      [
        "browser",
        "computer"
      ]
  });

  return registry;
}

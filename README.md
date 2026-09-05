# L.E.O.

Living Ecosystem Orchestrator

L.E.O. is a private, owner-controlled local AI computer assistant.

## Delivered foundation

- Natural-language planning in English, Bangla and Banglish
- Local AI provider abstraction with Ollama support
- Owner authentication
- Approval-controlled consequential execution
- Single-use, parameter-hashed approvals
- Auditable decisions and execution traces
- Local-first memory with restricted-memory access control
- Multi-step workflows with per-step approval and persistence
- Workflow resume after approval
- Controlled local file read/write/list
- Policy-checked Windows PowerShell execution
- Browser open/search
- Public web read-only fetch
- Git status/diff/commit
- Docker inspect/start/stop/restart/logs
- Local agent definition lifecycle with approval gates
- Permission policy changes with approval
- Encrypted AES-256-GCM backups with integrity manifests
- Diagnostics and repair planning foundation
- Market-intelligence and marketing-intelligence research foundations
- Local web approval UI

## Important capability boundary

L.E.O. does not pretend that an external service is configured when credentials or a provider are missing. Marketing platform execution, broker/market-data execution, mobile control and other external integrations require explicit adapters and credentials.

## Configuration

Copy `config/.env.example` to `.env` and configure:

- `LEO_HOME`
- `LEO_WORKSPACE`
- `LEO_OWNER_ID`
- `LEO_UI_TOKEN`
- `LEO_BACKUP_KEY`
- `LEO_COMMAND_WORKING_DIRECTORY`

On the owner's Windows machine the recommended project root remains `D:\\LEO` and encrypted backups should remain on `E:\\LEO-Backups`.

## Windows owner setup

1. Extract the ZIP to a local folder.
2. Run `Launch-LEO.cmd` or `Setup-LEO.ps1` from PowerShell.
3. Setup creates a private `.env`, local workspace and `E:\LEO-Backups`, then installs dependencies.
4. Use `Show-LEO-Token.ps1` only when the owner needs the private UI token.
5. The L.E.O. UI is available at `http://127.0.0.1:3000`.

The packaged workforce includes governed Marketing AI (Meta Ads, TikTok Ads, Google Ads), Trading AI (broker/trading), and E-commerce AI (store, CRM, courier, payment) integration boundaries. These are intentionally provider-neutral until the owner configures a specific provider adapter and credentials. Consequential external actions remain approval-gated and verified.

## Development

```powershell
npm install
npm run typecheck
npm test
npm run ui
```

Do not copy `node_modules` between operating systems. Run `npm install` on the machine where L.E.O. will run.

## PC app and mobile app

- Windows app-style launcher: `Launch-LEO-App.cmd` opens L.E.O. as a standalone Edge/Chrome application window.
- Mobile owner console: `mobile/` is an installable PWA with Bangla/English voice input.
- Optional Internet control: `cloudflare/` contains a Cloudflare Workers + Durable Objects relay. The relay transports authenticated commands only; the Windows PC remains the only execution authority.
- Remote commands enter the same owner authentication, permission, approval, execution, verification and audit pipeline as local commands.
- Keep `LEO_REMOTE_ENABLED=false` unless the owner has intentionally configured the private relay.

## Security model

The AI proposes. Runtime validates. Permission policy decides. Owner approval authorizes consequential actions. Execution consumes the exact approval and records the result. Windows PowerShell/CMD execution is available through the governed PC command capability and remains approval-gated; remote mobile requests cannot execute directly in the cloud.

L.E.O. never claims execution without an executor result.

# L.E.O. 1.1.0 Final Owner Setup

## 1. Windows PC
Target hardware is a modest Windows 11 Pro PC (i7-4770K, 10 GB RAM, Intel HD 4600, SSD system disk). Use the local Ollama model qwen3:1.7b when live local AI is desired. Do not require a dedicated GPU or Docker for the normal owner runtime.

1. Extract the final ZIP to `D:\LEO`.
2. Run `Launch-LEO-App.cmd`.
3. On first launch, setup creates the private configuration and `E:\LEO-Backups`.
4. Keep `LEO_UI_TOKEN` and `LEO_BACKUP_KEY` private.
5. The PC app is an app-style Windows launcher around the local governed L.E.O. service.

## 2. Local command workflow
Written and supported browser voice commands enter the same runtime. For consequential actions:
Request -> authentication -> planning -> permission -> owner approval -> execution -> verification -> audit.

CMD and PowerShell are execution mechanisms, not an approval bypass. L.E.O. cannot execute a consequential command merely because it was typed or spoken.

## 3. Mobile
The `mobile/` directory is the installable L.E.O. Mobile PWA. Open it from its hosted HTTPS origin, configure the Cloud WebSocket URL, device ID and remote token, then use the browser's Install option. It is responsive and uses the L.E.O. wolf identity without copying the desktop layout.

## 4. Cloud relay
Cloud is transport only. It never becomes the PC execution authority.

1. Create a Cloudflare Workers project and Durable Objects deployment.
2. In `cloudflare/`, run `wrangler login`.
3. Set a strong secret: `wrangler secret put REMOTE_TOKEN`.
4. Deploy: `wrangler deploy`.
5. The Worker URL becomes `wss://YOUR-WORKER-DOMAIN/ws`.
6. On the PC set:
   - `LEO_REMOTE_ENABLED=true`
   - `LEO_REMOTE_WS_URL=wss://YOUR-WORKER-DOMAIN/ws`
   - `LEO_REMOTE_DEVICE_ID=<private-id>`
   - `LEO_REMOTE_TOKEN=<same secret>`
7. Restart L.E.O.
8. In the mobile app use the same WebSocket URL, device ID and remote token.

Never port-forward the L.E.O. local HTTP server. The cloud relay forwards authenticated envelopes only.

## 5. Remote workflow
Mobile -> HTTPS/WSS Cloud Relay -> authenticated PC relay -> normal L.E.O. runtime -> permission -> owner approval if required -> Windows execution -> verification -> audit -> result/progress back to mobile.

If the PC is off, the mobile console must show PC OFFLINE. It must not claim that a command executed.

## 6. Live work monitoring
The PC UI exposes the local activity monitor. Remote execution emits progress states to the mobile console. Progress is derived from real workflow stages; unknown work is shown as indeterminate rather than fabricated precision.

## 7. Coding / GitHub workforce
The coding agent is a governed workforce role. GitHub/local Git work must use owner-approved credentials/capabilities. A development job can inspect code, edit files, run tests/typecheck, diagnose failures, prepare commits and produce artifacts. Push/PR/release actions remain permission and approval controlled.

## 8. External business agents
Marketing (Meta/TikTok/Google), trading/broker, CRM, Shopify/store, courier and payment capabilities remain provider-adapter boundaries. Configure credentials and adapters before live execution. L.E.O. must report unavailable providers instead of simulating success.

## 9. Final verification
Before treating a release as final, require typecheck, full regression, web E2E, package/app gates, backup integrity, security checks, clean packaging, forbidden-file scan and SHA-256 artifact verification. A live Ollama/provider test is separate and is not faked when the provider is unavailable.

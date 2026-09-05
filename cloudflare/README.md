# L.E.O. Cloud Relay

Deploy with Cloudflare Workers + Durable Objects.

1. Install Wrangler.
2. Run wrangler login.
3. Set the secret with: wrangler secret put REMOTE_TOKEN
4. Deploy with: wrangler deploy
5. Use the deployed Worker URL plus /ws as the Mobile App WebSocket URL.
6. On the Windows PC configure:
   LEO_REMOTE_ENABLED=true
   LEO_REMOTE_WS_URL=wss://YOUR-WORKER-DOMAIN/ws
   LEO_REMOTE_DEVICE_ID=your-private-device-id
   LEO_REMOTE_TOKEN=the-same-strong-secret

The relay only forwards authenticated envelopes. It does not execute commands. The PC is the only execution authority.

Keep the relay token private and never commit it.

# L.E.O. mobile access

L.E.O. is local-first. The mobile UI is the same responsive owner dashboard and is installable as a PWA.

## Recommended remote setup

For private remote access, use Tailscale rather than exposing L.E.O. directly to the public Internet.

1. Install Tailscale on the Windows PC and phone.
2. Sign both devices into the same personal tailnet.
3. Find the PC's Tailscale IP, usually in the 100.x.y.z range.
4. In the L.E.O. .env, set LEO_UI_HOST to the PC Tailscale IP and keep LEO_UI_PORT=3000.
5. Restart L.E.O.
6. On the phone, open http://PC-TAILSCALE-IP:3000.
7. Enter the private L.E.O. UI token when prompted.

Do not port-forward TCP 3000 or publish the L.E.O. execution server directly to the Internet. The UI token is an additional application-level control, not a replacement for private networking.

## Mobile voice

The dashboard uses the browser Web Speech API when available. It supports Bangla (bn-BD) and English/Banglish-oriented recognition modes. The browser sends the recognized text as a voice request through the same L.E.O. runtime, so voice commands use the same permission, approval, execution, verification and audit boundary as written commands.

If the browser does not support speech recognition, the written command box remains available.

## Hosting

Cloudflare Pages can host the visual dashboard shell, but it must not replace the local execution engine. GitHub Pages can host static documentation/UI, but it is not the right place for L.E.O.'s privileged execution service.

For actual phone-to-PC control, keep the execution engine on the PC and use a private network such as Tailscale.

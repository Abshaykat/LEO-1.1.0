import { createLeoServer } from "../web/server.ts";

const host = process.env.LEO_UI_HOST?.trim() || "127.0.0.1";
const port = Number(process.env.LEO_UI_PORT || "3000");
const server = createLeoServer();

server.listen(port, host, () => {
  console.log(`L.E.O. UI listening on http://${host}:${port}`);
});

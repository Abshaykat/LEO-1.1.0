import "dotenv/config";
import { createLeoServer } from "../web/server.ts";

const host = process.env.LEO_UI_HOST?.trim() || "127.0.0.1";
const port = Number(process.env.LEO_UI_PORT || "3000");

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("LEO_UI_PORT must be a valid TCP port.");
}

const server = createLeoServer();

server.listen(port, host, () => {
  console.log(`L.E.O. UI listening on http://${host}:${port}`);
  console.log("UI token is loaded from the private local configuration.");
  console.log("Use Show-LEO-Token.ps1 when the owner needs to retrieve it.");
});

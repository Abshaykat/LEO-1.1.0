import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";

const TEST_UI_TOKEN =
  "web-e2e-regression-token";

const TEST_OWNER_ID =
  "web-e2e-regression-owner";

process.env.LEO_UI_TOKEN =
  TEST_UI_TOKEN;

process.env.LEO_OWNER_ID =
  TEST_OWNER_ID;

async function loadServer() {
  return await import("./server.ts");
}

async function main(): Promise<void> {

  const {
    createLeoServer
  } = await loadServer();

  console.log(
    "=== L.E.O. WEB APPROVAL -> EXECUTION E2E TEST ==="
  );

  const server =
    createLeoServer();

  await new Promise<void>(
    (resolve, reject) => {

      server.once(
        "error",
        reject
      );

      server.listen(
        0,
        "127.0.0.1",
        () => resolve()
      );
    }
  );

  try {

    const address =
      server.address();

    assert(
      address &&
      typeof address !== "string",
      "Test server did not expose an address."
    );

    const port =
      (address as AddressInfo).port;

    const baseUrl =
      `http://127.0.0.1:${port}`;

    console.log("");
    console.log(
      "[1] Creating approval through /api/chat..."
    );

    const chatResponse =
      await fetch(
        `${baseUrl}/api/chat`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",

            "x-leo-token":
              TEST_UI_TOKEN
          },

          body:
            JSON.stringify({
              userMessage:
                "run Write-Output 'Web approval E2E works'"
            })
        }
      );

    assert(
      chatResponse.status === 200,
      `Expected /api/chat HTTP 200, received ${chatResponse.status}.`
    );

    const approvalResult =
      await chatResponse.json() as {
        type?: string;
        approvalId?: string;
        traceId?: string;
        toolName?: string;
      };

    console.log(
      JSON.stringify(
        approvalResult,
        null,
        2
      )
    );

    assert(
      approvalResult.type ===
        "approval_required",
      "Web request did not enter the approval boundary."
    );

    assert(
      typeof approvalResult.approvalId ===
        "string" &&
      approvalResult.approvalId.length > 0,
      "Approval ID was not returned."
    );

    assert(
      approvalResult.toolName ===
        "pc.run_command",
      "Unexpected approval tool."
    );

    console.log(
      "PASS: Web request entered approval boundary."
    );

    console.log("");
    console.log(
      "[2] Approving exact web action..."
    );

    const approveResponse =
      await fetch(
        `${baseUrl}/api/approve`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",

            "x-leo-token":
              TEST_UI_TOKEN
          },

          body:
            JSON.stringify({
              approvalId:
                approvalResult.approvalId
            })
        }
      );

    const approveBody =
      await approveResponse.text();

    console.log(
      approveBody
    );

    assert(
      approveResponse.status === 200,
      `Expected /api/approve HTTP 200, received ${approveResponse.status}: ${approveBody}`
    );

    const executionResult =
      JSON.parse(
        approveBody
      ) as {
        type?: string;
        response?: string;
        toolName?: string;
        result?: {
          stdout?: string;
          stderr?: string;
          exitCode?: number;
        };
      };

    assert(
      executionResult.type ===
        "execution",
      "Approved web action did not reach execution."
    );

    assert(
      executionResult.toolName ===
        "pc.run_command",
      "Unexpected execution tool."
    );

    assert(
      executionResult.result?.exitCode ===
        0,
      "Approved web action did not execute successfully."
    );

    assert(
      executionResult.result?.stdout?.includes(
        "Web approval E2E works"
      ) === true,
      "Execution output did not match the exact approved action."
    );

    console.log(
      "PASS: Exact approved web action reached execution."
    );

    console.log("");
    console.log(
      "=== L.E.O. WEB APPROVAL -> EXECUTION E2E TEST PASSED ==="
    );

  } finally {

    await new Promise<void>(
      resolve => {
        server.close(
          () => resolve()
        );
      }
    );
  }
}

main().catch(
  error => {

    console.error(
      "\n=== L.E.O. WEB APPROVAL -> EXECUTION E2E TEST FAILED ==="
    );

    console.error(
      error
    );

    process.exit(1);
  }
);


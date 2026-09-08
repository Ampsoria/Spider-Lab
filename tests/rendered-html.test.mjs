import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const { default: worker } = await import("../dist/server/index.js");
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the complete archive on the server without requiring WebGL", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<html[^>]*lang="th"/);
  assert.match(html, /<title>SPIDER LAB/);
  for (const actor of ["Tobey Maguire", "Andrew Garfield", "Tom Holland"]) {
    assert.ok(html.includes(actor), `Missing collection: ${actor}`);
  }
  assert.ok(html.includes("SPIDER-TRACKER"));
  assert.match(html, /id="lab"/);
  assert.match(html, /id="archive"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/);
});

test("unknown paths return a proper not-found response", async () => {
  const response = await render("/archive-does-not-exist");
  assert.equal(response.status, 404);
});

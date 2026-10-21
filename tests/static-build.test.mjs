import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const output = new URL("../dist-static/", import.meta.url);

test("production entry has Thai metadata and deployable assets under a repository path", async () => {
  const html = await readFile(new URL("index.html", output), "utf8");
  assert.match(html, /<html[^>]*lang="th"/);
  assert.match(html, /<title>ห้องแล็บแมงมุม/);
  assert.match(html, /<div id="root"><\/div>/);
  const assets = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map((match) => match[1]);
  assert.ok(assets.some((asset) => asset.endsWith(".js")), "Missing bundled JavaScript");
  assert.ok(assets.some((asset) => asset.endsWith(".css")), "Missing bundled styles");
  for (const asset of assets) {
    assert.ok(asset.startsWith("./"), `Asset would break on GitHub Pages: ${asset}`);
    assert.equal(new URL(asset, "https://example.github.io/spider-lab/").pathname.startsWith("/spider-lab/"), true);
    assert.ok((await stat(new URL(asset, output))).size > 0, `Empty asset: ${asset}`);
  }
});

test("self-hosted font files referenced by production CSS are present", async () => {
  const html = await readFile(new URL("index.html", output), "utf8");
  const styles = [...html.matchAll(/href="([^"]+\.css)"/g)];
  let fonts = 0;
  for (const [, path] of styles) {
    const stylesheet = new URL(path, output);
    const css = await readFile(stylesheet, "utf8");
    for (const [, asset] of css.matchAll(/url\(["']?([^\s)"']+\.woff2?)["']?\)/g)) {
      assert.ok((await stat(new URL(asset, stylesheet))).size > 0, `Missing font: ${asset}`);
      fonts++;
    }
  }
  assert.ok(fonts > 0, "Expected bundled Kanit fonts");
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const dictionary = JSON.parse(await readFile(new URL("../app/i18n/en.json", import.meta.url), "utf8"));

test("English covers every static translation used by the archive, tracker, and 3D viewer", async () => {
  const files = ["app/page.tsx", "app/components/TrackerSimulator.tsx", "app/components/GadgetScene.tsx"];
  let translated = 0;
  for (const file of files) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "t") {
        const key = node.arguments[0];
        if (key && ts.isStringLiteral(key)) {
          assert.ok(dictionary[key.text]?.trim(), `${file}: Missing translation for ${key.text}`);
          assert.doesNotMatch(dictionary[key.text], /[ก-๙]/, `Untranslated English: ${key.text}`);
          translated++;
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
  assert.ok(translated > 150, "Expected the complete archive and tracker translation set");
});

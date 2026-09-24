import { test } from "node:test";
import assert from "node:assert/strict";
import { clearSessionContent, isSessionContentKey } from "../localSessionKeys.js";

function memoryStorage(initial) {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    key: (i) => Array.from(data.keys())[i] ?? null,
    removeItem: (key) => data.delete(key),
    keys: () => Array.from(data.keys()),
  };
}

test("isSessionContentKey vise le cache de la base de connaissance et les brouillons d'articles", () => {
  assert.equal(isSessionContentKey("snu-support-kb"), true);
  assert.equal(isSessionContentKey("snu-kb-content-6600000000000000000000aa"), true);
  assert.equal(isSessionContentKey("snu-support-kb-tree-hidden"), false);
  assert.equal(isSessionContentKey("snu-support-kb-meta-hidden"), false);
  assert.equal(isSessionContentKey("persist:root"), false);
});

test("clearSessionContent retire les contenus et garde les préférences d'affichage", () => {
  const storage = memoryStorage({
    "snu-support-kb": "[]",
    "snu-kb-content-a": "{}",
    "snu-kb-content-b": "{}",
    "snu-support-kb-tree-hidden": "true",
  });

  const removed = clearSessionContent(storage);

  assert.deepEqual(removed.sort(), ["snu-kb-content-a", "snu-kb-content-b", "snu-support-kb"]);
  assert.deepEqual(storage.keys(), ["snu-support-kb-tree-hidden"]);
});

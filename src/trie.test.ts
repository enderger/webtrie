import { assert, assertEquals } from "https://deno.land/std@0.103.0/testing/asserts.ts"
import Trie from "./trie.ts"

Deno.test("Constructor", () => {
  const trie = new Trie();
  assertEquals(trie, new Trie());
})

Deno.test("Adding / Removing Keys", () => {
  const [ trie1, trie2 ] = [ new Trie(), new Trie() ];

  trie1.addKey("bar");
  trie1.addKey("baz");
  trie1.removeKey("bar");

  trie2.addKey("baz");

  assertEquals(trie1, trie2);
})

Deno.test("Finding Keys", () => {
  const trie = new Trie();

  trie.addKey("foo");
  trie.addKey("bar");

  assert(trie.findKey("bar"));
  assert(!trie.findKey("baz"))
})

Deno.test("Completions", () => {
  const trie = new Trie();

  trie.addKey("foo");
  trie.addKey("bar");
  trie.addKey("baz");

  assertEquals(trie.getCompletions("ba"), ["bar", "baz"]);
  assertEquals(trie.getCompletions("d"), []);
})


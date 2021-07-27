import * as log from "std/log/mod.ts";
import { assert, assertEquals } from "std/testing/asserts.ts";
import { exists } from "std/fs/exists.ts";
import Trie from "/src/trie.ts";
import TrieServer from "/src/server.ts";

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("ERROR"),
  },
  loggers: {
    default: {
      level: "ERROR",
      handlers: ["console"],
    },
  }
})

Deno.test("Load from empty state", async () => {
  const FAKESTATE = '/tmp/trie_server.test_missing_state.json';

  try {
    const server = new TrieServer(FAKESTATE);

    assert(await exists(server.stateFile))
    assertEquals(server.stateFile, FAKESTATE)
    assertEquals(server.dispatchAction('Show', {}), new Trie().toString())
  }
  finally {
    await Deno.remove(FAKESTATE);
  }
})

Deno.test("Load from invalid state", async () => {
  const INVALIDSTATE = '/tmp/trie_server.test_invalid_state.json';

  try {
    await Deno.writeFile(INVALIDSTATE, new TextEncoder().encode('{ "invalid": true }'));
    const server = new TrieServer(INVALIDSTATE);

    assert(await exists(server.stateFile));
    assertEquals(INVALIDSTATE, server.stateFile);
    assertEquals(server.dispatchAction('Show', {}), new Trie().toString());
  }
  finally {
    await Deno.remove(INVALIDSTATE);
  }
})

Deno.test("Load from valid state", async () => {
  const VALIDSTATE = '/tmp/trie_server.test_valid_state.json';

  try {
    // Create valid trie to write to JSON
    const trie = new Trie();
    trie.addKey('foo');
    trie.addKey('bar');
    await Deno.writeFile(VALIDSTATE, new TextEncoder().encode(JSON.stringify(trie)));

    const server = new TrieServer(VALIDSTATE);
    assert(await exists(VALIDSTATE));
    assertEquals(server.dispatchAction('Show', {}), trie.toString());
  }
  finally {
    await Deno.remove(VALIDSTATE);
  }
})

// Since the server acts as a frontend to the trie, I only need to test a few methods here
Deno.test("Modifying the trie", async () => {
  const CHANGEDSTATE = '/tmp/trie_server.test_invalid';

  try {
    const trie = new Trie();
    trie.addKey('foo');
    trie.addKey('baz');

    const server = new TrieServer(CHANGEDSTATE);
    server.dispatchAction('Add', { key: 'foo' });
    server.dispatchAction('Add', { key: 'bar' });
    server.dispatchAction('Add', { key: 'baz' });
    server.dispatchAction('Remove', { key: 'bar' });

    assert(await exists(server.stateFile));
    assertEquals(server.dispatchAction('Show', {}), trie.toString());
  }
  finally {
    await Deno.remove(CHANGEDSTATE);
  }
})



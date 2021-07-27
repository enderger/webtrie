import { assert } from "std/testing/asserts.ts";
import * as path from "std/path/mod.ts";
import { delay } from "std/async/delay.ts";
import { execute } from "/src/cli.ts";

console.error = () => {};
console.log = () => {};

const SERVER_STATE_DIR = '/tmp/trie_server.test_client_state.json';
const SERVER_ADDR = 'http://localhost:8080';
await Deno.remove(SERVER_STATE_DIR).catch(_ => {});

// Activate the server and ensure that tests don't run without it
Deno.run({
  cmd: [
    Deno.execPath(),
    'run',
    '--quiet',
    '--allow-read',
    '--allow-write',
    '--allow-net',
    '--import-map=../import_map.json',
    '../src/server.ts',
    `-s=${SERVER_STATE_DIR}`
  ],
  cwd: path.dirname(path.fromFileUrl(import.meta.url)),
});
await delay(100);

function testClientWith(...args: string[]): Promise<boolean> {
  return execute(args, SERVER_ADDR, true);
}

Deno.test("No arguments", async () => {
  const result = await testClientWith();
  assert(!result, "No error shown for empty subcommand!");
})

Deno.test("Invalid command", async () => {
  const result = await testClientWith('invalid');
  assert(!result, "No error shown for invalid subcommand!");
})

Deno.test("Valid command", async () => {
  const result = await testClientWith('show');
  assert(result, "Error shown for valid subcommand!");
})

Deno.test("Valid command with invalid arity", async () => {
  const result = await testClientWith('add', 'foo', 'baz');
  assert(!result, "No error shown for invalid arity!");
})

Deno.test("Valid command with valid arity", async () => {
  const result = await testClientWith('add', 'foo');
  assert(result, "Error shown for valid command and valid arity!");
})


import { assert } from "https://deno.land/std@0.103.0/testing/asserts.ts";
import { execute } from "../src/cli.ts";

const SERVER_STATE_DIR = '/tmp/trie_server.test_client_state.json';
const SERVER_ADDR = 'http://localhost:8080';
Deno.remove(SERVER_STATE_DIR).catch(_ => {});

const server = Deno.run({
  cmd: [
    'deno',
    'run',
    '--allow-read',
    '--allow-write',
    '--allow-net',
    '../src/server.ts',
    `-s=${SERVER_STATE_DIR}`
  ]
})

Deno.test("No arguments", async () => {
  const result = await execute(SERVER_ADDR, []);
  assert(!result, "No error shown for empty subcommand!");
})

Deno.test("Invalid command", async () => {
  const result = await execute(SERVER_ADDR, ['invalid']);
  assert(!result, "No error shown for invalid subcommand!");
})

Deno.test("Valid command", async () => {
  const result = await execute(SERVER_ADDR, ['show']);
  assert(result, "Error shown for valid subcommand!");
})

Deno.test("Valid command with invalid arity", async () => {
  const result = await execute(SERVER_ADDR, ['add', 'foo', 'baz']);
  assert(!result, "No error shown for invalid arity!");
})

Deno.test("Valid command with valid arity", async () => {
  const result = await execute(SERVER_ADDR, ['add', 'foo']);
  assert(result, "Error shown for valid command and valid arity!");
})

server.close();

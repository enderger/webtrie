import * as log from "std/log/mod.ts";
import { serve } from "std/http/server.ts";
import { readAll } from "std/io/util.ts";
import { ensureFileSync } from "std/fs/ensure_file.ts";
import { Args, parse } from "std/flags/mod.ts";
import Trie from "/src/trie.ts";

/// A representation of the server which serves our trie
export default class TrieServer {
  #state: Trie;
  readonly stateFile: string;

  constructor(stateFile = "/tmp/trie_server.state.json") {
    this.stateFile = stateFile;

    try {
      ensureFileSync(stateFile);
      const state = Deno.readTextFileSync(stateFile);
      const object = JSON.parse(state);
      this.#state = Trie.from(object);
    }
    catch (error) {
      log.warning(`JSON parsing failed: ${error}. Using empty trie instead.`);
      this.#state = new Trie();
    }
  }

  /// Serve the trie on port
  async serve(port = '8080') {
    for await (const req of serve({port: parseInt(port)})) {
      try {
        if (req.headers.get('Content-Type') !== 'application/json')
          throw "Non-JSON request recieved!";

        const rawBody: Uint8Array = await readAll(req.body)
        const decodedBody: string = new TextDecoder('utf-8').decode(rawBody);
        log.debug(`REQUEST: ${decodedBody}`)
        const body: Record<string, string> = JSON.parse(decodedBody);

        const output = this.dispatchAction(body.action ?? '', body);
        req.respond({ status: 200, body: output });
      }
      catch (error) {
        log.error(`Request errored: ${error.toString()}`)
        req.respond({ status: 500, body: `Error: ${error}` });
      }
    }
  }

  /// Run an action based on the given request on the internal trie
  dispatchAction(action: string, body: Record<string, string>): string {
    let result = '';

    switch (action?.toLowerCase()) {
      case 'add':
        this.#state.addKey(body.key ?? '');
      break;

      case 'remove':
        this.#state.removeKey(body.key ?? '');
      break;

      case 'find':
        result = this.#state.findKey(body.key ?? '').toString();
      break;

      case 'suggest': {
        const count = parseInt(body.count ?? '10');
        result = this.#state.getCompletions(body.prefix, count).join('\n');
      break;}

      case 'show':
        result = this.#state.toString();
      break;

      case 'help':
        result = `Actions: add, remove, find, suggest, show, help`;
      break;

      case '': throw "No action specified!";
      default: throw `Invalid action: ${action}`;
    }

    this.writeState();
    return result;
  }

  /// Write the state of the server to persistent memory
  async writeState() {
    const str = JSON.stringify(this.#state);
    await Deno.writeTextFile(this.stateFile, str);
  }
}

/// Parse the arguments passed to the server
function parseServerArgs(args: string[]): Args {
  const options = {
    alias: {
      p: 'port',
      s: 'state'
    },
    string: [ 'port', 'state' ],
    default: {
      port: 8080,
      state: undefined
    }
  };

  return parse(args, options);
}

if (import.meta.main) {
  const args = parseServerArgs(Deno.args);
  log.info(`Starting server on port ${args.port}`)

  if (!args.state)
    log.warning("No state file provided. To save to a persistent location, set the --state flag.");

  const server = new TrieServer(args.state);
  server.serve(args.port);
}

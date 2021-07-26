import { serve } from "https://deno.land/std@0.103.0/http/server.ts";
import { readAll } from "https://deno.land/std@0.103.0/io/util.ts";
import { ensureFileSync } from "https://deno.land/std@0.103.0/fs/ensure_file.ts";
import { Args, parse } from "https://deno.land/std@0.103.0/flags/mod.ts";
import Trie from "./trie.ts";

/// A representation of the server which serves our trie
export default class TrieServer {
  #state: Trie;
  readonly stateFile: string;

  constructor(stateFile: string) {
    this.stateFile = stateFile;

    try {
      ensureFileSync(stateFile);
      const state = Deno.readTextFileSync(stateFile);
      const object = JSON.parse(state);
      this.#state = Trie.from(object);
    }
    catch (error) {
      console.warn(`JSON parsing failed: ${error}. Using empty trie instead.`);
      this.#state = new Trie();
    }
  }

  /// Serve the trie on port
  async serve(port = 8080) {
    for await (const req of serve({port})) {
      try {
        const rawBody = await readAll(req.body)
        const decodedBody = new TextDecoder('utf-8').decode(rawBody);
        console.debug(`REQUEST: ${decodedBody}`)
        const body = JSON.parse(decodedBody);

        const output = this.dispatchAction(body.action ?? '', body);
        req.respond({ status: 200, body: output });
      }
      catch (error) {
        req.respond({ status: 500, body: error.toString() });
      }
    }
  }

  /// Run an action based on the given request on the internal trie
  dispatchAction(action: string, body: Record<string, string>): string {
    let result = '';

    switch (action) {
      case 'Add':
        this.#state.addKey(body.key ?? '');
      break;

      case 'Remove':
        this.#state.removeKey(body.key ?? '');
      break;

      case 'Find':
        result = this.#state.findKey(body.key ?? '').toString();
      break;

      case 'Suggest': {
        const count = parseInt(body.count ?? '10');
        result = this.#state.getCompletions(body.prefix, count).join('\n');
      break;}

      case 'Show':
        result = this.#state.toString();
      break;

      case 'Help':
        result = `Actions: Add, Remove, Find, Suggest, Show, Help`;
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

function parseServerArgs(args: string[]): Args {
  const options = {
    alias: {
      p: 'port',
      s: 'state'
    },
    string: [ 'port', 'state' ],
    default: {
      p: 8080,
      s: "/tmp/trie_server.state.json"
    }
  };

  return parse(args, options);
}

if (import.meta.main) {
  const args = parseServerArgs(Deno.args);
  console.log(`Starting server on port ${args.port}`)

  const server = new TrieServer(args.state);
  server.serve(args.port);
}

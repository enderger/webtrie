import * as c from "std/fmt/colors.ts";
import { parse, Args } from "std/flags/mod.ts";

// Execute a command for the CLI.
export async function execute(
  [action, ...args]: string[],
  server = 'http://0.0.0.0:8080', quiet = false,
): Promise<boolean> {
  const body: Record<string, string> = { action };
  let responseHandler = (text: string) => text;
  let commandArity = -1;

  const log = (message: string) => {
    if (!quiet) console.log(message);
  };

  switch (action?.toLowerCase()) {
    case 'add':
      log(c.green(`Adding ${args[0]}...`));
      body.key = args[0];
      commandArity = 1;
    break;

    case 'remove':
      log(c.green(`Removing ${args[0]}...`));
      body.key = args[0];
      commandArity = 1;
    break;

    case 'find':
      log(c.green(`Searching for ${args[0]}...`));
      body.key = args[0];

      responseHandler =
        text => (text === 'true')
         ? "Found!"
         : "Not found."
         ;
      commandArity = 1;
    break;

    case 'complete':
      log(c.green(`Getting completions for ${args[0]}...`));
      body.prefix = args[0];
      body.count = args[1] ?? '';
      commandArity = 2;
    break;

    case 'show':
      log(c.green("Showing..."));
      commandArity = 0;
    break;

    case 'help':
      console.log(c.green(`USAGE: trie-cli <COMMAND> [-s=SERVER] <ARGUMENTS>`));
      console.log(c.green('COMMANDS: add remove find complete show help'))
      console.log(c.green('See the documentation for more info.'));
      commandArity = 0;
    return true;
  }

  if (args.length !== commandArity) {
    console.error(c.red('Invalid usage. Use \'trie-cli help\' for more info.'));
    return false;
  }

  const response = await sendServerRequest(server, body);
  const text = await response.text();

  if (response.ok) {
    if (text) console.log(responseHandler(text));
    log(c.green("Done!"));
  }
  else {
    console.error(c.red(text));
    console.error(c.red("Request failed!"))
  }

  return response.ok;
}


async function sendServerRequest(server: string, body: Record<string, string>): Promise<Response> {
  const resp = await fetch(server, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(body)
  });

  return resp;
}

function parseArgs(args: string[]): Args {
  const options = {
    alias: {
      s: 'server',
      q: 'quiet'
    },

    string: [ 'server' ],
    boolean: [ 'quiet' ],

    default: {
      server: 'http://0.0.0.0:8080',
      quiet: false,
    }
  };

  return parse(args, options);
}

if (import.meta.main) {
  const { _: args, quiet, server } = parseArgs(Deno.args);
  const success = await execute(args.map(it => it.toString()), server, quiet);
  Deno.exit(success ? 0 : 1);
}

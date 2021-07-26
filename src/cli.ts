import * as c from "https://deno.land/std@0.103.0/fmt/colors.ts";
import { parse, Args } from "https://deno.land/std@0.103.0/flags/mod.ts";

// Execute a command for the CLI.
async function execute(server: string, [action, ...args]: string[]): Promise<boolean> {
  const body: Record<string, string> = { action };
  let responseHandler = (text: string) => text;

  switch (action?.toLowerCase()) {
    case 'add':
      console.log(c.green(`Adding ${args[0]}...`));
      body.key = args[0];
    break;

    case 'remove':
      console.log(c.green(`Removing ${args[0]}...`));
      body.key = args[0];
    break;

    case 'find':
      console.log(c.green(`Searching for ${args[0]}...`));
      body.key = args[0];

      responseHandler =
        text => (text === 'true')
         ? "Found!"
         : "Not found."
         ;
    break;

    case 'complete':
      console.log(c.green(`Getting completions for ${args[0]}...`));
      body.prefix = args[0];
      body.count = args[1] ?? '';
    break;

    case 'show':
      console.log(c.green("Showing..."));
    break;

    case 'help':
      console.log(c.green(`USAGE: trie-cli <COMMAND> [-s=SERVER] <ARGUMENTS>`));
      console.log(c.green('COMMANDS: add remove find complete show help'))
      console.log(c.green('See the documentation for more info.'));
    return true;

    default:
      console.error(c.red('Invalid usage. Use \'trie-cli help\' for more info.'));
    return false;
  }

  const response = await sendServerRequest(server, body);
  const text = await response.text();

  if (response.ok) {
    if (text) console.log(responseHandler(text));
    console.log(c.green("Done!"));
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
    },

    string: [ 'server' ],

    default: {
      server: 'http://0.0.0.0:8080',
    }
  };

  return parse(args, options);
}

if (import.meta.main) {
  const { _: args, server } = parseArgs(Deno.args);
  const success = await execute(server, args.map(it => it.toString()));
  Deno.exit(success ? 0 : 1);
}

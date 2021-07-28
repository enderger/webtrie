import * as c from "std/fmt/colors.ts";
import { parse, Args } from "std/flags/mod.ts";

const NAME = 'webtrie-cli';
const DEFAULT_SERVER = 'http://enderger.alwaysdata.net';

/// Execute a command for the CLI.
export async function execute(
  [action, ...args]: string[],
  server = DEFAULT_SERVER, quiet = false,
): Promise<boolean> {
  const body: Record<string, string> = { action };
  let responseHandler = (text: string) => text;

  const log = (message: string) => {
    if (!quiet) console.log(message);
  };

  switch (action?.toLowerCase()) {
    case 'add':
      log(c.green(`Adding ${args[0]}...`));
      body.key = args[0];

      if (args.length !== 1)
        throw `Invalid usage. Usage: ${NAME} add <KEY>`;
    break;

    case 'remove':
      log(c.green(`Removing ${args[0]}...`));
      body.key = args[0];

      if (args.length !== 1)
        throw `Invalid usage. Usage: ${NAME} remove <KEY>`;
    break;

    case 'find':
      log(c.green(`Searching for ${args[0]}...`));
      body.key = args[0];

      responseHandler =
        text => (text === 'true')
         ? "Found!"
         : "Not found."
         ;

      if (args.length !== 1)
        throw `Invalid usage. Usage: ${NAME} find <KEY>`;
    break;

    case 'complete':
      log(c.green(`Getting completions for ${args[0]}...`));
      body.prefix = args[0];
      body.count = args[1] ?? '';

      if (args.length < 1 || args.length > 2)
        throw `Invalid usage. Usage: ${NAME} complete <PREFIX> [<COUNT>]`
    break;

    case 'show':
      log(c.green("Showing..."));

      if (args.length !== 0)
        throw `Invalid usage. Usage: ${NAME} show`;
    break;

    case 'help':
      console.log(c.green(`USAGE: ${NAME} <COMMAND> [-s=SERVER] [--quiet] <ARGUMENTS>`));
      console.log(c.green('COMMANDS: add remove find complete show help'))
      console.log(c.green('See the documentation for more info.'));
    return true;

    default:
      console.error(c.red(`Invalid usage. Use '${NAME} help' for more info.`));
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


/// Send a request to the given server
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

/// Parse the given set of CLI arguments for the client
function parseArgs(args: string[]): Args {
  const options = {
    alias: {
      s: 'server',
      q: 'quiet'
    },

    string: [ 'server' ],
    boolean: [ 'quiet' ],

    default: {
      server: DEFAULT_SERVER,
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

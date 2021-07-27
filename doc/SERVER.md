# WebTrie Server
This file documents the server running WebTrie.

## Hosted Instance
TODO: Implement hosted instance

## Self-Hosting

### Install
1. Install [Deno](https://deno.land) and [Make](https://gnu.org/software/make).
2. Run `make install-server`

You can also use `deno run --allow-net --allow-read --allow-write src/server.ts` to run without installing. Note that you will need to configure a state file path on Windows, since by default the server saves it's state to a \*NIX path.

### Options

- `-p | --port` : The port on which to run the server. Defaults to 8080.
- `-s | --state` : The file to write the state to. Defaults to a \*NIX temporary file.

## Protocol
WebTrie is built atop a system of HTTP POST requests with JSON bodies. The CLI is a thin wrapper around a HTTP client which makes these requests. The server wraps a standard trie with a HTTP server and persistent storage capability.

Each operation is a HTTP POST request with a body of the following format:

```json
{
  "action": "<ACTION>",
  <ARGUMENTS>
}
```

To perform an action using CURL, simply use the following template:
```bash
curl <SERVER> --data '<BODY>'
```

### Add
Adds a key to the trie.

#### Arguments
- `key` : The key to add to the trie.

### Remove
Removes a key from trie.

#### Arguments
- `key` : The key to remove from the trie.

### Find
Find a key in the trie. Responds with `true` if successful and `false` otherwise.

#### Arguments
- `key` : The key to search for.

### Suggest
Suggest up to a given number of completions for a given prefix. Returns a newline-separated list of completions.

#### Arguments
- `prefix` : The prefix to complete for.
- `count` : The number of completions to give. Defaults to 10.

### Show
Show the trie as a JSON object. Returns said representation.

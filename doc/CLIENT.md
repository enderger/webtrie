# WebTrie CLI
This file documents the command-line frontend for WebTrie.

## Installation
1. Install [Deno](https://deno.land) and [Make](https://gnu.org/software/make).
2. In the top-level of this repository, run `make install-client`.
3. Ensure the installation root (which is the folder printed at the end of the prior output) is on your `PATH`.

You can also use `deno run --allow-net src/cli.ts` to run the client without installing it.

## Usage
The basic usage of this program is `webtrie-cli [-s=SERVER] [--quiet] <COMMAND> <ARGS>`.

### Options

Short| Long   |  Description  |
-----| ------ | --------------|
 -s  | server | Sets the server to communicate with. Defaults to our [hosted instance](./SERVER.md). |
 -q  | quiet  | Produce less verbose output. |

### Commands

- `add <KEY>` : Adds a key to the trie, producing an error if it already exists.
- `remove <KEY>` : Removes a key from the trie, producing an error if it doesn't exist.
- `find <KEY>` : Find if a key exists in the trie.
- `complete <PREFIX> [<COUNT>=10]` : Find a given number of completions for the given prefix.
- `show` : Show the trie in JSON format.



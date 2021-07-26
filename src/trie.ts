/// A trie search tree, see https://en.wikipedia.org/wiki/Trie
export default class Trie {
  readonly root: Node;

  constructor() {
    this.root = makeNode();
  }

  static from(state: Record<string, string>): Trie {
    return Object.assign(new Trie(), state);
  }

  /// Add a key to the trie
  addKey(key: string) {
    if ((key?.length ?? 0) === 0)
      throw "Attempted to add empty or missing key!";

    addKey(this.root, key);
  }

  /// Remove a key from the trie
  removeKey(key: string) {
    if ((key?.length ?? 0) === 0)
      throw "Attempted to remove an empty or missing key!";

    removeKey(this.root, key);
  }

  /// Find if the trie contains a key
  findKey(key: string): boolean {
    if ((key?.length ?? 0) === 0)
      return false;

    return findKey(this.root, key);
  }

  /// Find up to count autocompletions with the given prefix
  getCompletions(prefix = '', count = 10): string[] {
    const child = getChild(this.root, prefix);

    if (child !== null)
      return getCompletions(child, prefix, count);

    return [];
  }

  /// Stringify the trie
  toString(): string {
    return JSON.stringify(this.root, null, 2);
  }
}

interface Node {
  isResult: boolean,
  children: Record<string, Node>,
}

function makeNode(isResult = false, children: Record<string, Node> = {}): Node {
  return { isResult, children };
}

function addKey(node: Node, key: string) {
  // Handle the case where this is the node we are looking for
  if (key.length === 0) {
    if (node.isResult)
      throw "Attempted to add an already existing key!";

    node.isResult = true;
    return true;
  }

  // Recursively add the remaining characters, taking advantage of tail call optimisation
  const childData: string = key.charAt(0);
  node.children[childData] ??= makeNode();
  addKey(node.children[childData], key.substring(1));
}

// NOTE: The return value of this function indicates whether this node is dangling
// It is primarily intended to help with recursive cleanup
function removeKey(node: Node, key: string): boolean {
    if ((node ?? undefined) === undefined)
      throw "Could not remove a nonexistent key!";

    if (key.length === 0) {
      // Handle case where this node is the target
      if (!node.isResult)
        throw "Could not remove a node which is not a valid result!";

      node.isResult = false;
    }
    else {
      // Handle the case where this node is a parent of the target
      const childData: string = key.charAt(0);
      const result = removeKey(node.children[childData], key.substring(1));

      if (result)
        delete node.children[childData];
    }

    // Ensure that dangling nodes are cleaned up
    return Object.keys(node.children).length === 0;
}

function findKey(node: Node, key: string): boolean {
    if (node === undefined)
      return false;

    if (key.length === 0)
      return node.isResult;

    return findKey(node.children[key.charAt(0)], key.substring(1));
}

function getCompletions(node: Node, prefix: string, count: number): string[] {
  const completions: string[] = [];

  // Helper type to create strings from nodes
  type task = {
    data: string,
    node: Node,
  };

  // Process until up to count completions are found
  const todo: task[] = [{ data: prefix, node }];
  while (completions.length < count && todo.length >= 1) {
    const { data, node } = todo[0];
    todo.shift();

    if (node.isResult)
      completions.push(data);

    Object.entries(node.children).forEach(([char, node]) => {
      todo.push({ data: prefix.concat(char), node });
    })
  }

  return completions;
}

function getChild(node: Node, path: string): Node | null {
  if (path.length === 0)
    return node;

  const child = node.children[path.charAt(0)];

  if (child) return getChild(child, path.substring(1));
  return null;
}

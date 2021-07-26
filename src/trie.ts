/// A trie search tree, see https://en.wikipedia.org/wiki/Trie
export default class Trie {
  readonly root: Node;

  constructor() {
    this.root = new Node();
  }

  /// Add a key to the trie
  addKey(key: string) {
    if (key.length === 0)
      throw "Attempted to add empty or missing key!";

    this.root.addKey(key);
  }

  /// Remove a key from the trie
  removeKey(key: string) {
    if (key.length === 0)
      throw "Attempted to remove an empty or missing key!";

    this.root.removeKey(key);
  }

  /// Find if the trie contains a key
  findKey(key: string): boolean {
    if (key.length === 0)
      return false;

    return this.root.hasKey(key);
  }

  /// Find up to count autocompletions with the given prefix
  getCompletions(prefix: string, count?: number): string[] {
    const child = this.root.getChild(prefix);
    return child?.complete(prefix, count) ?? [];
  }

  /// Stringify the trie
  toString(): string {
    return JSON.stringify(this.root);
  }
}

/// A single element in the trie tree
class Node {
  isResult: boolean;
  children: Record<string, Node>;

  constructor(isResult: boolean = false) {
    this.isResult = isResult;
    this.children = {};
  }

  addKey(key: string) {
    // Handle the case where this is the node we are looking for
    if (key.length === 0) {
      if (this.isResult)
        throw "Attempted to add an already existing key!";

      this.isResult = true;
      return true;
    }

    // Recursively add the remaining characters, taking advantage of tail call optimisation
    const childData: string = key.charAt(0);
    this.children[childData] ??= new Node();
    this.children[childData].addKey(key.substring(1));
  }

  removeKey(key: string) {
    const _removeKey = (node: Node, key: string) => {
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
        const result = _removeKey(node.children[childData], key.substring(1));

        if (result)
          delete node.children[childData];
      }

      // Ensure that dangling nodes are cleaned up
      return Object.keys(node.children).length === 0;
    }

    _removeKey(this, key);
  }

  hasKey(key: string): boolean {
    if (key.length === 0)
      return this.isResult;

    return this.children[key.charAt(0)]?.hasKey(key.substring(1)) ?? false;
  }

  complete(prefix: string, count = 10): string[] {
    const completions: string[] = [];

    // Helper type to create strings from nodes
    type task = {
      data: string,
      node: Node,
    };

    // Process until up to count completions are found
    const todo: task[] = [{ data: prefix, node: this }];
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

  getChild(path: string): Node | null {
    if (path.length === 0)
      return this;

    const child = this.children[path.charAt(0)];
    return child?.getChild(path.substring(1));
  }
}

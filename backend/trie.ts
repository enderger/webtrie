/// A trie search tree, see https://en.wikipedia.org/wiki/Trie
export class Trie {
  #root: Node;

  constructor() {
    this.#root = new Node('');
  }


}

/// A single element in the trie tree
class Node {
  is_result: boolean;
  children: Object;

  constructor(is_result: boolean = false) {
    this.is_result = is_result;
    this.children = {};
  }

  add_key(key: string): boolean {
    // Handle the case where this is the node we are looking for
    if (key.length === 0) {
      if (this.is_result) {
        return false;
      }

      this.is_result = true;
      return true;
    }

    // Recursively add the remaining characters, taking advantage of tail call optimisation
    let child_data: string = key.charAt(0);
    this.children[child_data] ??= new Node();
    return this.children[child_data].add_key(key.substring(1));
  }

  remove_key(key: string): boolean {
    let _remove_key = (node: Node, key: string): { success: boolean, delete?: boolean } => {
      let success: boolean = false;

      if (key.length === 0) {
        // Handle case where this node is the target
        if (!node.is_result) {
          return { success: false };
        }

        node.is_result = false;
        success = true;
      }
      else {
        // Handle the case where this node is a parent of the target
        let child_data: string = key.charAt(0);
        let result = _remove_key(node.children[child_data], key.substring(1));

        if (result.delete) {
          delete node.children[child_data];
        }

        success = result.success;
      }

      // Ensure that dangling nodes are cleaned up
      return {
        success,
        delete: Object.keys(node.children).length === 0,
      }
    }

    return _remove_key(this, key).success;
  }

  has_key(key: string): boolean {
    if (key.length === 0) {
      return this.is_result;
    }
    return this.children[key.charAt(0)]?.has_key(key.substring(1)) ?? false;
  }

  show(root_value: string): string {
    let children: string[] = Object.keys(this.children);
    let result: string = `${root_value}: ${children} ${this.is_result ? ' (result)' : ''}\n`;

    children.forEach((value: string) => result += `${this.children[value].show(value)}`);
    return result;
  }
}

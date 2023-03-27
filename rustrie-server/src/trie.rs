use std::collections::HashMap;

#[derive(Default)]
pub struct TrieNode {
    children: HashMap<char, TrieNode>,
    is_end: bool,
    weight: u32,
}


pub struct Trie {
    root: TrieNode,
}

impl Trie {
    pub fn new() -> Trie {
        Trie {
            root: TrieNode::default(),
        }
    }

    pub fn search(&mut self, str: String) -> bool {
        let mut node = &mut self.root;

        println!("Search Function: Searching.. {}", str);

        for c in str.chars() {
            node = node.children.entry(c).or_default();
        }

        node.weight += 1;
        node.is_end = true;
        return true
    }

    pub fn exists(&self, word: String) -> bool {
        let mut node = &self.root;
        for c in word.chars() {
            if let Some(child) = node.children.get(&c) {
                println!("Exists Fn: checking.. {}", c);
                node = child;
            } else {
                return false;
            }
        }
        node.is_end
    }

    pub fn prefix(&self, prefix: String) -> Vec<String> {
        let mut node = &self.root;
        println!("Prefix Fn: Searching.. {}", prefix);
        for c in prefix.chars() {
            if let Some(child) = node.children.get(&c) {
                node = child
            } else {
                return vec![];
            }
        }
        let mut output = vec![];
        self.collect_words(node, prefix, &mut output);
        println!("Prefix Fn output:{:?}", output);
        output
    }

    pub fn collect_words(&self, node: &TrieNode, prefix: String, words: &mut Vec<String>) {
        if node.is_end {
            words.push(prefix.clone());
        }

        for (c, child) in &node.children {
            let mut new_prefix = prefix.clone();
            new_prefix.push(*c);
            self.collect_words(child, new_prefix, words);
        }
    }

    // pub fn delete(&mut self, str: String) -> bool {
    //     if str.is_empty() {
    //         return false;
    //     }
    //     let mut node = &mut self.root;
    //     let mut stack = Vec::new();
    //
    //     for c in str.chars() {
    //         if let Some(child) = node.children.get_mut(&c) {
    //             stack.push((node, c));
    //             node = child;
    //         } else {
    //             return false;
    //         }
    //     }
    //
    //
    //     if !node.is_end {
    //         return false;
    //     }
    //
    //     node.is_end = false;
    //
    //     // clean up any invalid leafs
    //
    //     for (parent, c) in stack.into_iter().rev() {
    //         let child = parent.children.get(&c).unwrap();
    //         if !child.is_end && child.children.is_empty() {
    //             parent.children.remove(&c);
    //         } else {
    //             break;
    //         }
    //     }
    //     true
    // }
}


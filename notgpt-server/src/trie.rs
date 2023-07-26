use std::collections::HashMap;
use serde::Serialize;

#[derive(Default)]
pub struct TrieNode {
    children: HashMap<char, TrieNode>,
    is_end: bool,
    weight: u32,
}

#[derive(Serialize, Debug, PartialEq)]
pub struct Suggestion {
    term: String,
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

        for c in str.to_lowercase().chars() {
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

    pub fn prefix(&self, prefix: String) -> Vec<Suggestion> {
        let mut node = &self.root;
        println!("Prefix Fn: Searching.. {}", prefix);
        for c in prefix.to_lowercase().chars() {
            if let Some(child) = node.children.get(&c) {
                node = child
            } else {
                return vec![];
            }
        }
        let mut output = vec![];
        self.collect_words(node, &prefix, &mut output);
        println!("Prefix Fn output:{:?}", output);

        // // remove word if == to prefix -- this is likely to be first word of vec
        // if let Some(pos) = output.iter().position(|suggestion| suggestion.term == prefix) {
        //     output.remove(pos);
        // }
        output.sort_by_key(|suggestion| suggestion.weight); // rank output in descending weight
        output.reverse();
        output.truncate(10); // limit output to 10

        return output
    }

    pub fn collect_words(&self, node: &TrieNode, prefix: &String, words: &mut Vec<Suggestion>) {
        if node.is_end {
            let suggestion = Suggestion {
                term: prefix.clone().to_lowercase(),
                weight: node.weight,
            };
            words.push(suggestion);
        }

        for (c, child) in &node.children {
            let mut new_prefix = prefix.clone();
            new_prefix.push(*c);
            self.collect_words(child, &new_prefix, words);
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


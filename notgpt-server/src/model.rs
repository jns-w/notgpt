use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use crate::trie::Trie;
use crate::queue::Queue;

#[allow(non_snake_case)]
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Search {
    pub id: Option<String>,
    pub searchTerm: String,
}

pub struct AppState {
    pub trie_db: Arc<Mutex<Trie>>,
    pub search_q: Arc<Mutex<Queue<String>>>,
    pub trending: Arc<Mutex<HashMap<String, usize>>>
}

impl AppState {
    pub fn init() -> AppState {
        AppState {
            trie_db: Arc::new(Mutex::new(Trie::new())),
            search_q: Arc::new(Mutex::new(Queue::new())),
            trending: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct SearchOptions {
    pub term: Option<String>,
}

use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use crate::trie::Trie;
use crate::queue::Queue;


pub struct AppState {
    pub trie_db: Arc<Mutex<Trie>>,
    pub search_queue: Arc<Mutex<Queue<String>>>,
    pub trending: Arc<Mutex<HashMap<String, usize>>>    // might embed this in search_q
}

impl AppState {
    pub fn init() -> AppState {
        AppState {
            trie_db: Arc::new(Mutex::new(Trie::new())),
            search_queue: Arc::new(Mutex::new(Queue::new())),
            trending: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[allow(non_snake_case)]
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Search {
    pub id: Option<String>,
    pub searchTerm: String,
}

#[derive(Debug, Deserialize)]
pub struct SearchOptions {
    pub term: Option<String>,
}



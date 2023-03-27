use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use crate::trie::Trie;

#[allow(non_snake_case)]
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Search {
    pub id: Option<String>,
    pub searchTerm: String,
}

pub struct AppState {
    pub trie_db: Arc<Mutex<Trie>>
}

impl AppState {
    pub fn init() -> AppState {
        AppState {
            trie_db: Arc::new(Mutex::new(Trie::new())),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct SearchOptions {
    pub term: Option<String>,
}

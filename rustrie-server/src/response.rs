use serde::Serialize;
use crate::trie::Suggestion;
// use crate::model::Search;
// use crate::model::SearchOptions;

#[derive(Serialize)]
pub struct GenericResponse {
    pub status: String,
    pub message: String,
}

#[derive(Serialize, Debug)]
pub struct PrefixResponse {
    pub status: String,
    pub data: Vec<Suggestion>,
}

#[derive(Serialize, Debug)]
pub struct TrendingResponse {
    pub status: String,
    pub data: Vec<String>,
}

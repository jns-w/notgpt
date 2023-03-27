use crate::{
    model::{AppState, SearchOptions},
    response::{GenericResponse},
};
use actix_web::{get, put, web, HttpResponse, Responder};
use crate::response::PrefixResponse;
use crate::trie::Suggestion;


#[get("/ping")]
async fn ping_handler() -> impl Responder {
    const MESSAGE: &str = "PING";

    let response_json = &GenericResponse {
        status: "success".to_string(),
        message: MESSAGE.to_string(),
    };
    HttpResponse::Ok().json(response_json)
}

#[get("/search")]
async fn search_handler(
    opts: web::Query<SearchOptions>,
    data: web::Data<AppState>) -> impl Responder {

    let mut db = data.trie_db.lock().unwrap();
    let term = opts.term
        .to_owned()
        .unwrap_or(" ".to_string());
    println!("term is {}", term);

    db.search(term.to_string());

    HttpResponse::Ok()
}

#[get("/search/prefix")]
async fn prefix_handler(
    opts: web::Query<SearchOptions>,
    data: web::Data<AppState>) -> impl Responder {
    let db = data.trie_db.lock().unwrap();

    let term = opts.term
        .to_owned()
        .unwrap_or("".to_string());

    println!("finding predictions");

    let result: Vec<Suggestion> = db.prefix(term);

    println!("this {:?}", result);

    let response = PrefixResponse {
        status: "success".to_string(),
        data: result,
    };

    HttpResponse::Ok().json(response)
}

#[get("/search/exists")]
async fn exists_handler(
    opts: web::Query<SearchOptions>,
    data: web::Data<AppState>
) -> impl Responder {
    let db = data.trie_db.lock().unwrap();

    let term = opts.term
        .to_owned()
        .unwrap_or("".to_string());

    println!("Exists Handler: checking.. {}", term);

    let result = db.exists(term);

    println!("Exists Handler: result.. {:?}", result);

    HttpResponse::Ok()
}

pub fn config(conf: &mut web::ServiceConfig) {
    let scope = web::scope("/api")
        .service(ping_handler)
        .service(prefix_handler)
        .service(search_handler)
        .service(exists_handler);

    conf.service(scope);
}

extern crate core;

mod handler;
mod model;
mod response;
mod trie;
mod queue;

use actix_web::middleware::Logger;
use actix_web::{http::header, web, App, HttpServer};

use tokio::time::interval;
use model::AppState;
use dotenv::dotenv;

use actix_cors::Cors;


async fn trending_update(state: web::Data<AppState>) {



}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    if std::env::var_os("RUST_LOG").is_none() {
        std::env::set_var("RUST_LOG", "actix_web=info");
    }
    env_logger::init();
    let db = AppState::init();
    let app_data = web::Data::new(db);
    println!("App running");

    dotenv().ok();
//     let port:u16 = std::env::var("PORT").expect("PORT must be set.").parse().unwrap();
    let port:u16 = 8080;

    println!("Server running at port {}", port);

    HttpServer::new(move || {
        let cors = Cors::permissive()
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![
                header::CONTENT_TYPE,
                header::AUTHORIZATION,
                header::ACCEPT,
            ])
            .supports_credentials();

        App::new()
            .app_data(app_data.clone())
            .configure(handler::config)
            .wrap(cors)
            .wrap(Logger::default())
    })
//         .bind(("127.0.0.1", port))?
        .bind(("0.0.0.0", port))?
        .run()
        .await
}


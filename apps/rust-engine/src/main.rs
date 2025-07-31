use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct Numbers {
    values: Vec<f64>,
}

#[derive(Serialize)]
struct SumResult {
    sum: f64,
}

#[post("/sum")]
async fn calculate_sum(numbers: web::Json<Numbers>) -> impl Responder {
    let sum: f64 = numbers.values.iter().sum();
    HttpResponse::Ok().json(SumResult { sum })
}

#[get("/health")]
async fn health_check() -> impl Responder {
    HttpResponse::Ok().body("Rust Financial Engine is healthy!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(calculate_sum)
            .service(health_check)
    })
    .bind(("0.0.0.0", 8001))?
    .run()
    .await
}
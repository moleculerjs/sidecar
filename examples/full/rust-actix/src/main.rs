use actix_web::{post, web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use serde_json;
use std::env;
use url::Url;

#[derive(Deserialize)]
struct ActionParams {
	name: String,
}

#[derive(Deserialize)]
struct ActionRequestBody {
	params: ActionParams
}

#[derive(Serialize, Deserialize)]
struct ActionResponse {
    response: String,
}

#[post("/actions/hello")]
async fn hello() -> impl Responder {
	println!("Hello action called.");
    HttpResponse::Ok()
		.json(ActionResponse {
			response: "Hello world from Rust!".to_string()
		})
}

#[post("/actions/welcome")]
async fn welcome(body: web::Json<ActionRequestBody>) -> impl Responder {
	println!("Welcome action called.");
	let msg = ["Hello ", &body.params.name, " from Rust!"].concat();
    HttpResponse::Ok()
		.json(ActionResponse {
			response: msg
		})
}

#[post("/events/sample.event")]
async fn sample_event() -> impl Responder {
	println!("Sample event happened.");
    HttpResponse::Ok()
}

#[actix_web::main]
async fn main() -> Result<(), std::io::Error> {

	let mut sidecar_address = "http://localhost:5103".to_string();
	if env::var("SIDECAR_ADDRESS").is_ok() {
		sidecar_address = env::var("SIDECAR_ADDRESS").unwrap();
	}

	println!("Registering service schema {}...\n", sidecar_address);

	let url = Url::parse(format!("{}/v1/registry/services", sidecar_address).as_str()).expect("Invalid Sidecar URL");

	let echo_json: serde_json::Value = reqwest::Client::new()
		.post(url)
		.json(&serde_json::json!({
			"name": "rust-demo",
			"settings": {
				"baseUrl": "http://rust-demo:5004"
			},
			"actions": {
				"hello": "/actions/hello",
				"welcome": {
					"params": {
						"name": "string|no-empty|trim"
					},
					"handler": "/actions/welcome"
				}
			},
			"events": {
				"sample.event": "/events/sample.event"
			}
		}))
		.send()
		.await.expect("Some error happened")
		.json()
		.await.expect("Some error happened");

	println!("Response: {:#?}", echo_json);

	println!("Starting server on '0.0.0.0:5004'...");
    HttpServer::new(|| {
        App::new()
			.service(hello)
			.service(welcome)
			.service(sample_event)
    })
	.bind("0.0.0.0:5004")?
	.workers(4)
    .run()
    .await
}

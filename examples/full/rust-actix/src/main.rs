use actix_web::{post, web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};

// use error_chain::error_chain;

// error_chain! {
//     foreign_links {
//         Io(std::io::Error);
//         HttpRequest(reqwest::Error);
//     }
// }

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
async fn main() -> std::io::Result<()> {

    // let res = reqwest::get("http://httpbin.org/get").await?;
    // println!("Status: {}", res.status());
    // println!("Headers:\n{:#?}", res.headers());

    // let body = res.text().await?;
    // println!("Body:\n{}", body);

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

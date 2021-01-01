import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const SIDECAR_ADDRESS = Deno.env.get('SIDECAR_ADDRESS') || "http://localhost:5103";

const router = new Router();
router
	.post("/actions/hello", ctx => {
		console.log("Hello action called.");
		ctx.response.body = { response: "Hello from Deno!" };
	})
	.post("/actions/welcome", async ctx => {
		console.log("Welcome action called.");
		const body = ctx.request.body();
		const params = (await body.value).params;
		ctx.response.body = { response: `Hello ${params.name} from Deno!` };
	})
	.post("/events/sample.event", ctx => {
		console.log("Sample event happened.");
		ctx.response.status = 200;
	});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

async function registerServiceSchema() {
	console.log(`Registering service schema (${SIDECAR_ADDRESS})...`);

	const headers = new Headers();
	headers.set('Content-Type', 'application/json');

	const rs = new ReadableStream();

	const res = await fetch(`${SIDECAR_ADDRESS}/v1/registry/services`, {
		method: "POST",
		headers,
		body: JSON.stringify({
			name: "deno-demo",
			settings: {
				baseUrl: "http://deno-demo:5007"
			},
			actions: {
				hello: "/actions/hello",
				welcome: {
					params: {
						name: "string|no-empty|trim"
					},
					handler: "/actions/welcome"
				}
			},
			events: {
				"sample.event": "/events/sample.event"
			}
		})
	});
	console.log("Response:", await res.text());
}

await registerServiceSchema();
console.log("Listening on port 5007");
await app.listen({ port: 5007 });

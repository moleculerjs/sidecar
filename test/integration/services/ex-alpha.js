const http = require("http");
const { POST, parseBody, sendResponse } = require("../utils");

let server, port;
let callStack = [];

module.exports = {
	start,
	stop,
	server,
	port,
	schema: () => ({
		name: "ex-alpha",

		settings: {
			baseUrl: `http://localhost:${port}`
		},

		actions: {
			list: "/list",
			danger: "/danger",
			silentHazard: "/silentHazard",
			proxy: "/proxy"
		},

		events: {
			"user.**": "/userEvents"
		}
	}),

	async callGreeterWelcome() {
		const res = await callAction("greeter.welcome", { name: "Sidecar" });
		return res.json;
	},

	callStack
};

async function httpHandler(req, res) {
	const { headers, method, url } = req;
	const path = url.substring(url.indexOf("/"));

	let body = await parseBody(req);
	if (body) {
		body = JSON.parse(body);
	}

	callStack.push({
		path,
		method,
		//headers,
		body
	});

	switch (path) {
		case "/list": {
			sendResponse(res, 200, {
				response: ["alpha", "beta", "gamma"],
				meta: { a: "5" }
			});
			break;
		}
		case "/danger": {
			sendResponse(res, 400, {
				error: {
					name: "MoleculerClientError",
					code: 400,
					type: "INVALID_INPUT",
					message: "Some user input is not valid",
					data: {
						// Any useful data
						action: "posts.list",
						params: {
							limit: "asd"
						}
					}
				}
			});

			break;
		}

		case "/silentHazard": {
			sendResponse(res, 521);
			break;
		}

		case "/proxy": {
			const response = await callAction("ex-beta.echo", body.params, {
				...body.meta,
				alpha: "ok"
			});
			sendResponse(res, response.status, response.json);
			break;
		}

		case "/userEvents": {
			//console.log("User event received.", body);
			break;
		}

		default: {
			sendResponse(res, 404, "Not found");
		}
	}
}

function callAction(name, params, meta) {
	return POST(global.sidecarBaseURL + "/v1/call/" + name, {
		params,
		meta
	});
}

function start() {
	server = http.createServer(httpHandler).listen(0);
	port = server.address().port;
	// console.log(`Ex-Aplha started on port ${port}`);
}

function stop() {
	server.close();
	// console.log(`Ex-Aplha stopped.`);
}

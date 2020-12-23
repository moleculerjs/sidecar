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
		name: "ex-beta",

		settings: {
			baseUrl: `http://localhost:${port}`
		},

		actions: {
			echo: "/my-actions/echo",
			emitUpdate: "/emit.post.update",
			broadcastUpdate: "/broadcast.post.update"
		}
	}),

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
		headers,
		body
	});

	switch (path) {
		case "/my-actions/echo": {
			sendResponse(res, 200, {
				response: {
					...body,
					meta: {
						...body.meta,
						beta: "ok"
					}
				}
			});
			break;
		}

		case "/emit.post.update": {
			POST(
				global.sidecarBaseURL + "/v1/emit/post.updated",
				{
					params: {
						id: 1,
						title: "First post"
					}
				},
				true
			);
			sendResponse(res, 200);
			break;
		}

		case "/broadcast.post.update": {
			POST(
				global.sidecarBaseURL + "/v1/broadcast/post.updated",
				{
					params: {
						id: 1,
						title: "First post"
					}
				},
				true
			);
			sendResponse(res, 200);
			break;
		}
		default: {
			sendResponse(res, 404, "Not found");
		}
	}
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

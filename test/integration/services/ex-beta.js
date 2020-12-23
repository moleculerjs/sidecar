const http = require("http");
const { parseBody, sendResponse } = require("../utils");

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
			echo: "/my-actions/echo"
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

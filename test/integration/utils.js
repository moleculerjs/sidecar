const fetch = require("node-fetch");

module.exports = {
	POST: async function (url, payload, noRes) {
		const res = await fetch(url, {
			method: "POST",
			cache: "no-cache",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json"
			},
			body: payload ? JSON.stringify(payload) : undefined
		});

		return {
			status: res.status,
			json: noRes ? null : await res.json()
		};
	},

	DELETE: async function (url) {
		const res = await fetch(url, {
			method: "DELETE",
			cache: "no-cache"
		});

		return {
			status: res.status,
			json: await res.json()
		};
	},

	parseBody: function (req) {
		let body = [];

		return new Promise((resolve, reject) => {
			req.on("error", err => reject(err))
				.on("data", chunk => body.push(chunk))
				.on("end", () => resolve(Buffer.concat(body).toString()));
		});
	},

	sendResponse: function (res, code, body) {
		const headers = {};
		if (typeof body == "object") {
			headers["Content-Type"] = "application/json";
			body = JSON.stringify(body);
		}

		res.writeHead(code, headers);
		res.end(body);
	}
};

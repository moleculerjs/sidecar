"use strict";

module.exports = {
	name: "greeter",
	actions: {
		hello: {
			rest: {
				method: "GET",
				path: "/hello"
			},
			handler: jest.fn(async () => "Hello Moleculer")
		},

		welcome: {
			rest: "/welcome",
			params: {
				name: "string"
			},
			handler: jest.fn(async ctx => `Welcome, ${ctx.params.name}`)
		},

		echo: {
			rest: "/echo",
			handler(ctx) {
				return {
					params: ctx.params,
					meta: ctx.meta
				};
			}
		}
	},

	events: {}
};

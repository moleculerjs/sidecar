"use strict";

const { POST, DELETE } = require("./utils");

process.argv = [
	process.argv[0],
	__filename,
	"--config",
	"test/integration/moleculer.config.sidecar.js"
];

const { ServiceBroker } = require("moleculer");
const GreeterService = require("./services/greeter.service");

const SidecarRunner = require("../../");

describe("Integration tests", () => {
	const broker = new ServiceBroker({ logger: false, transporter: "Fake" });
	broker.createService(GreeterService);

	const ExAlpha = require("./services/ex-alpha");
	const ExBeta = require("./services/ex-beta");
	let sidecarBroker, sidecarBaseURL;
	beforeAll(async () => {
		await ExAlpha.start();
		await ExBeta.start();
		await broker.start();
		sidecarBroker = await SidecarRunner;
		await broker.Promise.delay(500); // TODO
	});
	afterAll(async () => {
		await broker.stop();
		await sidecarBroker.stop();
		await ExAlpha.stop();
		await ExBeta.stop();
	});

	describe("Test service register/unregister", () => {
		it("test environment", async () => {
			const res = await sidecarBroker.call("greeter.hello");
			expect(res).toBe("Hello Moleculer");

			const sidecarService = sidecarBroker.getLocalService("v1.$sidecar");
			expect(sidecarService).toBeDefined();
			sidecarBaseURL = `http://localhost:${sidecarService.listenAddress.port}`;
			global.sidecarBaseURL = sidecarBaseURL;

			expect(sidecarBroker.getLocalService("ex-alpha")).toBeUndefined();
			expect(sidecarBroker.getLocalService("ex-beta")).toBeUndefined();
		});

		it("should not register empty schema", async () => {
			const res = await POST(`${sidecarBaseURL}/v1/registry/services`);
			expect(res.status).toBe(422);
			expect(res.json).toEqual({
				name: "ValidationError",
				message: "Parameters validation error!",
				type: "VALIDATION_ERROR",
				code: 422,
				data: [
					{
						action: "v1.$sidecar.registerService",
						field: "name",
						message: "The 'name' field is required.",
						nodeID: "sidecar",
						type: "required"
					}
				]
			});
		});

		it("should register schema with name", async () => {
			const res = await POST(`${sidecarBaseURL}/v1/registry/services`, {
				name: "ex-test"
			});

			expect(res.status).toBe(200);
			expect(res.json).toEqual({ status: "OK" });

			await broker.Promise.delay(50);

			expect(sidecarBroker.getLocalService("ex-test")).toBeDefined();
		});

		it("should unregister schema", async () => {
			const res = await DELETE(`${sidecarBaseURL}/v1/registry/services/ex-test`);

			expect(res.status).toBe(200);
			expect(res.json).toEqual({ status: "OK" });

			await broker.Promise.delay(50);

			expect(sidecarBroker.getLocalService("ex-test")).toBeUndefined();
		});
	});

	describe("Test external service actions", () => {
		it("should register ex-alpha schema", async () => {
			const res = await POST(`${sidecarBaseURL}/v1/registry/services`, ExAlpha.schema());

			expect(res.status).toBe(200);
			expect(res.json).toEqual({ status: "OK" });

			await broker.Promise.delay(500);
		});

		it("should call ex-alpha service 'list' action", async () => {
			expect(await broker.call("ex-alpha.list")).toEqual(["alpha", "beta", "gamma"]);
		});

		it("should call ex-alpha service 'danger' action", async () => {
			expect.assertions(7);
			try {
				await broker.call("ex-alpha.danger");
			} catch (err) {
				expect(err).toBeInstanceOf(Error);
				expect(err.name).toBe("MoleculerClientError");
				expect(err.message).toBe("Some user input is not valid");
				expect(err.code).toBe(400);
				expect(err.type).toBe("INVALID_INPUT");
				expect(err.stack).toBeDefined();
				expect(err.data).toEqual({
					action: "posts.list",
					params: {
						limit: "asd"
					}
				});
			}
		});

		it("should call ex-alpha service 'silentHazard' action", async () => {
			expect.assertions(7);
			try {
				await broker.call("ex-alpha.silentHazard");
			} catch (err) {
				expect(err).toBeInstanceOf(Error);
				expect(err.name).toBe("MoleculerError");
				expect(err.message).toBe("Something happened");
				expect(err.code).toBe(521);
				expect(err.type).toBeUndefined();
				expect(err.stack).toBeDefined();
				expect(err.data).toBeUndefined();
			}
		});

		it("should register ex-beta schema", async () => {
			const res = await POST(`${sidecarBaseURL}/v1/registry/services`, ExBeta.schema());

			expect(res.status).toBe(200);
			expect(res.json).toEqual({ status: "OK" });

			await broker.Promise.delay(500);
		});

		it("should call ex-beta service 'echo' action", async () => {
			expect(
				await broker.call(
					"ex-beta.echo",
					{ a: 5, b: "John", c: 123.45, d: true, e: [1, 2, 3] },
					{
						meta: {
							user: {
								id: 1,
								name: "John Doe"
							}
						}
					}
				)
			).toEqual({
				action: "ex-beta.echo",
				nodeID: broker.nodeID,
				params: { a: 5, b: "John", c: 123.45, d: true, e: [1, 2, 3] },
				meta: { user: { id: 1, name: "John Doe" }, beta: "ok" },
				options: {}
			});
		});

		it("should call ex-beta service 'echo' action via ex-alpha.proxy", async () => {
			expect(
				await broker.call(
					"ex-alpha.proxy",
					{ a: 5, b: "John", c: 123.45, d: true, e: [1, 2, 3] },
					{
						meta: {
							user: {
								id: 1,
								name: "John Doe"
							}
						}
					}
				)
			).toEqual({
				action: "ex-beta.echo",
				nodeID: "sidecar",
				params: { a: 5, b: "John", c: 123.45, d: true, e: [1, 2, 3] },
				meta: { user: { id: 1, name: "John Doe" }, alpha: "ok", beta: "ok" },
				options: {}
			});
		});
	});
});

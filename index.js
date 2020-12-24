/*
 * @moleculer/sidecar
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/sidecar)
 * MIT Licensed
 */

"use strict";

// Need references in order to pkg put them into the bundle.
require("amqplib");
require("avsc");
require("dotenv");
require("etcd3");
require("ioredis");
require("jaeger-client");
require("kafka-node");
require("mqtt");
require("msgpack5");
require("nats");
require("node-nats-streaming");
require("notepack.io");
require("protobufjs");
require("redlock");
require("rhea-promise");
require("thrift");

const { Runner } = require("moleculer");
const path = require("path");

console.log("argv:", process.argv);

const runner = new Runner();
module.exports = runner
	.start(process.argv)
	.then(async broker => {
		await broker.loadService(path.join(__dirname, "src", "index.js"));
		return broker;
	})
	.catch(err => {
		// eslint-disable-next-line no-console
		console.error(err);
		process.exit(1);
	});

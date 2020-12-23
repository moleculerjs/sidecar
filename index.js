/*
 * @moleculer/sidecar
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/sidecar)
 * MIT Licensed
 */

"use strict";

const { Runner } = require("moleculer");

const runner = new Runner();
module.exports = runner.start(process.argv).then(async broker => {
	await broker.loadService("./src/index.js");

	return broker;
});

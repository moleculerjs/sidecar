/*
 * @moleculer/sidecar
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/sidecar)
 * MIT Licensed
 */

"use strict";

const fetch = require("node-fetch");

module.exports = {
	name: "$sidecar",

	metadata: {},

	settings: {},

	created() {
		this.services = new Map();
	},

	methods: {
		//
	},

	started() {
		//
	},

	stopped() {
		//
	}
};

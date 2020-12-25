"use strict";

const moduleName = process.argv[2] || "full";
process.argv.splice(2, 1);

require("./" + moduleName);

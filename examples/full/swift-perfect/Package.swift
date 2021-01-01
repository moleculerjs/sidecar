// swift-tools-version:4.2

import PackageDescription

let package = Package(
	name: "server",
	products: [
		.executable(name: "server", targets: ["server"])
	],
	dependencies: [
		.package(url: "https://github.com/PerfectlySoft/Perfect-HTTPServer.git", from: "3.0.0"),
	],
	targets: [
		.target(name: "server", dependencies: ["PerfectHTTPServer"])
	]
)

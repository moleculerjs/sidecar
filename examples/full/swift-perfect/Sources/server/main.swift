import Foundation
import FoundationNetworking
//import os
import PerfectHTTP
import PerfectHTTPServer

func helloHandler(request: HTTPRequest, response: HTTPResponse) {
	print("Hello action called.");
	response.setHeader(.contentType, value: "application/json")

	do {
		let data: [String:Any] = [ "response": "Hello from Swift!" ]
		try response.setBody(json: data)
	} catch {
	}
	response.completed()
}

func welcomeHandler(request: HTTPRequest, response: HTTPResponse) {
	print("Welcome action called.");
	do {
		let decoded = try request.postBodyString!.jsonDecode() as! [String:Any]
		let params = decoded["params"] as! [String:Any]
		let name = params["name"] as! String

		response.setHeader(.contentType, value: "application/json")
		let data: [String:Any] = [ "response": "Hello " + name + " from Swift!" ]
		try response.setBody(json: data)

	} catch {}
	response.completed()
}

func eventHandler(request: HTTPRequest, response: HTTPResponse) {
	print("Sample event happened.");
	response.setHeader(.contentType, value: "application/json")
	response.appendBody(string: "{}")
	response.completed()
}

func registerServiceSchema() {
	var SIDECAR_ADDRESS = "http://localhost:5103";
	if let v = ProcessInfo.processInfo.environment["SIDECAR_ADDRESS"] {
		SIDECAR_ADDRESS = v
	}
	print("Registering service schema (" + SIDECAR_ADDRESS + ")...");

    let url = URL(string: SIDECAR_ADDRESS + "/v1/registry/services")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST" //set http method as POST
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")
	request.httpBody = """
	{
		"name": "swift-demo",
		"settings": {
			"baseUrl": "http://swift-demo:5008"
		},
		"actions": {
			"hello": "/actions/hello",
			"welcome": {
				"params": {
					"name": "string|no-empty|trim"
				},
				"handler": "/actions/welcome"
			}
		},
		"events": {
			"sample.event": "/events/sample.event"
		}
	}
	""".data(using: .utf8);

	let task = URLSession.shared.dataTask(with: request) { data, response, error in
		guard let data = data,
			let response = response as? HTTPURLResponse,
			error == nil else {                                              // check for fundamental networking error
			print("error", error ?? "Unknown error")
			fatalError("Terminating...")
		}

		guard (200 ... 299) ~= response.statusCode else {                    // check for http errors
			print("statusCode should be 2xx, but is \(response.statusCode)")
			print("response = \(response)")
			fatalError("Terminating...")
		}

		let responseString = String(data: data, encoding: .utf8)
		print("responseString = " + responseString!)
	}

	task.resume()

}

registerServiceSchema()

var routes = Routes()
routes.add(method: .post, uri: "/actions/hello", handler: helloHandler)
routes.add(method: .post, uri: "/actions/welcome", handler: welcomeHandler)
routes.add(method: .post, uri: "/events/sample.event", handler: eventHandler)

try HTTPServer.launch(name: "localhost", port: 5008, routes: routes)



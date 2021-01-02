import ballerina/http;
import ballerina/io;
import ballerina/system;
//import ballerina/docker;

//@docker:Config {
//	name: "ballerina-demo"
//}
service common on new http:Listener(5009) {

    resource function hello(http:Caller caller,
        http:Request req) returns error? {
		io:println("Hello action called");

        check caller->respond({
			response: "Hello from Ballerina!"
		});
    }

    resource function welcome(http:Caller caller,
        http:Request req) returns @tainted error? {
		io:println("Welcome action called");
		json payload = check req.getJsonPayload();
		map<json> body = <map<json>>payload;
		json params = body["params"];
		json|error name = params.name;
		string strName = <@untainted> name.toString();
        check caller->respond({
			response: string `Hello ${strName} from Ballerina!`
		});
    }

    resource function sample_event(http:Caller caller,
        http:Request req) returns error? {
		io:println("Sample event happened");

        check caller->respond();
    }
}

public function main() returns @tainted error? {
	string SIDECAR_ADDRESS = system:getEnv("SIDECAR_ADDRESS") != "" ? system:getEnv("SIDECAR_ADDRESS") : "http://localhost:5103";
	io:println(string `Registering service schema (${SIDECAR_ADDRESS})...`);

	http:Client clientEP = new (SIDECAR_ADDRESS);

	json content = {
		"name": "ballerina-demo",
		"settings": {
			"baseUrl": "http://ballerina-demo:5009"
		},
		"actions": {
			"hello": "/common/hello",
			"welcome": {
				"params": {
					"name": "string|no-empty|trim"
				},
				"handler": "/common/welcome"
			}
		},
		"events": {
			"sample.event": "/common/sample_event"
		}
	};

    http:Response resp = check clientEP->post("/v1/registry/services", content);

    json response = check resp.getJsonPayload();
    io:println("Response: ", response);
}

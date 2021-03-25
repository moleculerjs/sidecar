require "http/client"
require "kemal"

ENV["SIDECAR_ADDRESS"] ||= "http://localhost:5103"
SIDECAR_ADDRESS = ENV["SIDECAR_ADDRESS"]

def register_service_schema
	puts "Registering service schema (#{SIDECAR_ADDRESS})..."

	serviceSchema = "{
		\"name\": \"crystal-demo\",
		\"settings\": {
			\"baseUrl\": \"http://crystal-demo:5010\"
		},
		\"actions\": {
			\"hello\": \"/actions/hello\",
			\"welcome\": {
				\"params\": {
					\"name\": \"string|no-empty|trim\"
				},
				\"handler\": \"/actions/welcome\"
			}
		},
		\"events\": {
			\"sample.event\": \"/events/sample.event\"
		}
	}"

	uri = "#{SIDECAR_ADDRESS}/v1/registry/services"
	response = HTTP::Client.post(uri, headers: HTTP::Headers{"Content-Type" => "application/json"}, body: serviceSchema)
	puts response.body
end

register_service_schema

post "/actions/hello" do |env|
	puts "Hello action called."

	env.response.content_type = "application/json"
	{ "response": "Hello from Crystal!" }.to_json
end

post "/actions/welcome" do |env|
	puts "Welcome action called."

	params = env.params.json["params"].as(Hash(String, JSON::Any))
	name = params["name"]

	env.response.content_type = "application/json"
	{ "response": "Hello #{name} from Crystal!" }.to_json
end

post "/events/sample.event" do |env|
	puts "Sample event happened."
end

Kemal.run do |config|
	server = config.server.not_nil!
	server.bind_tcp "0.0.0.0", 5010, reuse_port: true
  end

# myapp.rb
require 'sinatra'
require 'json'
require 'net/http'

SIDECAR_ADDRESS = ENV['SIDECAR_ADDRESS'] || 'http://localhost:5103'

configure do
	set :bind, '0.0.0.0'
	set :port, 5006
	set :default_content_type, 'application/json'
end

post '/actions/hello' do
	logger.info "Hello action called."
	[200, {}, JSON[{
		'response' => "Hello from Ruby!"
	}]]
end

post '/actions/welcome' do
	logger.info "Welcome action called."

	data = JSON.parse request.body.read
	params = data['params']
	meta = data['meta']

	[200, {}, JSON[{
		'response' => "Hello #{params['name']} from Ruby!"
	}]]
end

post '/events/sample.event' do
	logger.info "Sample event happened."
	[200, {}, "{}"]
end

def register_service_schema
	puts "Registering service schema (#{SIDECAR_ADDRESS})..."

	uri = URI("#{SIDECAR_ADDRESS}/v1/registry/services")
	req = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
	req.body = {
		name: "ruby-demo",
		settings: {
			baseUrl: "http://ruby-demo:5006"
		},
		actions: {
			hello: "/actions/hello",
			welcome: {
				params: {
					name: "string|no-empty|trim"
				},
				handler: "/actions/welcome"
			}
		},
		events: {
			"sample.event": "/events/sample.event"
		}
	}.to_json
	res = Net::HTTP.start(uri.hostname, uri.port) do |http|
		http.request(req)
	end
	puts res
end

register_service_schema

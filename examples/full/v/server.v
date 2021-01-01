import net.http
import os
import vweb
//import json

struct App {
	vweb.Context
mut:
	cnt int
}

fn register_service_schema()? {
	mut sidecar_address := os.getenv('SIDECAR_ADDRESS')
	if sidecar_address == "" {
		sidecar_address = 'http://localhost:5103'
	}

	println('Registering service schema ($sidecar_address)')
	url := "http://localhost:5103/v1/registry/services"
	data := '{
		"name": "v-demo",
		"settings": {
			"baseUrl": "http://v-demo:5005"
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
	}'
	resp := http.post_json(url, data)?
	println('Response' + resp.text)
}


register_service_schema()

println("Listening on port 5005...")
vweb.run<App>(5005)

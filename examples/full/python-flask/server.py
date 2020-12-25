from flask import Flask
from flask import request
import json
import requests

app = Flask(__name__)

SIDECAR_ADDRESS = 'http://localhost:5103'

'''
Generate JSON responsefor actions
'''
def generate_json_response(content):
	return json.dumps({'response': content })

'''
Simple action handler
'''
@app.route("/actions/hello", methods=["POST"])
def index():
	return generate_json_response("Hello from Python!"), 200, {'Content-Type':'application/json'}

'''
Action handler with params
'''
@app.route("/actions/welcome", methods=["POST"])
def welcome():
	body = request.get_json()
	params = body.get('params')
	# meta = body.get('meta')
	return generate_json_response('Hello {} from Python!'.format(params['name'])), 200, {'Content-Type':'application/json'}

'''
Event handler
'''
@app.route("/events/sample.event.happened", methods=["POST"])
def user():
	# body = request.get_json()
	# params = body['params']
	# meta = body['meta']
	print("Sample event happened.")

	return "OK"

'''
Send a POST request to the Sidecar
'''
def POST(url, content):
	return requests.post(url = SIDECAR_ADDRESS + url, json = content)

'''
Register the service to the Sidecar
'''
def register_service_schema():
	schema = {
		'name': "python-demo",
		'settings': {
			'baseUrl': 'http://localhost:5000'
		},
		'actions': {
			'hello': '/actions/hello',
			'welcome': {
				'params': {
					'name': 'string|no-empty|trim'
				},
				'handler': '/actions/welcome'
			}
		},
		'events': {
			'sample.event.happened': '/events/sample.event.happened'
		}
	}

	# Register schema
	rsp = POST('/v1/registry/services', schema)

	print("Response: " + rsp.text)

'''
Call an action
Example:
	callAction("posts.list", params = { 'limit: 5, 'offset: 0 }, meta = { 'from': 'python' })
'''
def callAction(action, **kwargs):
	content = {
		'params': kwargs.get('params'),
		'meta': kwargs.get('meta'),
		'options': kwargs.get('options')
	}

	print("Calling '{}' action...".format(action))
	rsp = POST('/v1/call/' + action, content)

	return rsp

'''
Emit an event
'''
def emitEvent(event, **kwargs):
	content = {
		'params': kwargs.get('params'),
		'meta': kwargs.get('meta'),
		'options': kwargs.get('options')
	}

	print("Emitting '{}' event...".format(event))
	POST('/v1/emit/' + event, content)

'''
Get services list from Sidecar
'''
def getServiceList():
	rsp = callAction("$node.services")
	json = rsp.json()
	print("Services:")

	for item in json.get("response"):
		print("  {}".format(item.get("fullName")))
	print("")

'''
Start registration
'''
def start():
	print("Registering service to the Sidecar ({})...".format(SIDECAR_ADDRESS))
	register_service_schema()

	getServiceList()

	emitEvent("python-service.started")


start()

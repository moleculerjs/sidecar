<?php

require_once 'vendor/autoload.php';

use Mark\App;
use Workerman\Protocols\Http\Response;

$SIDECAR_ADDRESS = getenv('SIDECAR_ADDRESS', true) ? getenv('SIDECAR_ADDRESS') : 'http://localhost:5103';

$api = new App('http://0.0.0.0:5001');
$api->count = 4; // process count

// Action handler response sender
function sendResponse($content) {
	return new Response(200, ['Content-Type' => 'application/json'], json_encode([
		'response' => $content
	]));
}

// Action handler
$api->post(
    '/actions/hello',
    function ($request) {
		echo("Hello action called.\n");
		return sendResponse('Hello from PHP!');
    }
);

// Action handler
$api->post(
    '/actions/welcome',
    function ($request) {
		echo("Welcome action called. Body:\n" . $request->rawBody());
		$body = json_decode($request->rawBody(), true);
		$params = $body['params'];
		$meta = $body['meta'];
		return sendResponse('Hello ' . $params['name'] . ' from PHP!');
    }
);

// Event handler
$api->post(
    '/events/sample.event',
    function ($request) {
		echo("Sample event happened.\n");
		return new Response(200, [], "");
    }
);

// Make a HTTP request
function httpPost($url, $data)
{
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_POST, true);
	curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
	curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($curl);
    curl_close($curl);
    return $response;
}

function registerServiceSchema() {
	global $SIDECAR_ADDRESS;

	echo("Registering services to Sidecar (" . $SIDECAR_ADDRESS . ")...\n");
	$regRes = httpPost($SIDECAR_ADDRESS . '/v1/registry/services', '{
		"name": "php-demo",
		"settings": {
			"baseUrl": "http://192.168.0.243:5001"
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
	}');
	echo("Response: " . $regRes . "\n");
}

// Register schema
registerServiceSchema();

// Start nano
$api->start();

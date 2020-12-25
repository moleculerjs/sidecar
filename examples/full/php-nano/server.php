<?php

require_once 'vendor/autoload.php';

use laylatichy\nano\Nano;

$SIDECAR_ADDRESS = 'http://localhost:5103';

$nano = new Nano('http://0.0.0.0:5001');

function sendResponse(Nano $nano, $content): void {
    $nano->response->code(200);
    $nano->response->json(
		[
			'response' => $content
		]
	);
}


// Action handler
$nano->post(
    '/actions/hello',
    function ($request) use ($nano) {
		sendResponse($nano, 'Hello from PHP!');
    }
);

$nano->post(
    '/actions/welcome',
    function ($request) use ($nano) {
		$body = $request->post();
		// echo "Request:" . ;
		sendResponse($nano, 'Hello ' . $body->params->name . ' from PHP!');
    }
);

// Event handler
$nano->get(
    '/events/sample.event.happened',
    function ($request) use ($nano) {
		echo('Sample event happened.');
		$nano->response->code(200);
    }
);


// Start nano
$nano->start();

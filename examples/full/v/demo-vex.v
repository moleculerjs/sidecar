module main

import nedpals.vex.server
import nedpals.vex.ctx

fn main() {
	mut s := server.new()

	s.get('/greet/:name', fn (req ctx.Req, mut res ctx.Resp) {
		name := req.params['name']
		res.send('Hello, $name!', 200)
	})
	println('Starting server listening on port 5005...')
	s.serve(5005)
}

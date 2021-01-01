module main

//import net.http
//import json
//import sync

import watchmen123456.valval

struct ActionRequestParam {
	name string
}

struct ActionRequest {
	params ActionRequestParam
}
/*
fn worker_fetch(p &sync.PoolProcessor, cursor int, worker_id int) voidptr {
	id := p.get_int_item(cursor)
	resp := http.get('https://hacker-news.firebaseio.com/v0/item/${id}.json') or {
		println('failed to fetch data from /v0/item/${id}.json')
		return sync.no_result
	}
	story := json.decode(Story,resp.text) or {
		println('failed to decode a story')
		return sync.no_result
	}
	println('# $cursor) $story.title | $story.url')
	return sync.no_result
}*/

fn hello(req valval.Request) valval.Response {
	return valval.response_ok('hello world')
}

// Fetches top HN stories in parallel, depending on how many cores you have
fn main() {
	/*resp := http.post('https://hacker-news.firebaseio.com/v0/topstories.json') or {
		println('failed to fetch data from /v0/topstories.json')
		return
	}
	mut ids := json.decode([]int,resp.text) or {
		println('failed to decode topstories.json')
		return
	}
	if ids.len > 10 {
		ids = ids[0..10]
	}
	mut fetcher_pool := sync.new_pool_processor({
		callback: worker_fetch
	})
	// NB: if you do not call set_max_jobs, the pool will try to use an optimal
	// number of threads, one per each core in your system, which in most
	// cases is what you want anyway... You can override the automatic choice
	// by setting the VJOBS environment variable too.
	// fetcher_pool.set_max_jobs( 4 )
	fetcher_pool.work_on_items_i(ids)
	*/

	mut app := valval.new_app(true)
	app.route('/', hello)
	valval.runserver(app, 8012)
}

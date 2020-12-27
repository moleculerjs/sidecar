module main

//import os
import net.http
import json

const (
	stories_url = 'https://hacker-news.firebaseio.com/v0/topstories.json'
	item_url_base = 'https://hacker-news.firebaseio.com/v0/item'
)

struct Story {
    title string
}

fn main() {
    mut resp := http.get(stories_url)?
    ids := json.decode([]int, resp.text)?
    mut cursor := 0
    for _ in 0..8 {
        go fn() {
            for {
				mut id := 0
                lock {
                    if cursor >= ids.len {
                        break
                    }
                    id = ids[cursor]
                    cursor++
                }
                resp = http.get('$item_url_base/$id.json')?
                story := json.decode(Story, resp.text)?
                println(story.title)
            }
        }()
    }
    runtime.wait()
}

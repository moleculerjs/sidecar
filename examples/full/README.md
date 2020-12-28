# Moleculer Sidecar Example (full)

This example demonstrates the Moleculer Sidecar polyglot microservices functionality. It starts a Sidecar container and external service containers:

- **Python**: Flask v1.1.2
- **PHP**: Mark v1.1
- **Go**: Fiber v2.3.0
- **Rust**: Actix v3

>I'm not familiar with these languages & frameworks, I've just copy-pasted the examples from the Internet :) If you have knowledge and you can improve them, please send a PR.

## Start

```bash
docker-compose up -d --build
```

### Registered actions
```
mol $ actions -i
╔═════════════════════╤═══════╤══════════╤════════╤════════╗
║ Action              │ Nodes │ State    │ Cached │ Params ║
╟─────────────────────┼───────┼──────────┼────────┼────────╢
║ go-demo.hello       │     1 │    OK    │   No   │        ║
║ go-demo.welcome     │     1 │    OK    │   No   │ name   ║
╟─────────────────────┼───────┼──────────┼────────┼────────╢
║ php-demo.hello      │     1 │    OK    │   No   │        ║
║ php-demo.welcome    │     1 │    OK    │   No   │ name   ║
╟─────────────────────┼───────┼──────────┼────────┼────────╢
║ python-demo.hello   │     1 │    OK    │   No   │        ║
║ python-demo.welcome │     1 │    OK    │   No   │ name   ║
╟─────────────────────┼───────┼──────────┼────────┼────────╢
║ rust-demo.hello     │     1 │    OK    │   No   │        ║
║ rust-demo.welcome   │     1 │    OK    │   No   │ name   ║
╚═════════════════════╧═══════╧══════════╧════════╧════════╝
```

### Test
**Start a Moleculer CLI instance**
```bash
moleculer connect nats://localhost:4222
```

**Call `python-demo` service**
```bash
call python-demo.hello
call python-demo.welcome --name Moleculer
```

**Call `go-demo` service**
```bash
call go-demo.hello
call go-demo.welcome --name Moleculer
```

**Call `php-demo` service**
```bash
call php-demo.hello
call php-demo.welcome --name Moleculer
```

**Emitting an events** (all services are listening it)
```bash
broadcast sample-event
```

## Stop
```bash
docker-compose down -v
```

# Moleculer Sidecar Example (full)

This example demonstrates the Moleculer Sidecar polyglot microservices functionality. It starts a Sidecar container and external service containers:

- **Ballerina**: v1.2.12
- **Crystal**: v1.0.0
- **Deno**: Oak v6.4.1
- **Go**: Fiber v2.3.0
- **PHP**: Mark v1.1
- **Python**: Flask v1.1.2
- **Ruby**: Sinatra v2.1.0
- **Rust**: Actix v3
- **Swift**: Perfect v3.0.0

>I'm not familiar with these languages & frameworks, I've just copy-pasted the examples from the Internet :) If you have better knowledge and you can improve them, please send a PR.

## Start

```bash
docker-compose up -d --build
```

### Registered actions
```
mol $ actions -i
╔════════════════════════╤═══════╤══════════╤════════╤════════╗
║ Action                 │ Nodes │ State    │ Cached │ Params ║
╟────────────────────────┼───────┼──────────┼────────┼────────╢
║ ballerina-demo.hello   │     1 │    OK    │   No   │        ║
║ ballerina-demo.welcome │     1 │    OK    │   No   │ name   ║
╟────────────────────────┼───────┼──────────┼────────┼────────╢
║ crystal-demo.hello     │     1 │    OK    │   No   │        ║
║ crystal-demo.welcome   │     1 │    OK    │   No   │ name   ║
╟────────────────────────┼───────┼──────────┼────────┼────────╢
║ deno-demo.hello        │     1 │    OK    │   No   │        ║
║ deno-demo.welcome      │     1 │    OK    │   No   │ name   ║
╟────────────────────────┼───────┼──────────┼────────┼────────╢
║ go-demo.hello          │     1 │    OK    │   No   │        ║
║ go-demo.welcome        │     1 │    OK    │   No   │ name   ║
╟────────────────────────┼───────┼──────────┼────────┼────────╢
║ php-demo.hello         │     1 │    OK    │   No   │        ║
║ php-demo.welcome       │     1 │    OK    │   No   │ name   ║
╟────────────────────────┼───────┼──────────┼────────┼────────╢
║ python-demo.hello      │     1 │    OK    │   No   │        ║
║ python-demo.welcome    │     1 │    OK    │   No   │ name   ║
╟────────────────────────┼───────┼──────────┼────────┼────────╢
║ ruby-demo.hello        │     1 │    OK    │   No   │        ║
║ ruby-demo.welcome      │     1 │    OK    │   No   │ name   ║
╟────────────────────────┼───────┼──────────┼────────┼────────╢
║ rust-demo.hello        │     1 │    OK    │   No   │        ║
║ rust-demo.welcome      │     1 │    OK    │   No   │ name   ║
╟────────────────────────┼───────┼──────────┼────────┼────────╢
║ swift-demo.hello       │     1 │    OK    │   No   │        ║
║ swift-demo.welcome     │     1 │    OK    │   No   │ name   ║
╚════════════════════════╧═══════╧══════════╧════════╧════════╝
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
broadcast sample.event
```

## Stop
```bash
docker-compose down -v
```

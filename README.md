![Moleculer logo](http://moleculer.services/images/banner.png)

![Integration Test](https://github.com/moleculerjs/sidecar/workflows/Integration%20Test/badge.svg)

# [WIP] Moleculer Sidecar
Moleculer Sidecar is a Moleculer module to allow using external services (written in other programming languages which is not supported officially) in a Moleculer microservices project. The Sidecar is a HTTP server which gives a REST interface to communicate other Moleculer services instead of implementing the full Moleculer protocol és Service Registry & Discovery features. Sidecar is a full-fledged MoleculerJS node with all features (e.g. parameter validation, retries, fallback, timeout...etc), it means in the external services, you don't need to implement them because Sidecar manage them.

## Features
- write services any programming languages (which have http server & client support)
- bundled to executable, no need to install Node.js environment for running.
- contains all official transporter, cacher, discoverer, serializer libraries
- easy to add to any Docker image
- official Docker image, use it as a Sidecar pod container in Kubernetes cluster

## Install

### Docker
**Simple start**
```bash
docker run -p 5103:5103 moleculer/sidecar
```

**Start with REPL mode**
```bash
docker run --it -p 5103:5103 moleculer/sidecar --repl
```

**Start with config file**
```bash
docker run -v /my-folder/moleculer.config.js:/sidecar/moleculer.config.js moleculer/sidecar --config
```

## Usage (via HTTP interface)
The ServiceBroker inside the Sidecar can be configured via `moleculer.config.js` file or environment variables. The Sidecar HTTP server is listening on port 5103 (by default). _(Why 5103? To make it easier to remember: SIDE = S->5 I->1 D->0 E->3 = 5103)._ If you don't like it, you can change it with `SIDECAR_PORT` environment variable.

### Register an external service
The request body should contains one or more service schema where the action/event handlers should be an URL what points to the external service HTTP endpoint. In the Service schema you can use all MoleculerJS features (e.g. parameter validation, metrics, tracing, bulkhead, timeout, retries ...etc), they are handled by the Sidecar.
```
POST /v1/registry/services
```

**Request body**
```js
{
    name: "posts",
    version: 1,

    settings: {
        // It means, your HTTP server running on port 5000 and sidecar can reach it on `localhost`
        // The URLs in action/event handlers contains relative URL.
        baseUrl: "http://localhost:5000"
    },

    actions: {
        list: {
            params: {
                limit: "number",
                offset: "number"
            },
            // Shorthand handler URL what will be called by sidecar
            handler: "/actions/posts/list"
        }
    },

    events: {
        "user.created": {
            // Shorthand handler URL what will be called by sidecar
            handler: "/events/user.created"
        }
    }
}
```

### Call a service

Calling `comments.create` service action.
```
POST /v1/call/comments.create
```

**Request body**
```js
{
    // Context params
    params: {
        title: "Lorem ipsum",
        content: "Lorem ipsum dolor sit amet..."
    },
    // Context meta
    meta: {
        user: {
            id: 12345
        }
    },
    // Calling options
    options: {
        timeout: 3000
    }
}
```

**Response body** 
```js
{
    // Response data
    response: {
        id: 1,
        title: "Lorem ipsum",
        content: "Lorem ipsum dolor sit amet..."
    },
    // Optional: Context meta if you changed the content.
    meta: {
        user: {
            id: 12345
        }
    }
}
```

**Error response body**
```js
{
    error: {
        name: "MoleculerClientError",
        code: 422,
        type: "VALIDATION_ERROR",
        message: "Title is required",
        data: {
            action: "comments.create",
            params: {
                title: null
            }
        }
    }
}
```

### Emit an event

Emit a `post.created` event.
```
POST /v1/emit/post.created
```

In case of broadcast use the following URL:
```
POST /broadcast/post.created
```

**Request body**
```js
{
    // Context params
    params: {
        id: 1,
        title: "First post",
        content: "Post content",
        author: 12345
    },
    // Context meta
    meta: {
        user: {
            id: 12345
        }
    },
    // Emit options
    options: {
        groups: "users"
    }
}
```

### Accepting action requests
If your external service implements actions, you should start a HTTP server. Create an endpoint for the action handler and set the address in the service schema. If another services calls your action, the Sidecar sends a POST request to the defined endpoint with the following request body:

**Request body**
```js
{
    // Action name
    action: "posts.list",

    // Caller NodeID
    nodeID: "node-123",

    // Context params
    params: {
        limit: 10,
        offset: 50
    },

    // Context meta
    meta: {
        user: {
            id: 12345
        }
    },

    // Calling options
    options: {
        timeout: 3000
    }
}
```

You should send a response with the following form:

**Response body** 
```js
{
    // Response data
    response: [
        { id: 1, title: "First post" },
        { id: 2, title: "Second post" },
        { id: 3, title: "Third post" }
    ],
    // Optional: Context meta if you changed the content.
    meta: {
        user: {
            id: 12345
        }
    }
}
```

If an error occured during execution, use correct response status code (4xx, 5xx) and send the following as a response body:

**Error response body** 
```js
{
    // Error data
    error: {
        name: "MoleculerClientError",
        code: 400,
        type: "INVALID_INPUT",
        message: "Some user input is not valid",
        data: {
            // Any useful data
            action: "posts.list",
            params: {
                limit: "asd"
            }
        }
    }
}
```

### Accepting events
If you want to subscribe to Moleculer events, you should start a HTTP server. Create an endpoint for the event handler and set the address in the service schema. If the event emitted, the Sidecar sends a POST request to the defined endpoint with the following request body:

**Request body**
```js
{
    // Event name
    event: "user.created",

    // Type of event (emit, broadcast)
    eventType: "emit",

    eventGroups: "posts",

    // Caller NodeID
    nodeID: "node-123",

    // Context params
    params: {
        limit: 10,
        offset: 50
    },

    // Context meta
    meta: {
        user: {
            id: 12345
        }
    }
}
```

### Access the Sidecar's broker registry

List of all Moleculer nodes
```
GET /v1/registry/nodes
```

List of all Moleculer services
```
GET /v1/registry/services
```

List of all Moleculer actions
```
GET /v1/registry/actions
```

List of all Moleculer event subscriptions
```
GET /v1/registry/events
```

### Unregister an external service
You can unregister your service if you call the following endpoint:
```
DELETE /v1/registry/services/:service-full-name
```

**Example**
```
DELETE /v1/registry/services/v1.posts
```

## Example external services

### Go
TODO

### Python
TODO

### Ruby
TODO

### Rust
TODO

### PHP
TODO

### C#
TODO

### C++
TODO

### Delphi
TODO

## Contribution
Please send pull requests improving the usage and fixing bugs, improving documentation and providing better examples, or providing some testing, because these things are important.

## License
The project is available under the [MIT license](https://tldrlegal.com/license/mit-license).

## Contact
Copyright (c) 2020 MoleculerJS

[![@MoleculerJS](https://img.shields.io/badge/github-moleculerjs-green.svg)](https://github.com/moleculerjs) [![@MoleculerJS](https://img.shields.io/badge/twitter-MoleculerJS-blue.svg)](https://twitter.com/MoleculerJS)

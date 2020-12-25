package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

var SIDECAR_ADDRESS = "http://localhost:5103"

func sendResponse(c *fiber.Ctx, content string) error {
	return c.JSON(&fiber.Map{
		"response": content,
	})
}

type RequestParam struct {
	Name string `json:"name"`
}

type RequestBody struct {
	Params RequestParam `json:"params"`
}

func RegisterServiceSchema() {
	fmt.Println("Registering service schema...")
	postBody := `{
		"name": "go-demo",
		"settings": {
			"baseUrl": "http://localhost:5002"
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
			"sample.event.happened": "/events/sample.event.happened"
		}
	}`

	resp, err := http.Post(SIDECAR_ADDRESS+"/v1/registry/services", "application/json", bytes.NewBufferString(postBody))
	if err != nil {
		log.Fatalln(err)
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatalln(err)
	}

	log.Println("Response: " + string(body))

}

func main() {
	app := fiber.New()

	app.Use(cors.New())

	app.Use(func(c *fiber.Ctx) error {
		c.Accepts("application/json")
		return c.Next()
	})

	app.Post("/actions/hello", func(c *fiber.Ctx) error {
		return sendResponse(c, "Hello from Go!")
	})

	app.Post("/actions/welcome", func(c *fiber.Ctx) error {
		body := new(RequestBody)
		c.BodyParser(body)
		return sendResponse(c, "Hello "+body.Params.Name+" from Go!")
	})

	app.Post("events/sample.event.happened", func(c *fiber.Ctx) error {
		fmt.Printf("Sample event happened.")
		return c.SendStatus(200)
	})

	RegisterServiceSchema()

	log.Fatal(app.Listen("0.0.0.0:5002"))
}
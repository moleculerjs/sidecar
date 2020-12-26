package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
	//"github.com/gofiber/fiber/v2/middleware/cors"
)

var sidecarAddress string = os.Getenv("SIDECAR_ADDRESS")

func sendResponse(c *fiber.Ctx, content string) error {
	return c.JSON(&fiber.Map{
		"response": content,
	})
}

type requestParam struct {
	Name string `json:"name"`
}

type requestBody struct {
	Params requestParam `json:"params"`
}

func registerServiceSchema() {
	// var localAddress string = "http://localhost:5002"

	fmt.Printf("Registering service schema (%s)...\n", sidecarAddress)
	postBody := `{
		"name": "go-demo",
		"settings": {
			"baseUrl": "http://192.168.0.243:5002"
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
	}`

	resp, err := http.Post(sidecarAddress+"/v1/registry/services", "application/json", bytes.NewBufferString(postBody))
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
	if sidecarAddress == "" {
		sidecarAddress = "http://localhost:5103"
	}

	app := fiber.New()

	//app.Use(cors.New())

	app.Use(func(c *fiber.Ctx) error {
		c.Accepts("application/json")
		return c.Next()
	})

	app.Post("/actions/hello", func(c *fiber.Ctx) error {
		return sendResponse(c, "Hello from Go!")
	})

	app.Post("/actions/welcome", func(c *fiber.Ctx) error {
		body := new(requestBody)
		c.BodyParser(body)
		return sendResponse(c, "Hello "+body.Params.Name+" from Go!")
	})

	app.Post("events/sample.event", func(c *fiber.Ctx) error {
		fmt.Printf("Sample event happened.")
		return c.SendStatus(200)
	})

	registerServiceSchema()

	log.Fatal(app.Listen("0.0.0.0:5002"))
}

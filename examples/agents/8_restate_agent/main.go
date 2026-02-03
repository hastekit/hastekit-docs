package main

import (
	"log"
	"net/http"
	"os"

	hastekit "github.com/hastekit/hastekit-sdk-go"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway/llm"
)

func main() {
	client, err := hastekit.New(&hastekit.ClientOptions{
		ProviderConfigs: []gateway.ProviderConfig{
			{
				ProviderName:  llm.ProviderNameOpenAI,
				BaseURL:       "",
				CustomHeaders: nil,
				ApiKeys: []*gateway.APIKeyConfig{
					{
						Name:   "Key 1",
						APIKey: os.Getenv("OPENAI_API_KEY"),
					},
				},
			},
		},
		RestateConfig: hastekit.RestateConfig{
			Endpoint: "http://localhost:8081",
		},
		RedisConfig: hastekit.RedisConfig{
			Endpoint: "localhost:6379",
		},
	})
	if err != nil {
		log.Fatal(err)
	}

	model := client.NewLLM(hastekit.LLMOptions{
		Provider: llm.ProviderNameOpenAI,
		Model:    "gpt-4.1-mini",
	})

	history := client.NewConversationManager()
	agentName := "SampleAgent"
	_ = client.NewRestateAgent(&hastekit.AgentOptions{
		Name:        agentName,
		Instruction: client.Prompt("You are helpful assistant. You are interacting with the user named {{name}}"),
		LLM:         model,
		History:     history,
	})

	client.StartRestateService("0.0.0.0", "9081") // Do this on the restate service
	err = http.ListenAndServe(":8070", client)    // Do this on the application that invokes the restate workflow
	if err != nil {
		log.Fatal(err)
	}
}

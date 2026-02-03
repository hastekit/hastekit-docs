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
	_ = client.NewAgent(&hastekit.AgentOptions{
		Name:        agentName,
		Instruction: client.Prompt("You are helpful assistant."),
		LLM:         model,
		History:     history,
	})

	http.ListenAndServe(":8070", client)

	// You can then invoke by hitting POST http://localhost:8070/?agent=SampleAgent with `agents.AgentInput` as your payload
	/*
		  curl -X POST "http://localhost:8070/?agent=SampleAgent" \
		  -H "Content-Type: application/json" \
		  -d '{
			"messages": [
			  {
				"role": "user",
				"content": "Hello!"
			  }
			]
		  }'
	*/
}

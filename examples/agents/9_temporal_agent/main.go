package main

import (
	"log"
	"net/http"
	"os"

	hastekit "github.com/hastekit/hastekit-sdk-go"
	"github.com/hastekit/hastekit-sdk-go/pkg/agents"
	"github.com/hastekit/hastekit-sdk-go/pkg/agents/tools"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway/llm"
)

func main() {
	client, err := hastekit.NewWithOptions(
		hastekit.WithProviderConfigs(gateway.ProviderConfig{
			ProviderName:  llm.ProviderNameOpenAI,
			BaseURL:       "",
			CustomHeaders: nil,
			ApiKeys: []*gateway.APIKeyConfig{
				{
					Name:   "Key 1",
					APIKey: os.Getenv("OPENAI_API_KEY"),
				},
			},
		}),
		hastekit.WithTemporalConfig("0.0.0.0:7233"),
		hastekit.WithRedisConfig("localhost:6379"),
	)
	if err != nil {
		log.Fatal(err)
	}

	model := client.NewLLM(hastekit.LLMOptions{
		Provider: llm.ProviderNameOpenAI,
		Model:    "gpt-4.1-mini",
	})

	history := client.NewConversationManager()
	agentName := "SampleAgent"
	_ = client.NewTemporalAgent(&hastekit.AgentOptions{
		Name:        agentName,
		Instruction: client.Prompt("You are helpful assistant. You are interacting with the user named {{name}}"),
		LLM:         model,
		History:     history,
		Tools: []agents.Tool{
			tools.NewAgentTool(
				"joke-generator-agent",
				"Use to generate jokes",
				client.NewTemporalAgent(&hastekit.AgentOptions{
					Name:        "joke-generator",
					Instruction: client.Prompt("You are helpful assistant."),
					LLM:         model,
					History:     client.NewConversationManager(),
				}),
				tools.SubAgentContextModeNone,
			),
		},
	})

	go client.StartTemporalService()           // Do this on the temporal service
	err = http.ListenAndServe(":8070", client) // Do this on the application that invokes the temporal workflow
	if err != nil {
		log.Fatal(err)
	}
}

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
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway/llm/responses"
	"github.com/hastekit/hastekit-sdk-go/pkg/utils"
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
		TemporalConfig: hastekit.TemporalConfig{
			Endpoint: "0.0.0.0:7233",
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
	_ = client.NewTemporalAgent(&hastekit.AgentOptions{
		Name:        agentName,
		Instruction: client.Prompt("You are helpful assistant. You are interacting with the user named {{name}}"),
		LLM:         model,
		History:     history,
		Tools: []agents.Tool{
			tools.NewAgentTool(&responses.ToolUnion{
				OfFunction: &responses.FunctionTool{
					Name:        "joke-generator-agent",
					Description: utils.Ptr("Use to generate jokes"),
					Parameters: map[string]any{
						"type":     "object",
						"required": []string{"message"},
						"properties": map[string]any{
							"message": map[string]any{
								"type":        "string",
								"description": "Message for the agent",
							},
						},
						"additionalProperties": false,
					},
				},
			}, client.NewTemporalAgent(&hastekit.AgentOptions{
				Name:        "joke-generator",
				Instruction: client.Prompt("You are helpful assistant."),
				LLM:         model,
				History:     client.NewConversationManager(),
			})),
		},
	})

	go client.StartTemporalService()           // Do this on the temporal service
	err = http.ListenAndServe(":8070", client) // Do this on the application that invokes the temporal workflow
	if err != nil {
		log.Fatal(err)
	}
}

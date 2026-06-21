package main

import (
	"context"
	"log"
	"net/http"
	"os"

	hastekit "github.com/hastekit/hastekit-sdk-go"
	"github.com/hastekit/hastekit-sdk-go/pkg/agents"
	"github.com/hastekit/hastekit-sdk-go/pkg/agents/mcpclient"
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
		hastekit.WithRestateConfig("http://localhost:8081"),
		hastekit.WithRedisConfig("localhost:6379"),
	)
	if err != nil {
		log.Fatal(err)
	}

	model := client.NewLLM(hastekit.LLMOptions{
		Provider: llm.ProviderNameOpenAI,
		Model:    "gpt-4.1-mini",
	})

	mcpClient, err := mcpclient.NewClient(context.Background(), "http://127.0.0.1:8000/mcp",
		mcpclient.WithTransport("streamable-http"),
	)
	if err != nil {
		log.Fatal(err)
	}

	history := client.NewConversationManager()
	agentName := "SampleAgent"
	_ = client.NewRestateAgent(&hastekit.AgentOptions{
		Name:        agentName,
		Instruction: client.Prompt("You are helpful assistant. You are interacting with the user named {{name}}"),
		LLM:         model,
		History:     history,
		Tools: []agents.Tool{
			tools.NewAgentTool(
				"joke-generator-agent",
				"Use to generate jokes",
				client.NewRestateAgent(&hastekit.AgentOptions{
					Name:        "joke-generator",
					Instruction: client.Prompt("You are helpful assistant."),
					LLM:         model,
					History:     client.NewConversationManager(),
				}),
				tools.SubAgentContextModeNone,
			),
		},
		McpServers: []agents.MCPToolset{mcpClient},
	})

	go client.StartRestateService("0.0.0.0", "9081") // Do this on the restate service
	err = http.ListenAndServe(":8070", client)       // Do this on the application that invokes the restate workflow
	if err != nil {
		log.Fatal(err)
	}
}

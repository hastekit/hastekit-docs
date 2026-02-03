package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/bytedance/sonic"
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
	})
	if err != nil {
		log.Fatal(err)
	}

	model := client.NewLLM(hastekit.LLMOptions{
		Provider: llm.ProviderNameOpenAI,
		Model:    "gpt-4.1-mini",
	})

	agentTool := tools.NewAgentTool(&responses.ToolUnion{
		OfFunction: &responses.FunctionTool{
			Name:        "get_user_name",
			Description: utils.Ptr("Returns the user's name"),
			Parameters: map[string]any{
				"type": "object",
				"properties": map[string]any{
					"user_id": map[string]any{
						"type":        "string",
						"description": "The user ID to look up",
					},
				},
				"required": []string{"user_id"},
			},
		},
	}, client.NewAgent(&hastekit.AgentOptions{
		Name:        "Hello world agent",
		Instruction: client.Prompt("You are helpful assistant."),
		LLM:         model,
	}))

	agent := client.NewAgent(&hastekit.AgentOptions{
		Name:        "Hello world agent",
		Instruction: client.Prompt("You are helpful assistant."),
		LLM:         model,
		Tools:       []agents.Tool{agentTool},
	})

	out, err := agent.Execute(context.Background(), &agents.AgentInput{
		Messages: []responses.InputMessageUnion{
			responses.UserMessage("Hello!"),
		},
	})
	if err != nil {
		log.Fatal(err)
	}

	b, _ := sonic.Marshal(out)
	fmt.Println(string(b))
}

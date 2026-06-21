package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/bytedance/sonic"
	hastekit "github.com/hastekit/hastekit-sdk-go"
	"github.com/hastekit/hastekit-sdk-go/pkg/agents"
	"github.com/hastekit/hastekit-sdk-go/pkg/agents/history"
	"github.com/hastekit/hastekit-sdk-go/pkg/agents/tools"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway/llm"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway/llm/responses"
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
		hastekit.WithServerConfig("https://app.hastekit.ai", "", "", ""),
	)
	if err != nil {
		log.Fatal(err)
	}

	model := client.NewLLM(hastekit.LLMOptions{
		Provider: llm.ProviderNameOpenAI,
		Model:    "gpt-4.1-mini",
	})

	hist := client.NewConversationManager()
	agent := agents.NewAgent(&agents.AgentOptions{
		Name:        "hello-world-agent",
		Instruction: client.Prompt("You are a helpful assistant with access to terminal (bash)"),
		LLM:         model,
		History:     hist,
		Tools: []agents.Tool{
			tools.NewBashTool(client.NewSandboxManager(), "praveenraj9495/hastekit-ai-sandbox:latest", map[string]string{}),
		},
	})

	handle, err := agent.Execute(context.Background(), &agents.AgentInput{
		Message: history.Message{
			Messages: []responses.InputMessageUnion{
				responses.UserMessage("What is the current time?"),
			},
		},
		Namespace:         "default",
		ThreadID:          "",
		PreviousMessageID: "",
	})
	if err != nil {
		log.Fatal(err)
	}
	out, err := handle.Result()
	if err != nil {
		log.Fatal(err)
	}

	b, _ := sonic.Marshal(out)
	fmt.Println(string(b))
}

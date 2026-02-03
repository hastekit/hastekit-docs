package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/bytedance/sonic"
	"github.com/hastekit/hastekit-ai-gateway/pkg/agent-gateway/sandbox/docker_sandbox"
	sandbox_tool "github.com/hastekit/hastekit-ai-gateway/pkg/agent-gateway/sandbox/sandbox-tool"
	hastekit "github.com/hastekit/hastekit-sdk-go"
	"github.com/hastekit/hastekit-sdk-go/pkg/agents"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway/llm"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway/llm/responses"
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
	agent := agents.NewAgent(&agents.AgentOptions{
		Name:        "hello-world-agent",
		Instruction: client.Prompt("You are a helpful assistant with access to terminal (bash)"),
		LLM:         model,
		History:     history,
		Tools: []agents.Tool{
			sandbox_tool.NewSandboxTool(docker_sandbox.NewManager(docker_sandbox.Config{
				AgentDataPath: "/Users/praveen/amagi/uno/temp",
			}), "uno-sandbox:v7"),
		},
	})

	out, err := agent.Execute(context.Background(), &agents.AgentInput{
		Messages: []responses.InputMessageUnion{
			responses.UserMessage("What is the current time?"),
		},
		Namespace:         "default",
		PreviousMessageID: "",
	})
	if err != nil {
		log.Fatal(err)
	}

	b, _ := sonic.Marshal(out)
	fmt.Println(string(b))
}

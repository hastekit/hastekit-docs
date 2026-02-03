package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/bytedance/sonic"
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
		Name:        "Hello world agent",
		Instruction: client.Prompt("You are helpful assistant."),
		LLM:         model,
		History:     history,
	})

	out, err := agent.Execute(context.Background(), &agents.AgentInput{
		Namespace: "default",
		Messages: []responses.InputMessageUnion{
			responses.UserMessage("Hello! My name is Alice"),
		},
	})
	if err != nil {
		log.Fatal(err)
	}

	b, _ := sonic.Marshal(out)
	fmt.Println(string(b))

	// Agent itself is stateless - you can either re-create another agent or reuse the same agent instance, but ensure to pass the correct `PreviousMessageID`
	agent2 := client.NewAgent(&hastekit.AgentOptions{
		Name:        "Hello world agent",
		Instruction: client.Prompt("You are helpful assistant."),
		LLM:         model,
		History:     history,
	})

	out, err = agent2.Execute(context.Background(), &agents.AgentInput{
		Namespace:         "default",
		PreviousMessageID: out.RunID,
		Messages: []responses.InputMessageUnion{
			responses.UserMessage("What's my name?"),
		},
	})
	if err != nil {
		log.Fatal(err)
	}

	b, _ = sonic.Marshal(out)
	fmt.Println(string(b))
}

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

	agent1 := client.NewAgent(&hastekit.AgentOptions{
		Name:        "JokeAgent",
		Instruction: client.Prompt("You are joke teller"),
		LLM:         model,
		History:     client.NewConversationManager(),
	})

	agent2 := client.NewAgent(&hastekit.AgentOptions{
		Name:        "FactAgent",
		Instruction: client.Prompt("You are a fact teller"),
		LLM:         model,
		History:     client.NewConversationManager(),
	})

	routerAgent := client.NewAgent(&hastekit.AgentOptions{
		Name:        "RouterAgent",
		Instruction: client.Prompt("You are router agent. You must not respond directly. Your role is only to delegate to other agents"),
		LLM:         model,
		Handoffs: []*agents.Handoff{
			agents.NewHandoff(agent1.Name, "Use this agent to generate jokes", agent1),
			agents.NewHandoff(agent2.Name, "Use this agent to generate facts", agent2),
		},
		History: client.NewConversationManager(),
	})

	out, err := routerAgent.Execute(context.Background(), &agents.AgentInput{
		Messages: []responses.InputMessageUnion{
			responses.UserMessage("Hello! Tell me a joke about universe"),
		},
	})
	if err != nil {
		log.Fatal(err)
	}

	b, _ := sonic.Marshal(out)
	fmt.Println(string(b))
}

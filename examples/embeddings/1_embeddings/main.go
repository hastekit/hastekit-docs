package main

import (
	"context"
	"fmt"
	"log"
	"os"

	json "github.com/bytedance/sonic"
	hastekit "github.com/hastekit/hastekit-sdk-go"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway/llm"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway/llm/embeddings"
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
			{
				ProviderName:  llm.ProviderNameGemini,
				BaseURL:       "",
				CustomHeaders: nil,
				ApiKeys: []*gateway.APIKeyConfig{
					{
						Name:   "Key 1",
						APIKey: os.Getenv("GEMINI_API_KEY"),
					},
				},
			},
		},
	})

	if err != nil {
		log.Fatal(err)
	}

	//model := client.NewLLM(hastekit.LLMOptions{
	//	Provider: llm.ProviderNameOpenAI,
	//	Model:    "text-embedding-ada-002",
	//})

	model := client.NewLLM(hastekit.LLMOptions{
		Provider: llm.ProviderNameGemini,
		Model:    "models/gemini-embedding-001",
	})

	resp, err := model.NewEmbedding(context.Background(), &embeddings.Request{
		Input: embeddings.InputUnion{
			OfString: utils.Ptr("The food was delicious and the waiter..."),
		},
	})
	if err != nil {
		log.Fatal(err)
	}

	b, _ := json.Marshal(resp)
	fmt.Println(string(b))
}

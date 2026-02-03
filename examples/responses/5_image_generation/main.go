package main

import (
	"context"
	"fmt"
	"log"
	"os"

	hastekit "github.com/hastekit/hastekit-sdk-go"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway/llm"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway/llm/constants"
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

	stream, err := model.NewStreamingResponses(
		context.Background(),
		&responses.Request{
			Input: responses.InputUnion{
				OfInputMessageList: responses.InputMessageList{
					{
						OfEasyInput: &responses.EasyMessage{
							Role: constants.RoleUser,
							Content: responses.EasyInputContentUnion{
								OfString: utils.Ptr("Generate an image of a sunset"),
							},
						},
					},
				},
			},
			Tools: []responses.ToolUnion{
				{
					OfImageGeneration: &responses.ImageGenerationTool{},
				},
			},
		},
	)
	if err != nil {
		log.Fatal(err)
	}

	for chunk := range stream {
		if chunk.OfOutputItemDone != nil {
			if chunk.OfOutputItemDone.Item.Type == "image_generation_call" {
				fmt.Println(chunk.OfOutputItemDone.Item.Result)
			}
		}
	}
}

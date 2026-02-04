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

	stream, err := client.NewStreamingResponses(
		context.Background(),
		&responses.Request{
			Model: "OpenAI/gpt-4.1-mini",
			Input: responses.InputUnion{
				OfInputMessageList: responses.InputMessageList{
					{
						OfEasyInput: &responses.EasyMessage{
							Role: constants.RoleUser,
							Content: responses.EasyInputContentUnion{
								OfString: utils.Ptr("What are the latest AI news?"),
							},
						},
					},
				},
			},
			Tools: []responses.ToolUnion{
				{
					OfWebSearch: &responses.WebSearchTool{},
				},
			},
		},
	)
	if err != nil {
		log.Fatal(err)
	}

	for chunk := range stream {
		if chunk.OfOutputTextAnnotationAdded != nil {
			fmt.Println(chunk.OfOutputTextAnnotationAdded.Annotation)
		}

		if chunk.OfOutputItemDone != nil {
			if chunk.OfOutputItemDone.Item.Type == "web_search_call" {
				fmt.Println(chunk.OfOutputItemDone.Item.Action.OfSearch)
			}
		}
	}
}

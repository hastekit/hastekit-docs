package main

import (
	"context"
	"fmt"
	"log"
	"os"

	hastekit "github.com/hastekit/hastekit-sdk-go"
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

	stream, err := client.NewStreamingResponses(
		context.Background(),
		&responses.Request{
			Model:        "OpenAI/o4-mini",
			Instructions: utils.Ptr("You are helpful assistant. Reason before answering."),
			Input: responses.InputUnion{
				OfString: utils.Ptr("If 2+4=6, what would be 22+44=?"),
			},
			Parameters: responses.Parameters{
				Reasoning: &responses.ReasoningParam{
					Summary: utils.Ptr("detailed"),
				},
				Include: []responses.Includable{
					responses.IncludableReasoningEncryptedContent,
				},
			},
		},
	)
	if err != nil {
		log.Fatal(err)
	}

	reasoningTxt := ""
	for chunk := range stream {
		switch chunk.ChunkType() {
		case "response.reasoning_summary_text.delta":
			reasoningTxt += chunk.OfReasoningSummaryTextDelta.Delta
		}
	}

	fmt.Println(reasoningTxt)
}

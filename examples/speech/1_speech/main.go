package main

import (
	"context"
	"log"
	"os"

	hastekit "github.com/hastekit/hastekit-sdk-go"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway/llm"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway/llm/speech"
	"github.com/hastekit/hastekit-sdk-go/pkg/utils"
)

func main() {
	// Initialize SDK client
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

	// Generate speech
	resp, err := client.NewSpeech(context.Background(), &speech.Request{
		Model:          "OpenAI/tts-1",
		Input:          "Hello! This is a text-to-speech example using HasteKit SDK.",
		Voice:          "alloy",
		ResponseFormat: utils.Ptr("mp3"),
	})
	if err != nil {
		log.Fatal(err)
	}

	// Save audio file
	err = os.WriteFile("output.mp3", resp.Audio, 0644)
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("Audio generated successfully! Size: %d bytes, Type: %s\n",
		len(resp.Audio), resp.ContentType)
}

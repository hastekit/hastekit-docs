package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/bytedance/sonic"
	"github.com/google/uuid"
	hastekit "github.com/hastekit/hastekit-sdk-go"
	"github.com/hastekit/hastekit-sdk-go/pkg/agents"
	"github.com/hastekit/hastekit-sdk-go/pkg/agents/agentstate"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway/llm"
	"github.com/hastekit/hastekit-sdk-go/pkg/gateway/llm/responses"
	"github.com/hastekit/hastekit-sdk-go/pkg/utils"
)

// GetUserTool - runs immediately (no approval needed)
type GetUserTool struct {
	*agents.BaseTool
}

func NewGetUserTool() *GetUserTool {
	return &GetUserTool{
		BaseTool: &agents.BaseTool{
			RequiresApproval: false,
			ToolUnion: responses.ToolUnion{
				OfFunction: &responses.FunctionTool{
					Name:        "get_user",
					Description: utils.Ptr("Gets user information"),
					Parameters: map[string]any{
						"type": "object",
						"properties": map[string]any{
							"user_id": map[string]any{"type": "string"},
						},
						"required": []string{"user_id"},
					},
				},
			},
		},
	}
}

func (t *GetUserTool) Execute(ctx context.Context, params *agents.ToolCall) (*responses.FunctionCallOutputMessage, error) {
	return &responses.FunctionCallOutputMessage{
		ID:     params.ID,
		CallID: params.CallID,
		Output: responses.FunctionCallOutputContentUnion{
			OfString: utils.Ptr(`{"name": "John Doe", "email": "john@example.com"}`),
		},
	}, nil
}

// DeleteUserTool - requires approval
type DeleteUserTool struct {
	*agents.BaseTool
}

func NewDeleteUserTool() *DeleteUserTool {
	return &DeleteUserTool{
		BaseTool: &agents.BaseTool{
			RequiresApproval: true, // Human approval required
			ToolUnion: responses.ToolUnion{
				OfFunction: &responses.FunctionTool{
					Name:        "delete_user",
					Description: utils.Ptr("Permanently deletes a user account"),
					Parameters: map[string]any{
						"type": "object",
						"properties": map[string]any{
							"user_id": map[string]any{"type": "string"},
						},
						"required": []string{"user_id"},
					},
				},
			},
		},
	}
}

func (t *DeleteUserTool) Execute(ctx context.Context, params *agents.ToolCall) (*responses.FunctionCallOutputMessage, error) {
	args := map[string]any{}
	json.Unmarshal([]byte(params.Arguments), &args)

	return &responses.FunctionCallOutputMessage{
		ID:     params.ID,
		CallID: params.CallID,
		Output: responses.FunctionCallOutputContentUnion{
			OfString: utils.Ptr(fmt.Sprintf("User %s has been deleted", args["user_id"])),
		},
	}, nil
}

func main() {
	ctx := context.Background()

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

	agent := client.NewAgent(&hastekit.AgentOptions{
		Name:        "User Manager",
		Instruction: client.Prompt("You help manage user accounts."),
		LLM: client.NewLLM(hastekit.LLMOptions{
			Provider: llm.ProviderNameOpenAI,
			Model:    "gpt-4o-mini",
		}),
		Tools: []agents.Tool{
			NewGetUserTool(),
			NewDeleteUserTool(),
		},
		History: client.NewConversationManager(),
	})

	// First execution - agent may request to delete a user
	result, err := agent.Execute(ctx, &agents.AgentInput{
		Namespace: "default",
		Messages: []responses.InputMessageUnion{
			responses.UserMessage("Delete user 123"),
		},
	})
	if err != nil {
		log.Fatal(err)
	}

	// Check if approval is needed
	if result.Status == agentstate.RunStatusPaused {
		fmt.Println("Approval required for:", result.PendingApprovals)

		// Simulate user approval
		approvalResponse := responses.InputMessageUnion{
			OfFunctionCallApprovalResponse: &responses.FunctionCallApprovalResponseMessage{
				ID:              uuid.NewString(),
				ApprovedCallIds: []string{result.PendingApprovals[0].CallID},
				RejectedCallIds: []string{},
			},
		}

		// Resume with approval
		result, err = agent.Execute(ctx, &agents.AgentInput{
			Namespace:         "default",
			PreviousMessageID: result.RunID,
			Messages:          []responses.InputMessageUnion{approvalResponse},
		})
	}

	if err != nil {
		log.Fatal(err)
	}

	buf, _ := sonic.Marshal(result.Output)
	fmt.Println("Final result:", string(buf))
}

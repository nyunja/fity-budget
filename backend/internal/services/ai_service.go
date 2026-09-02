package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"
)

const defaultOpenRouterModel = "nvidia/nemotron-3-super-120b-a12b:free"

type openRouterMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type openRouterRequest struct {
	Model       string              `json:"model"`
	Messages    []openRouterMessage `json:"messages"`
	MaxTokens   int                 `json:"max_tokens"`
	Temperature float64             `json:"temperature"`
}

type openRouterResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

// GenerateFinancialInsight calls OpenRouter (cheap/free models) with the given
// prompt. Returns an error when no API key is configured or the call fails.
func GenerateFinancialInsight(prompt string) (string, error) {
	apiKey := os.Getenv("OPENROUTER_API_KEY")
	if apiKey == "" || apiKey == "your-openrouter-key" {
		return "", errors.New("OPENROUTER_API_KEY not configured")
	}

	model := os.Getenv("OPENROUTER_MODEL")
	if model == "" {
		model = defaultOpenRouterModel
	}

	payload, err := json.Marshal(openRouterRequest{
		Model: model,
		Messages: []openRouterMessage{
			{Role: "system", Content: "You are a helpful personal finance assistant for a budgeting app. Keep answers under 3 sentences, professional but friendly."},
			{Role: "user", Content: prompt},
		},
		MaxTokens:   150,
		Temperature: 0.7,
	})
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest(http.MethodPost, "https://openrouter.ai/api/v1/chat/completions", bytes.NewReader(payload))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var body openRouterResponse
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return "", err
	}
	if body.Error != nil {
		return "", fmt.Errorf("openrouter: %s", body.Error.Message)
	}
	if len(body.Choices) == 0 || body.Choices[0].Message.Content == "" {
		return "", errors.New("openrouter: empty response")
	}

	return body.Choices[0].Message.Content, nil
}

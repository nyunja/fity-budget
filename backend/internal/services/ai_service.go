package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

const defaultOpenRouterModel = "nvidia/nemotron-3-super-120b-a12b:free"

// fallbackOpenRouterModels are tried in order when the configured model is
// overloaded or unavailable (common with :free tier models).
var fallbackOpenRouterModels = []string{
	"minimax/minimax-m2.7:free",
	"google/gemma-4-26b-a4b-it:free",
}

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
// prompt. Tries the configured model first, then falls back through a list of
// alternates when the provider is overloaded. Returns an error when no API key
// is configured or every model fails.
func GenerateFinancialInsight(prompt string) (string, error) {
	apiKey := os.Getenv("OPENROUTER_API_KEY")
	if apiKey == "" || apiKey == "your-openrouter-key" {
		return "", errors.New("OPENROUTER_API_KEY not configured")
	}

	models := make([]string, 0, 1+len(fallbackOpenRouterModels))
	if primary := os.Getenv("OPENROUTER_MODEL"); primary != "" {
		models = append(models, primary)
	} else {
		models = append(models, defaultOpenRouterModel)
	}
	models = append(models, fallbackOpenRouterModels...)

	var lastErr error
	for _, model := range models {
		content, err := callOpenRouter(apiKey, model, prompt)
		if err == nil {
			log.Printf("[ai] insight generated via %s", model)
			return content, nil
		}
		log.Printf("[ai] model %s failed: %v", model, err)
		lastErr = err
	}
	return "", lastErr
}

func callOpenRouter(apiKey, model, prompt string) (string, error) {
	payload, err := json.Marshal(openRouterRequest{
		Model: model,
		Messages: []openRouterMessage{
			{Role: "system", Content: "You are a friendly personal finance assistant for a budgeting app. You always answer with exactly 1-3 short plain sentences of practical financial advice. Never repeat, quote, or restate the user's instructions or any labels; never mention prompts or instructions. Do not use markdown, bullet points, or lists.\n\nExample input:\nStats: total_balance=50000, total_income=8000, total_expense=6000, net_savings=2000, active_goals=2, budget_alerts=1\nTop spending categories: Fuel (2000), Food (1500)\n\nExample output:\nNice work on your 2,000 net savings this month. Fuel is your biggest cost, so fuelling up at cheaper stations could stretch your savings even further."},
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
		return "", fmt.Errorf("openrouter: %s", strings.TrimSpace(body.Error.Message))
	}
	if len(body.Choices) == 0 || body.Choices[0].Message.Content == "" {
		return "", errors.New("openrouter: empty response")
	}

	return body.Choices[0].Message.Content, nil
}

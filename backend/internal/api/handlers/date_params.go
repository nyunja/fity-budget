package handlers

import (
	"time"
)

// parseQueryDate parses a date query parameter. Accepts RFC3339 timestamps
// (e.g. 2026-09-02T00:00:00Z) and plain dates (e.g. 2026-09-02). For plain
// dates, endOfDay controls whether the start or end of that day is returned.
// Returns nil when the parameter is empty or unparseable.
func parseQueryDate(value string, endOfDay bool) *time.Time {
	if value == "" {
		return nil
	}

	if t, err := time.Parse(time.RFC3339, value); err == nil {
		return &t
	}

	if t, err := time.Parse("2006-01-02", value); err == nil {
		if endOfDay {
			t = t.Add(24*time.Hour - time.Second)
		} else {
			t = time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, t.Location())
		}
		return &t
	}

	return nil
}

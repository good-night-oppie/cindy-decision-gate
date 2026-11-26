# cindy-decision-gate

Fork of [`makecindy/cindy-official-plugins/decision-gate`](https://github.com/makecindy/cindy-official-plugins/tree/main/decision-gate) (upstream v0.5.1, commit `7810872d`) extended to **v0.6.0**.

## What v0.6.0 Adds

- **Google Gemini Decision (`gemini-decision-1`)** via `https://generativelanguage.googleapis.com/v1beta/decisions` (`gemini_api_key` injected as `x-goog-api-key`).
- **Multimodal Inputs**: supports `text`, `image` (`resolution`: `low`/`medium`/`high`/`ultra_high`), `video` (`resolution` clamped to `high`), `audio`, and `document` (`application/pdf`, inline base64, HTTPS URI, or Gemini Files API URI).
- **Typed Questions**: supports `noul` (yes/no calibrated probability), `choice` (2–255 options with per-option routing `optionRoutes` on `will-start-task` or `targetOption` filtering), and `score` (2–255 ordered rubric levels with `minScore`).
- **New `evaluate` Tool & Settings Playground**: evaluates 1–1,000 typed questions in a single request across multimodal inputs without consuming agent turns.
- **Antigravity (`acp`) Model Routing & Inline Selector**:
  - Recognizes `acp` / `antigravity` / `agy` models and injects built-in Antigravity models (`acp-plugin:_ns__local__cindy-antigravity-multi-accounts:agy`, including `gemini-4-hydrogen`, `gemini-4-argon`, `gemini-4-carbon`, `gemini-4-neon`, etc.) in both `main.js` and `settings.js`.
  - Adds an anti-`xd` balance-drain guard in `findModels()` so unmatched partial names or fallback lookups never accidentally match `providerId === "xd"`.
  - Adds a floating `.mpop` model/effort selector in `settings.js` + `settings.css` and omits `initial` from `POST /model-picker` when the current route is not one of `cc` / `codex` / `pi`, fixing `Invalid model picker options` errors.
- **Localized Metadata & UI**: updated `locales/{en,zh-CN,ja,ko}.json`.

## Running Tests

```bash
node --test test/decision-gate.test.mjs
node test/decision-gate-v0.6.0.test.mjs
```

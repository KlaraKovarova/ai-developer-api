# AI Code Tools API — RapidAPI Service

Three AI-powered APIs for developers, listed on RapidAPI marketplace.

## APIs

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/readme` | Generate professional README.md from GitHub repo |
| `POST /api/v1/review` | Structured AI code review |
| `POST /api/v1/test` | Unit test generation (auto-detects language) |

## BYOK (Bring Your Own Key)

Pass your own [Anthropic API key](https://console.anthropic.com/) via the `X-Api-Key` header. This gives you full control over usage and costs.

```bash
curl -X POST https://your-api.vercel.app/api/v1/readme \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: sk-ant-your-key-here" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'
```

Without `X-Api-Key`, the server's configured `ANTHROPIC_API_KEY` is used (if set).

## Quick Example

```bash
# Generate README (BYOK)
curl -X POST https://your-api.vercel.app/api/v1/readme \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: sk-ant-your-key-here" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'

# Code review
curl -X POST https://your-api.vercel.app/api/v1/review \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: sk-ant-your-key-here" \
  -d '{"code": "function add(a,b){return a+b}", "language": "javascript"}'

# Generate tests
curl -X POST https://your-api.vercel.app/api/v1/test \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: sk-ant-your-key-here" \
  -d '{"code": "def add(a, b): return a + b", "language": "python"}'
```

## Deploy to Vercel

```bash
npm install -g vercel
cd rapidapi-service
vercel --prod
```

Set these environment variables in Vercel dashboard:
- `ANTHROPIC_API_KEY` — your Claude API key (used as fallback when user doesn't pass X-Api-Key)
- `GITHUB_TOKEN` — (optional) GitHub PAT for higher rate limits
- `RAPIDAPI_PROXY_SECRET` — from RapidAPI dashboard (set AFTER listing)

## List on RapidAPI

### Step 1: Deploy to Vercel and note your URL
e.g. `https://ai-code-tools-api.vercel.app`

### Step 2: Create a RapidAPI account
Go to [rapidapi.com](https://rapidapi.com) → Sign up as a provider

### Step 3: Add your API
1. Go to **My APIs** → **Add New API**
2. **API name:** `AI Code Tools` (or per-API: `README Generator API`)
3. **Category:** `AI, Machine Learning`
4. **Base URL:** your Vercel URL

### Step 4: Configure endpoints

Add each endpoint:

**README Generator:**
- Method: POST
- Path: `/api/v1/readme`
- Body param: `repoUrl` (string, required)

**Code Review:**
- Method: POST
- Path: `/api/v1/review`
- Body params: `code` (string, required), `language` (string, optional)

**Unit Test Generator:**
- Method: POST
- Path: `/api/v1/test`
- Body params: `code` (string, required), `language` (string, optional)

### Step 5: Set pricing plans

**Freemium plan (Basic):**
- 50 requests/month free
- RapidAPI enforces this quota automatically

**Pro plan:**
- $9/month for 500 requests
- $0.02 per extra request

> RapidAPI takes ~20% commission. At $9/month with 10 subscribers = ~$72/month net.

### Step 6: Security — Proxy Secret
1. RapidAPI dashboard → My APIs → your API → **Security**
2. Copy the **Proxy Secret**
3. Add to Vercel: `RAPIDAPI_PROXY_SECRET=<secret>`
4. This ensures only RapidAPI can call your endpoints

### Step 7: Publish
Submit for review. RapidAPI typically approves within 1-2 business days.

## Pricing Strategy

Target: 300 EUR/month goal

| Scenario | Subscribers | Revenue |
|----------|-------------|---------|
| Conservative | 50 Pro | ~$360/month |
| Target | 100 Pro | ~$720/month |

To reach 300 EUR: need ~42 Pro subscribers at $9/month (after RapidAPI 20% cut).

---

## Support

If this API saves you time, consider supporting the project:

- ☕ [Buy Me a Coffee](https://www.buymeacoffee.com/klarakovarova)
- 🪙 Trade crypto on [Binance](https://www.binance.com/en/activity/referral-entry/CPA?ref=CPA_00M5YYRBP5) — get 10% fee discount with our referral link

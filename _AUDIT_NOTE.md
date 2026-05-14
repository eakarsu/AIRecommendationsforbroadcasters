# Audit Note — AIRecommendationsforbroadcasters

## Original audit recommendations (batch_07.md §12)

**Missing AI endpoints:** `/recommend`, `/schedule-optimizer`, `/trend-detector`, `/audience-segmentation`, `/sports-highlight-extraction`, `/subtitle-generation`.

**Missing non-AI features:** viewing history tracking, user preference learning, A/B testing framework, audience analytics dashboard, sports data integration.

**Custom suggestions:** personalized schedule generation, multi-category playlist builder, live event optimization, churn prediction, collaborative filtering at scale, sports-specific intelligence.

Note: an `aiSchedule.js` already implements `/optimize-schedule` (the `/schedule-optimizer` rec). Audit said 0 endpoints; truth is 1.

## Implemented this pass (3 mechanical)
1. `POST /api/ai/recommend` — personalised content recommendations using recent ViewingHistory + Content catalog.
2. `POST /api/ai/trend-detector` — 14-day emerging-trend detection over ViewingHistory.
3. `POST /api/ai/audience-segmentation` — taste-based clustering of profiles over 30 days.

All three reuse the existing `callOpenRouter` middleware, `aiRateLimiter`, and `authenticateToken`. Added in `backend/routes/aiSchedule.js` (already mounted under `/api/ai`). Syntax-checked.

## Backlog (prioritized)
1. `POST /api/ai/sports-highlight-extraction` (NEEDS-PRODUCT-DECISION — video pipeline + storage).
2. `POST /api/ai/subtitle-generation` (NEEDS-CREDS — STT model).
3. `POST /api/ai/churn-prediction` (mechanical follow-up).
4. A/B testing framework, collaborative-filtering vector index (NEEDS-PRODUCT-DECISION).
5. Sports data integration (NEEDS-CREDS).

## Apply pass 3 (frontend)

- Action: LEFT-AS-IS.
- All three pass-2 endpoints already have dedicated FE pages: `AIRecommendPage.jsx`, `AITrendDetectorPage.jsx`, `AIAudienceSegmentationPage.jsx`, routed in `App.jsx` (`/ai-recommend`, `/ai-trend-detector`, `/ai-audience-segmentation`).
- Auth pattern: each page reads JWT from `localStorage` and sends `Authorization: Bearer <token>` on `/api/ai/*` calls; backend error JSON (including 503 no-key) surfaces via the page's `error` state.
- Log: `_AUDIT/apply3_logs/ab3_63.md`.

## Apply pass 4 (mechanical backlog)

- Action: ALREADY-IMPLEMENTED (this pass found work in place; documenting it).
- Backend: `backend/routes/aiSchedule.js` contains 1 backlog-driven LLM endpoint with `requireAiKey` 503-on-no-key guard:
  1. `POST /api/ai/churn-prediction` — churn-risk scoring (the "mechanical follow-up" item from the backlog).
- Frontend: `frontend/src/pages/AIChurnPredictionPage.jsx` is routed at `/ai-churn-prediction` in `App.jsx`; sends JWT `Authorization: Bearer <token>`; surfaces 503 inline.
- Backlog deferred: sports-highlight-extraction (NEEDS-PRODUCT-DECISION — video pipeline + storage), subtitle-generation (NEEDS-CREDS — STT model), A/B testing & collaborative-filtering vector index (NEEDS-PRODUCT-DECISION), sports-data integration (NEEDS-CREDS).
- Smoke test: deferred (Postgres dependency).
- Log: `_AUDIT/apply4_logs/ab3_63.md`.

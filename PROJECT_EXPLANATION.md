# SignalLens AI — Complete Project Documentation & Technical Guide

---

## 📖 1. Executive Summary & Value Proposition

### 1.1 What is SignalLens AI?
**SignalLens AI** is an AI-powered, temporal root-cause intelligence platform designed for restaurant owners, general managers, and multi-unit hospitality operators. 

Instead of acting as a superficial review summarizer or generic chatbot, SignalLens AI answers the single most critical operational question:
> **"Why did customer satisfaction change, when did it happen, what evidence proves it, and what should we investigate on the floor?"**

---

### 1.2 The Core Problem with Existing Solutions
Most restaurant analytics tools suffer from three fundamental flaws:
1. **Surface-Level Sentiment Analysis:** Stating that "Sentiment is 72% positive" gives no actionable operational insight.
2. **Unfocused LLM Summaries:** Sending 500 raw reviews directly to an LLM produces hallucinations, overlooks subtle statistical shifts across segments (e.g., weekend dine-in vs. weekday delivery), and fails to establish temporal causality.
3. **Lack of Separation Between Fact & Hypothesis:** Generic AI tools often state correlations as proven facts (e.g., claiming "the new chef caused bad ratings" without statistical evidence).

---

### 1.3 Key Differentiator: Deterministic Data Science + Grounded AI Reasoning
SignalLens AI enforces a strict architectural boundary:
* **Python (pandas, NumPy, scikit-learn, TextBlob):** Computes all metrics, detects change-points, runs Z-score anomaly detection, isolates segments, and generates a quantitative **Evidence Graph**.
* **Gemini 2.5 Flash:** Acts solely as an interpreter. It receives **only structured numerical evidence and trend data**, formulating evidence-backed operational hypotheses without calculating numbers or hallucinating facts.

```
┌────────────────────────────────────────────────────────┐
│                   SignalLens AI                        │
│                                                        │
│  "Find what changed. Understand why. Know what to      │
│   investigate next."                                   │
└────────────────────────────────────────────────────────┘
```

---

## 🏗️ 2. System Architecture & End-to-End Flow

### 2.1 Architecture Diagram

```
[ User Browser ]
      │
      │ 1. Upload CSV or Click "Try Demo"
      ▼
[ Next.js Frontend (React 19 + Tailwind CSS + Recharts) ]
      │
      │ 2. POST /api/analyze
      ▼
[ Next.js API Route Handler (Server-Side TypeScript) ]
      │
      │ 3. Privacy Sanitization & Validation (lib/privacy.ts, lib/validation.ts)
      ▼
[ Local Temp CSV Storage (os.tmpdir) ]
      │
      │ 4. Child Process Invocation (python analytics/pipeline.py <csv_path>)
      ▼
[ Python Data Science Pipeline (13 Steps) ]
      │ ├─ Missing Value & Duplicate Handling
      │ ├─ Sentiment Blending (TextBlob + Rating Scale)
      │ ├─ Topic Extraction (Multi-keyword Matching)
      │ ├─ Change-point & Time-series Trend Detection
      │ ├─ Segment Gap Analysis (Visit Type, Meal, Day of Week)
      │ └─ Z-Score Anomaly Detection (StandardScaler)
      │
      │ 5. Returns Evidence JSON to stdout
      ▼
[ Next.js API Route Handler ]
      │
      │ 6. Filtered Evidence JSON Payload sent to Gemini API
      ▼
[ Google Gemini 2.5 Flash API (lib/ai/gemini.ts) ]
      │
      │ 7. Returns Strictly Typed AI Hypothesis JSON
      ▼
[ Local File-System DB (.data/db.json via lib/database/local.ts) ]
      │
      │ 8. Persists Analysis Run (ID, Evidence, Hypotheses, Metrics)
      ▼
[ Next.js Frontend Dashboard (/dashboard) ]
      │
      │ 9. User reviews Visualizations & Clicks "[ WHY? ]"
      ▼
[ POST /api/investigate -> Focused Gemini Deep-Dive -> Modal Display ]
```

---

### 2.2 Step-by-Step Data Flow Lifecycle

1. **Ingestion & Demo Triggering (`/`):**
   * The user uploads a CSV file or clicks **"Try Demo Dataset"**.
   * If Demo mode is chosen, `src/data/demo-dataset.ts` generates ~500 realistic reviews with embedded temporal anomalies (e.g., March delivery and wait-time degradation on weekends).

2. **Server-Side Sanitation & Validation (`/api/analyze`):**
   * Review text is sanitized via `src/lib/privacy.ts`:
     * Emails, phone numbers, and URLs are replaced with `[EMAIL]`, `[PHONE]`, and `[URL]`.
     * Prompt injection keywords (`ignore previous instructions`, `reveal system prompt`, etc.) are replaced with `[FILTERED]`.
   * CSV structure is validated for minimum rows and mandatory columns (`date`, `rating`, `review_text`).

3. **Deterministic Python Execution:**
   * The Node.js server spawns a Python child process running `analytics/pipeline.py`.
   * Python loads the data into pandas, runs 13 statistical steps, and outputs an Evidence JSON structure containing dataset summaries, topic shifts, segment comparisons, and Z-score anomalies.

4. **AI Hypothesis Generation (`src/lib/ai/gemini.ts`):**
   * The Evidence JSON is packaged into a strict prompt sent to **Gemini 2.5 Flash**.
   * The LLM synthesizes the observed quantitative findings into:
     * `what_changed`: Observable factual summary.
     * `why_hypothesis`: Plausible operational explanation.
     * `evidence_citations`: Direct data references.
     * `recommended_investigation`: Actionable steps for management.

5. **Persistence (`src/lib/database/local.ts`):**
   * The complete analysis output (dataset metrics + evidence + AI insights) is stored in `.data/db.json` with a generated UUID.
   * **Note:** Raw review text is never permanently stored, ensuring user privacy.

6. **Interactive Dashboard Rendering (`/dashboard`):**
   * The dashboard visualizes metrics, rating trends over time, topic shifts, sentiment breakdowns, segment discrepancies, and anomalies using **Recharts**.

7. **Root-Cause Deep-Dive Investigation (`/api/investigate`):**
   * When the user clicks the prominent **"WHY?"** button on the AI Alert banner, a targeted request is sent to `/api/investigate`.
   * Gemini provides an in-depth operational breakdown displayed in `InvestigationModal.tsx`.

---

## 💻 3. Tech Stack Breakdown & Roles

| Technology | Layer | Role in SignalLens AI |
| :--- | :--- | :--- |
| **Next.js 15 (App Router)** | Framework | Provides unified full-stack architecture, React Server/Client Components, API route handlers, and fast bundling with Turbopack. |
| **React 19** | Frontend | Powers reactive UI state management, interactive modal workflows, and client-side data binding. |
| **TypeScript** | Language | Enforces strict type safety across data science payloads, API requests/responses, and UI components (`src/types/index.ts`). |
| **Tailwind CSS v4** | Styling | Delivers a modern dark-mode UI with glassmorphic cards, responsive grids, and clean typography. |
| **Recharts** | Data Viz | Renders responsive SVG charts: time-series rating trends (`LineChart`) and topic sentiment comparisons (`BarChart`). |
| **Lucide React** | Icons | Provides clean, modern icons for metrics, status badges, alerts, and navigation. |
| **Python 3** | Data Science | Executes core computational tasks where deterministic statistical analysis is required. |
| **pandas & NumPy** | Data Processing | Handles DataFrame operations, temporal aggregations, grouping, and before/after split calculations. |
| **scikit-learn** | Machine Learning | Uses `StandardScaler` to calculate Z-scores for monthly rating/sentiment and topic mention anomaly detection. |
| **TextBlob** | NLP | Computes sentiment polarity (-1.0 to +1.0) on review text to complement raw numerical star ratings. |
| **Google Gemini 2.5 Flash** | AI / LLM | Interprets quantitative statistical evidence, drafts hypotheses, and formulates investigation checklists. |
| **Local File DB (`.data/db.json`)** | Persistence | Lightweight JSON-based local database engine providing persistent storage across server restarts without external cloud dependencies. |

---

## 📁 4. Key Files & Detailed Function Walkthrough

```
SignalLens/
├── analytics/
│   ├── pipeline.py            # 13-step deterministic data science engine
│   └── requirements.txt       # Python dependencies (pandas, sklearn, etc.)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/
│   │   │   │   └── route.ts   # Main analysis orchestration endpoint
│   │   │   └── investigate/
│   │   │       └── route.ts   # Focused AI root-cause investigation endpoint
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Main analytics & insights dashboard
│   │   ├── layout.tsx         # Root layout configuration
│   │   └── page.tsx           # Landing page & upload screen
│   ├── components/
│   │   ├── AIAlert.tsx        # Highlight banner with the prominent [ WHY? ] CTA
│   │   ├── AnomalyList.tsx    # Statistical anomaly cards (Z-score & severity)
│   │   ├── EvidencePanel.tsx  # Detailed statistical proof table
│   │   ├── InvestigationModal.tsx # Root-cause deep-dive modal
│   │   ├── MetricsBar.tsx     # Top KPIs: Avg Rating, Sentiment, Reviews, Momentum
│   │   ├── SegmentComparison.tsx # Segment breakdown bars (Dine-in vs Delivery, etc.)
│   │   ├── TopicChanges.tsx   # Top shifting topics (% changes)
│   │   ├── TopicSentiment.tsx # Horizontal bar chart of sentiment by topic
│   │   ├── TrendChart.tsx     # Time-series line chart for ratings over time
│   │   └── UploadZone.tsx     # Drag-and-drop CSV uploader & Demo trigger
│   ├── data/
│   │   └── demo-dataset.ts    # Synthetic dataset generator with hidden story
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── gemini.ts      # Gemini API client & prompt engineering
│   │   │   └── mock-results.ts# Deterministic mock fallback for offline demoing
│   │   ├── database/
│   │   │   └── local.ts       # Local file-system database (.data/db.json)
│   │   ├── privacy.ts         # PII redaction & prompt-injection filters
│   │   └── validation.ts      # CSV structure & safety validator
│   └── types/
│       └── index.ts           # Shared TypeScript interfaces
├── .env.local                 # Local environment configuration (GEMINI_API_KEY)
└── README.md                  # Project overview & quickstart
```

---

### 4.1 Detailed Breakdown of Core Modules

#### `analytics/pipeline.py`
The brain of the data science system. Executes 13 sequential processing steps:
* `validate_data(df)`: Checks for required columns (`date`, `rating`, `review_text`) and dataset viability.
* `handle_missing_values(df)`: Imputes missing ratings with median values and fills categorical blanks.
* `clean_data(df)`: Normalizes date formats, cleans whitespace, and clips ratings between 1 and 5.
* `detect_duplicates(df)`: Removes duplicate entries based on `(review_text, date)`.
* `analyze_sentiment(df)`: Calculates TextBlob polarity and combines it with normalized star ratings for a robust `blended_sentiment`.
* `discover_topics(df)`: Evaluates regex word boundaries across 7 operational topic categories: `food_quality`, `service`, `delivery`, `wait_time`, `ambiance`, `price`, and `cleanliness`.
* `analyze_topic_frequency(df)`: Computes monthly percentage frequency for every topic.
* `analyze_sentiment_by_topic(df)`: Calculates average sentiment and rating per topic.
* `analyze_trends(df)`: Evaluates month-over-month trajectory, calculates trend slope, and analyzes day-of-week patterns.
* `before_after_comparison(df)`: Detects the point of maximum rating drop (change-point) and computes before vs. after topic deltas.
* `compare_segments(df)`: Groups performance by `visit_type` (dine-in, delivery, takeaway), `meal_type`, and `day_type` (weekday vs. weekend).
* `detect_anomalies(df)`: Applies `StandardScaler` from scikit-learn to compute Z-scores on monthly ratings, sentiment, and topic volume; flags deviations with $|Z| > 1.5$.
* `generate_evidence(df, ...)`: Assembles structured factual proof objects with metrics, baselines, current values, percentage changes, sample sizes, and confidence levels.

---

#### `src/lib/privacy.ts`
* `sanitizeText(text)`: Runs regex filters to strip emails (`[EMAIL]`), phone numbers (`[PHONE]`), and URLs (`[URL]`). It also sanitizes common LLM injection vectors (e.g., `ignore previous instructions`, `system prompt`).
* `containsInjectionAttempt(text)`: Flags malicious prompt injection attempts.

---

#### `src/lib/ai/gemini.ts`
* `generateAnalysisInsight(evidenceData)`: Sends the structured Evidence JSON to **Gemini 2.5 Flash** using temperature `0.2` and `responseMimeType: "application/json"`. Returns structured hypothesis data.
* `generateInvestigation(analysisData, topic)`: Executes a focused investigation for the modal deep-dive when the user clicks **"WHY?"**.

---

#### `src/lib/database/local.ts`
* `saveAnalysisRun(data)`: Persists an analysis run to `.data/db.json` asynchronously using Node.js `fs/promises`.
* `getAnalysisRun(id)`: Retrieves a specific historical run by UUID.

---

#### `src/data/demo-dataset.ts`
Generates ~500 synthetic reviews with a deliberately embedded operational story:
* **January (Baseline):** ~4.3 avg rating, low complaint rate.
* **February (Early drift):** ~4.2 avg rating, slight rise in wait times.
* **March (Degradation):** ~3.8 avg rating, **+187% spike in delivery complaints**, **+142% spike in wait times**, concentrated on **weekends**, while food quality remains stable (-4%).

---

## 🔬 5. Data Science & Statistical Methodology

### 5.1 Blended Sentiment Score
Instead of relying solely on NLP sentiment (which can misjudge sarcasm or brief reviews) or star ratings (which lack nuance), we use a blended formulation:

$$\text{Rating}_{\text{norm}} = \frac{\text{Rating} - 3}{2} \quad (\text{maps } 1 \to -1, 3 \to 0, 5 \to +1)$$

$$\text{Blended Sentiment} = 0.6 \times \text{TextBlob Polarity} + 0.4 \times \text{Rating}_{\text{norm}}$$

---

### 5.2 Change-Point Detection
To determine *when* customer satisfaction changed:
1. Group reviews by month $M_1, M_2, \dots, M_k$.
2. For each split index $i \in \{1, \dots, k-1\}$, partition into:
   $$\text{Before} = \{M_1, \dots, M_i\}, \quad \text{After} = \{M_{i+1}, \dots, M_k\}$$
3. Compute rating differential:
   $$\Delta R_i = |\bar{R}_{\text{before}} - \bar{R}_{\text{after}}|$$
4. The change point is the split $i$ that maximizes $\Delta R_i$ (provided $\Delta R_i \ge 0.1$).

---

### 5.3 Z-Score Anomaly Detection
To flag statistical outliers without arbitrary thresholding:

$$Z = \frac{x - \mu}{\sigma}$$

* $|Z| > 1.5$: Medium Severity Anomaly
* $|Z| > 2.0$: High Severity Anomaly (statistically significant shift in topic frequency or satisfaction drop)

---

## 🎯 6. Technical Difficulties Faced & How They Were Resolved

### 1. Cross-Language Process Execution (Node.js ⇄ Python)
* **Challenge:** Spawning Python from a Next.js Route Handler across different operating systems (Windows PowerShell vs. Linux/Mac) where the executable could be `python` or `python3`.
* **Resolution:** Implemented an asynchronous capability check in `/api/analyze/route.ts` that tries `python --version`, falls back to `python3 --version`, writes the payload to an OS-level temporary file (`os.tmpdir`), and reads the structured JSON output from stdout with error boundaries.

### 2. Preventing LLM Number Hallucination
* **Challenge:** LLMs often miscalculate percentages (e.g., claiming a drop from 4.3 to 3.8 is a "30% decrease" or inventing sample sizes).
* **Resolution:** Prohibited the LLM from performing math. Python computes all percentage changes, baselines, sample sizes, and Z-scores deterministically. The LLM receives pre-calculated numbers in the Evidence JSON and is strictly restricted to interpreting them.

### 3. Privacy & Security with Untrusted Review Text
* **Challenge:** Review text uploaded by users could contain sensitive PII or prompt injection attempts designed to hijack the LLM prompt.
* **Resolution:** Implemented a pre-analysis sanitizer (`privacy.ts`) that runs regex substitutions for emails, phone numbers, and URLs, and strips known injection phrases before the data is processed.

### 4. Zero-Infrastructure Local Persistence
* **Challenge:** Removing cloud database dependencies (Supabase) while maintaining persistence across browser refreshes and server restarts.
* **Resolution:** Engineered a lightweight file-system database module (`src/lib/database/local.ts`) that initializes and manages a thread-safe `.data/db.json` store in the project directory.

---

## 💼 7. Comprehensive Interview Questions & Expert Answers

### Q1: Why did you build a custom Python analytics pipeline instead of asking Gemini to analyze all the reviews directly?
> **Answer:** 
> "There are three primary reasons:
> 1. **Cost & Token Limits:** Sending hundreds of raw reviews to an LLM on every query is expensive, slow, and token-heavy.
> 2. **Math & Hallucination Prevention:** LLMs are non-deterministic and notoriously unreliable at computing aggregations, Z-scores, and percentage shifts. Python computes exact statistics deterministically with pandas and scikit-learn.
> 3. **Privacy:** By processing data locally in Python and sending only aggregated evidence metrics to Gemini, customer review text and PII never leave our local environment."

---

### Q2: How does SignalLens AI distinguish between correlation and causation?
> **Answer:**
> "SignalLens AI adheres to an evidence-first architectural standard. The UI explicitly separates **Observed Evidence** (e.g., *'Delivery mentions +187%, Weekend rating -0.8'*) from **AI Hypotheses** (e.g., *'Possible kitchen bottleneck during weekend rush'*). 
> Every AI-generated finding is labeled with a clear disclaimer: *'AI-generated hypothesis based on statistical text analysis — not confirmed causation.'* The AI provides recommended *investigation steps* (e.g., 'Check kitchen ticket times on Friday nights') so operators can verify hypotheses against real-world operations."

---

### Q3: How does the temporal change-point detection algorithm work?
> **Answer:**
> "Rather than comparing arbitrary calendar dates, the pipeline evaluates monthly groupings across the dataset. It tests every possible sequential split point between baseline and subsequent periods, calculating the absolute rating delta between the 'before' and 'after' windows. The split with the maximum delta (above a significance threshold of 0.1 stars) is identified as the change point. All subsequent topic frequency shifts and segment comparisons are calculated relative to that detected inflection point."

---

### Q4: How does the application prevent prompt injection attacks from customer reviews?
> **Answer:**
> "Reviews are treated as untrusted user input. In `src/lib/privacy.ts`, input passes through sanitization filters that match known prompt injection patterns (e.g., `ignore previous instructions`, `reveal system prompt`, `[INST]`). Matched phrases are replaced with `[FILTERED]`. Furthermore, raw reviews are not embedded directly into the LLM system prompt; only Python-aggregated metric tokens and topic summaries are passed to the model."

---

### Q5: If you were scaling this to process 1,000,000 reviews across 500 restaurant locations, how would you evolve the architecture?
> **Answer:**
> "To scale horizontally:
> 1. **Asynchronous Task Queue:** Replace synchronous child process execution with a distributed message queue (e.g., BullMQ + Redis, Celery, or AWS SQS).
> 2. **Distributed Analytics:** Migrate the pandas pipeline to Apache Spark or DuckDB for fast out-of-core aggregations on large datasets.
> 3. **Topic Modeling:** Upgrade keyword matching to embeddings-based topic clustering (e.g., BERTopic or sentence-transformers) with vector indexing.
> 4. **Database:** Migrate `.data/db.json` to a managed PostgreSQL instance with partitioned tables for multi-tenant analytics."

---

## 🏁 8. Quick Verification & Demo Guide

1. Make sure dependencies are installed:
   ```bash
   npm install
   pip install pandas numpy scikit-learn textblob
   ```
2. Ensure your `.env.local` contains your `GEMINI_API_KEY`.
3. Start the application:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) and click **"Try Demo Dataset"**.
5. Observe the discovered findings:
   * Net satisfaction drop in March.
   * Delivery (+187%) & Wait Time (+142%) complaint surges.
   * Weekend performance drop.
6. Click the **[ WHY? ]** button on the AI Alert banner to review the operational hypothesis and recommended management action plan.

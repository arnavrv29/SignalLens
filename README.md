# SignalLens AI

**"Find what changed. Understand why. Know what to investigate next."**

SignalLens AI is an AI-powered root-cause intelligence dashboard for restaurant owners and managers. Unlike simple review summarizers or sentiment dashboards, SignalLens AI focuses on **Temporal Root-Cause Investigation**.

## 🚀 Features

- **Temporal Analytics**: Automatically detects when satisfaction changes and isolates the specific time period.
- **Topic Discovery & Segmentation**: Breaks down feedback into granular topics (food, service, delivery, wait time, etc.) to find exactly what is driving the change.
- **AI Root-Cause Investigation**: Generates evidence-backed hypotheses and recommends specific operational investigations using Gemini.
- **Privacy-First**: Automatically sanitizes personally identifiable information (PII) before processing.
- **Demo Mode**: Built-in synthetic dataset with hidden patterns to demonstrate the analytics pipeline instantly without uploading data.

## 🛠 Architecture & Tech Stack

```
Browser 
  → Next.js Frontend (React, Tailwind CSS, Recharts)
  → Next.js API Routes
  → Privacy Preprocessor
  → Python Data Science Pipeline (pandas, scikit-learn, TextBlob)
  → Evidence JSON
  → Gemini AI Analyst (Google AI Studio)
  → Structured AI Result
  → Local Storage
  → Dashboard
```

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, Recharts
- **Backend**: Next.js API Routes (Serverless)
- **Data Science**: Python 3, pandas, NumPy, scikit-learn, textblob
- **AI**: Gemini 3.6 Flash
- **Database**: Local Storage (in-memory)

## 📦 Setup Instructions

### Prerequisites
- Node.js >= 18
- Python >= 3.8

### 1. Install Dependencies
```bash
# Install Node dependencies
npm install

# Install Python dependencies for the analytics pipeline
pip install -r analytics/requirements.txt
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
# Required for AI insights
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🧪 Try the Demo
Click the **"Try Demo Dataset"** button on the home page. The application will process a built-in synthetic dataset of ~500 reviews containing hidden patterns (e.g., a massive spike in delivery and wait-time complaints during weekends in March) and present the complete investigation dashboard.

## 🔒 Security & Privacy
- **No API Keys in Frontend**: All Gemini interactions happen server-side.
- **PII Redaction**: Email addresses, phone numbers, and URLs are stripped before analysis.
- **Prompt Injection Protection**: Review text is sanitized to prevent AI manipulation.
- **Minimal Storage**: Raw reviews are not permanently stored—only aggregate metrics and insights are kept in local storage.

## 🔮 Future Improvements
- Support for more input formats (Yelp/Google My Business API integrations)
- User authentication and multi-tenant isolation
- Custom topic modeling via LLM (replacing keyword-based extraction)
- Automated weekly report generation

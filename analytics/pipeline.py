"""
SignalLens AI - Data Science Analytics Pipeline
================================================
Performs temporal root-cause investigation on restaurant review data.

Pipeline Steps:
1. Data validation
2. Missing-value handling
3. Basic cleaning
4. Duplicate detection
5. Sentiment analysis
6. Topic discovery
7. Topic frequency analysis
8. Sentiment by topic
9. Time-based trend analysis
10. Before-vs-after comparison
11. Segment comparison
12. Anomaly detection
13. Evidence generation

Input: CSV file path (via command-line argument)
Output: Structured JSON to stdout
"""

import sys
import json
import re
import math
from datetime import datetime
from collections import Counter, defaultdict

import pandas as pd
import numpy as np
from textblob import TextBlob
from sklearn.preprocessing import StandardScaler


# ─── Topic Keywords ──────────────────────────────────────────────────
TOPIC_KEYWORDS = {
    "food_quality": [
        "food", "taste", "flavor", "dish", "meal", "cook", "chef", "ingredient",
        "fresh", "stale", "delicious", "bland", "overcooked", "undercooked",
        "portion", "menu", "recipe", "spicy", "salty", "sweet", "appetizer",
        "entree", "dessert", "breakfast", "lunch", "dinner", "burger", "pizza",
        "pasta", "salad", "soup", "steak", "chicken", "fish", "sushi", "curry"
    ],
    "service": [
        "service", "staff", "waiter", "waitress", "server", "manager", "rude",
        "friendly", "helpful", "attentive", "ignored", "polite", "unprofessional",
        "professional", "attitude", "hospitable", "courteous", "host", "hostess"
    ],
    "delivery": [
        "delivery", "deliver", "delivered", "courier", "driver", "package",
        "cold food", "wrong order", "missing item", "late delivery",
        "delivery time", "takeout", "takeaway", "pickup", "uber eats",
        "doordash", "grubhub", "online order"
    ],
    "wait_time": [
        "wait", "waiting", "slow", "long time", "forever", "minutes",
        "hour", "delay", "delayed", "quick", "fast", "prompt", "speed",
        "took forever", "took too long", "took so long", "rushed"
    ],
    "ambiance": [
        "ambiance", "atmosphere", "decor", "music", "noise", "noisy", "quiet",
        "cozy", "comfortable", "crowded", "spacious", "lighting", "clean",
        "dirty", "vibe", "environment", "setting", "interior", "seating"
    ],
    "price": [
        "price", "expensive", "cheap", "affordable", "value", "worth",
        "overpriced", "cost", "bill", "charge", "money", "budget",
        "reasonable", "rip off", "deal", "discount"
    ],
    "cleanliness": [
        "clean", "dirty", "hygiene", "sanitary", "restroom", "bathroom",
        "toilet", "messy", "tidy", "spotless", "filthy", "gross",
        "cockroach", "bug", "hair in food"
    ]
}


def validate_data(df: pd.DataFrame) -> dict:
    """Step 1: Validate the dataset."""
    errors = []
    warnings = []
    
    required_cols = ["date", "rating", "review_text"]
    missing_cols = [c for c in required_cols if c not in df.columns]
    if missing_cols:
        errors.append(f"Missing required columns: {missing_cols}")
    
    if len(df) < 10:
        warnings.append(f"Very small dataset ({len(df)} rows). Results may be unreliable.")
    
    if "rating" in df.columns:
        non_numeric = df["rating"].apply(lambda x: not isinstance(x, (int, float)) and not str(x).replace('.','').isdigit())
        if non_numeric.sum() > 0:
            warnings.append(f"{non_numeric.sum()} rows have non-numeric ratings")
    
    return {"valid": len(errors) == 0, "errors": errors, "warnings": warnings}


def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Step 2: Handle missing values."""
    if "rating" in df.columns:
        df["rating"] = pd.to_numeric(df["rating"], errors="coerce")
        df["rating"] = df["rating"].fillna(df["rating"].median())
    
    if "review_text" in df.columns:
        df["review_text"] = df["review_text"].fillna("")
    
    if "visit_type" in df.columns:
        df["visit_type"] = df["visit_type"].fillna("unknown")
    
    if "meal_type" in df.columns:
        df["meal_type"] = df["meal_type"].fillna("unknown")
    
    if "restaurant" in df.columns:
        df["restaurant"] = df["restaurant"].fillna("Unknown Restaurant")
    
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Step 3: Basic cleaning."""
    if "review_text" in df.columns:
        df["review_text"] = df["review_text"].astype(str).str.strip()
        # Remove excessive whitespace
        df["review_text"] = df["review_text"].str.replace(r'\s+', ' ', regex=True)
    
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce", format="mixed")
        df = df.dropna(subset=["date"])
    
    if "rating" in df.columns:
        df["rating"] = df["rating"].clip(1, 5)
    
    return df


def detect_duplicates(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    """Step 4: Detect and remove duplicates."""
    if "review_text" in df.columns:
        dupes = df.duplicated(subset=["review_text", "date"], keep="first")
        n_dupes = dupes.sum()
        df = df[~dupes].copy()
        return df, int(n_dupes)
    return df, 0


def analyze_sentiment(df: pd.DataFrame) -> pd.DataFrame:
    """Step 5: Sentiment analysis using TextBlob."""
    sentiments = []
    for text in df["review_text"]:
        try:
            blob = TextBlob(str(text))
            sentiments.append(blob.sentiment.polarity)
        except Exception:
            sentiments.append(0.0)
    
    df["sentiment"] = sentiments
    
    # Also create a rating-weighted sentiment
    if "rating" in df.columns:
        # Normalize rating to -1 to 1 scale
        rating_norm = (df["rating"] - 3) / 2  # 1->-1, 3->0, 5->1
        # Blend TextBlob sentiment with rating-based sentiment
        df["blended_sentiment"] = 0.6 * df["sentiment"] + 0.4 * rating_norm
    else:
        df["blended_sentiment"] = df["sentiment"]
    
    return df


def discover_topics(df: pd.DataFrame) -> pd.DataFrame:
    """Step 6: Topic discovery using keyword matching."""
    topic_columns = {}
    
    for topic, keywords in TOPIC_KEYWORDS.items():
        pattern = r'\b(' + '|'.join(re.escape(k) for k in keywords) + r')\b'
        topic_columns[f"topic_{topic}"] = df["review_text"].str.lower().str.contains(
            pattern, regex=True, na=False
        ).astype(int)
    
    topic_df = pd.DataFrame(topic_columns, index=df.index)
    df = pd.concat([df, topic_df], axis=1)
    
    return df


def analyze_topic_frequency(df: pd.DataFrame) -> list[dict]:
    """Step 7: Topic frequency analysis over time."""
    topic_cols = [c for c in df.columns if c.startswith("topic_")]
    
    if "date" not in df.columns or len(topic_cols) == 0:
        return []
    
    df["month"] = df["date"].dt.to_period("M")
    months = sorted(df["month"].unique())
    
    results = []
    for topic_col in topic_cols:
        topic_name = topic_col.replace("topic_", "").replace("_", " ").title()
        monthly_freq = []
        for month in months:
            mask = df["month"] == month
            total = mask.sum()
            mentions = df.loc[mask, topic_col].sum()
            freq = float(mentions / total * 100) if total > 0 else 0
            monthly_freq.append({
                "month": str(month),
                "frequency_pct": round(freq, 1),
                "mentions": int(mentions),
                "total_reviews": int(total)
            })
        
        results.append({
            "topic": topic_name,
            "topic_key": topic_col.replace("topic_", ""),
            "monthly_data": monthly_freq,
            "total_mentions": int(df[topic_col].sum())
        })
    
    return results


def analyze_sentiment_by_topic(df: pd.DataFrame) -> list[dict]:
    """Step 8: Sentiment broken down by topic."""
    topic_cols = [c for c in df.columns if c.startswith("topic_")]
    results = []
    
    for topic_col in topic_cols:
        topic_name = topic_col.replace("topic_", "").replace("_", " ").title()
        mask = df[topic_col] == 1
        
        if mask.sum() < 3:
            continue
        
        topic_sentiment = df.loc[mask, "blended_sentiment"].mean()
        overall_sentiment = df["blended_sentiment"].mean()
        topic_rating = df.loc[mask, "rating"].mean() if "rating" in df.columns else None
        
        results.append({
            "topic": topic_name,
            "topic_key": topic_col.replace("topic_", ""),
            "avg_sentiment": round(float(topic_sentiment), 3),
            "overall_avg_sentiment": round(float(overall_sentiment), 3),
            "sentiment_diff": round(float(topic_sentiment - overall_sentiment), 3),
            "avg_rating": round(float(topic_rating), 2) if topic_rating is not None else None,
            "sample_size": int(mask.sum())
        })
    
    return sorted(results, key=lambda x: x["sentiment_diff"])


def analyze_trends(df: pd.DataFrame) -> dict:
    """Step 9: Time-based trend analysis."""
    if "date" not in df.columns:
        return {"monthly_trends": [], "weekly_trends": [], "trend_direction": "stable"}
    
    df["month"] = df["date"].dt.to_period("M")
    df["week"] = df["date"].dt.isocalendar().week.astype(int)
    df["year_month"] = df["date"].dt.strftime("%Y-%m")
    df["day_of_week"] = df["date"].dt.day_name()
    
    # Monthly trends
    monthly = df.groupby("year_month").agg(
        avg_rating=("rating", "mean"),
        avg_sentiment=("blended_sentiment", "mean"),
        review_count=("rating", "count"),
        median_rating=("rating", "median")
    ).reset_index()
    
    monthly_trends = []
    for _, row in monthly.iterrows():
        monthly_trends.append({
            "period": row["year_month"],
            "avg_rating": round(float(row["avg_rating"]), 2),
            "avg_sentiment": round(float(row["avg_sentiment"]), 3),
            "review_count": int(row["review_count"]),
            "median_rating": round(float(row["median_rating"]), 1)
        })
    
    # Calculate trend direction
    if len(monthly_trends) >= 2:
        ratings = [m["avg_rating"] for m in monthly_trends]
        x = np.arange(len(ratings))
        slope = np.polyfit(x, ratings, 1)[0] if len(ratings) >= 2 else 0
        
        if slope < -0.05:
            trend_direction = "declining"
        elif slope > 0.05:
            trend_direction = "improving"
        else:
            trend_direction = "stable"
        
        trend_slope = round(float(slope), 4)
    else:
        trend_direction = "insufficient_data"
        trend_slope = 0.0
    
    # Day-of-week analysis
    dow_stats = df.groupby("day_of_week").agg(
        avg_rating=("rating", "mean"),
        avg_sentiment=("blended_sentiment", "mean"),
        review_count=("rating", "count")
    ).reset_index()
    
    day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    dow_stats["day_order"] = dow_stats["day_of_week"].map({d: i for i, d in enumerate(day_order)})
    dow_stats = dow_stats.sort_values("day_order")
    
    day_of_week_trends = []
    for _, row in dow_stats.iterrows():
        day_of_week_trends.append({
            "day": row["day_of_week"],
            "avg_rating": round(float(row["avg_rating"]), 2),
            "avg_sentiment": round(float(row["avg_sentiment"]), 3),
            "review_count": int(row["review_count"])
        })
    
    return {
        "monthly_trends": monthly_trends,
        "day_of_week_trends": day_of_week_trends,
        "trend_direction": trend_direction,
        "trend_slope": trend_slope
    }


def before_after_comparison(df: pd.DataFrame) -> dict:
    """Step 10: Before-vs-after comparison at detected change point."""
    if "date" not in df.columns or len(df) < 20:
        return {"change_detected": False}
    
    df_sorted = df.sort_values("date")
    df_sorted["month"] = df_sorted["date"].dt.to_period("M")
    months = sorted(df_sorted["month"].unique())
    
    if len(months) < 2:
        return {"change_detected": False}
    
    # Find the change point: month with biggest rating drop
    monthly_ratings = df_sorted.groupby("month")["rating"].mean()
    
    best_split = None
    max_diff = 0
    
    for i in range(1, len(months)):
        before_months = months[:i]
        after_months = months[i:]
        
        before_mask = df_sorted["month"].isin(before_months)
        after_mask = df_sorted["month"].isin(after_months)
        
        before_rating = df_sorted.loc[before_mask, "rating"].mean()
        after_rating = df_sorted.loc[after_mask, "rating"].mean()
        
        diff = abs(before_rating - after_rating)
        if diff > max_diff:
            max_diff = diff
            best_split = i
    
    if best_split is None or max_diff < 0.1:
        return {"change_detected": False, "reason": "No significant change point detected"}
    
    before_months = months[:best_split]
    after_months = months[best_split:]
    
    before_mask = df_sorted["month"].isin(before_months)
    after_mask = df_sorted["month"].isin(after_months)
    
    before_data = df_sorted[before_mask]
    after_data = df_sorted[after_mask]
    
    # Compare metrics
    comparison = {
        "change_detected": True,
        "change_point": str(after_months[0]),
        "before_period": f"{months[0]} to {before_months[-1]}",
        "after_period": f"{after_months[0]} to {months[-1]}",
        "metrics": {
            "rating": {
                "before": round(float(before_data["rating"].mean()), 2),
                "after": round(float(after_data["rating"].mean()), 2),
                "change": round(float(after_data["rating"].mean() - before_data["rating"].mean()), 2),
                "pct_change": round(float((after_data["rating"].mean() - before_data["rating"].mean()) / before_data["rating"].mean() * 100), 1)
            },
            "sentiment": {
                "before": round(float(before_data["blended_sentiment"].mean()), 3),
                "after": round(float(after_data["blended_sentiment"].mean()), 3),
                "change": round(float(after_data["blended_sentiment"].mean() - before_data["blended_sentiment"].mean()), 3),
                "pct_change": round(float(
                    (after_data["blended_sentiment"].mean() - before_data["blended_sentiment"].mean()) / 
                    max(abs(before_data["blended_sentiment"].mean()), 0.001) * 100
                ), 1)
            }
        },
        "sample_sizes": {
            "before": int(len(before_data)),
            "after": int(len(after_data))
        }
    }
    
    # Compare topic frequencies before and after
    topic_cols = [c for c in df_sorted.columns if c.startswith("topic_")]
    topic_changes = []
    
    for topic_col in topic_cols:
        topic_name = topic_col.replace("topic_", "").replace("_", " ").title()
        
        before_freq = before_data[topic_col].mean() * 100
        after_freq = after_data[topic_col].mean() * 100
        
        if before_freq > 0:
            pct_change = ((after_freq - before_freq) / before_freq) * 100
        elif after_freq > 0:
            pct_change = 100.0
        else:
            pct_change = 0.0
        
        before_sentiment = before_data.loc[before_data[topic_col] == 1, "blended_sentiment"].mean()
        after_sentiment = after_data.loc[after_data[topic_col] == 1, "blended_sentiment"].mean()
        
        topic_changes.append({
            "topic": topic_name,
            "topic_key": topic_col.replace("topic_", ""),
            "before_frequency_pct": round(float(before_freq), 1),
            "after_frequency_pct": round(float(after_freq), 1),
            "frequency_change_pct": round(float(pct_change), 1),
            "before_sentiment": round(float(before_sentiment), 3) if not pd.isna(before_sentiment) else 0,
            "after_sentiment": round(float(after_sentiment), 3) if not pd.isna(after_sentiment) else 0,
            "before_mentions": int(before_data[topic_col].sum()),
            "after_mentions": int(after_data[topic_col].sum())
        })
    
    comparison["topic_changes"] = sorted(topic_changes, key=lambda x: abs(x["frequency_change_pct"]), reverse=True)
    
    return comparison


def compare_segments(df: pd.DataFrame) -> list[dict]:
    """Step 11: Segment comparison."""
    segments = []
    
    # Visit type comparison
    if "visit_type" in df.columns:
        visit_stats = df.groupby("visit_type").agg(
            avg_rating=("rating", "mean"),
            avg_sentiment=("blended_sentiment", "mean"),
            count=("rating", "count")
        ).reset_index()
        
        overall_rating = df["rating"].mean()
        
        visit_segments = []
        for _, row in visit_stats.iterrows():
            if row["count"] < 3:
                continue
            visit_segments.append({
                "segment_value": row["visit_type"],
                "avg_rating": round(float(row["avg_rating"]), 2),
                "avg_sentiment": round(float(row["avg_sentiment"]), 3),
                "count": int(row["count"]),
                "diff_from_overall": round(float(row["avg_rating"] - overall_rating), 2)
            })
        
        if visit_segments:
            segments.append({
                "segment_type": "visit_type",
                "segment_label": "Visit Type",
                "segments": sorted(visit_segments, key=lambda x: x["avg_rating"])
            })
    
    # Meal type comparison
    if "meal_type" in df.columns:
        meal_stats = df.groupby("meal_type").agg(
            avg_rating=("rating", "mean"),
            avg_sentiment=("blended_sentiment", "mean"),
            count=("rating", "count")
        ).reset_index()
        
        overall_rating = df["rating"].mean()
        
        meal_segments = []
        for _, row in meal_stats.iterrows():
            if row["count"] < 3:
                continue
            meal_segments.append({
                "segment_value": row["meal_type"],
                "avg_rating": round(float(row["avg_rating"]), 2),
                "avg_sentiment": round(float(row["avg_sentiment"]), 3),
                "count": int(row["count"]),
                "diff_from_overall": round(float(row["avg_rating"] - overall_rating), 2)
            })
        
        if meal_segments:
            segments.append({
                "segment_type": "meal_type",
                "segment_label": "Meal Type",
                "segments": sorted(meal_segments, key=lambda x: x["avg_rating"])
            })
    
    # Day of week comparison  
    if "date" in df.columns:
        df["is_weekend"] = df["date"].dt.dayofweek >= 5
        weekend_stats = df.groupby("is_weekend").agg(
            avg_rating=("rating", "mean"),
            avg_sentiment=("blended_sentiment", "mean"),
            count=("rating", "count")
        ).reset_index()
        
        overall_rating = df["rating"].mean()
        
        dow_segments = []
        for _, row in weekend_stats.iterrows():
            label = "Weekend" if row["is_weekend"] else "Weekday"
            dow_segments.append({
                "segment_value": label,
                "avg_rating": round(float(row["avg_rating"]), 2),
                "avg_sentiment": round(float(row["avg_sentiment"]), 3),
                "count": int(row["count"]),
                "diff_from_overall": round(float(row["avg_rating"] - overall_rating), 2)
            })
        
        if dow_segments:
            segments.append({
                "segment_type": "day_type",
                "segment_label": "Day Type",
                "segments": dow_segments
            })
    
    return segments


def detect_anomalies(df: pd.DataFrame) -> list[dict]:
    """Step 12: Anomaly detection using Z-scores."""
    anomalies = []
    
    if "date" not in df.columns:
        return anomalies
    
    df["year_month"] = df["date"].dt.strftime("%Y-%m")
    
    # Monthly rating anomalies
    monthly = df.groupby("year_month").agg(
        avg_rating=("rating", "mean"),
        avg_sentiment=("blended_sentiment", "mean"),
        count=("rating", "count")
    ).reset_index()
    
    if len(monthly) >= 3:
        scaler = StandardScaler()
        
        rating_z = scaler.fit_transform(monthly[["avg_rating"]])
        sentiment_z = scaler.fit_transform(monthly[["avg_sentiment"]])
        
        for i, (_, row) in enumerate(monthly.iterrows()):
            rz = float(rating_z[i][0])
            sz = float(sentiment_z[i][0])
            
            if abs(rz) > 1.5:
                direction = "unusually_low" if rz < 0 else "unusually_high"
                anomalies.append({
                    "type": "rating_anomaly",
                    "period": row["year_month"],
                    "metric": "average_rating",
                    "value": round(float(row["avg_rating"]), 2),
                    "z_score": round(rz, 2),
                    "direction": direction,
                    "severity": "high" if abs(rz) > 2 else "medium",
                    "sample_size": int(row["count"]),
                    "description": f"Rating was {direction.replace('_', ' ')} in {row['year_month']} ({round(float(row['avg_rating']), 2)})"
                })
            
            if abs(sz) > 1.5:
                direction = "unusually_low" if sz < 0 else "unusually_high"
                anomalies.append({
                    "type": "sentiment_anomaly",
                    "period": row["year_month"],
                    "metric": "average_sentiment",
                    "value": round(float(row["avg_sentiment"]), 3),
                    "z_score": round(sz, 2),
                    "direction": direction,
                    "severity": "high" if abs(sz) > 2 else "medium",
                    "sample_size": int(row["count"]),
                    "description": f"Sentiment was {direction.replace('_', ' ')} in {row['year_month']}"
                })
    
    # Topic spike anomalies
    topic_cols = [c for c in df.columns if c.startswith("topic_")]
    for topic_col in topic_cols:
        topic_name = topic_col.replace("topic_", "").replace("_", " ").title()
        monthly_topic = df.groupby("year_month")[topic_col].mean().reset_index()
        
        if len(monthly_topic) >= 3:
            values = monthly_topic[topic_col].values.reshape(-1, 1)
            z_scores = scaler.fit_transform(values)
            
            for i, (_, row) in enumerate(monthly_topic.iterrows()):
                z = float(z_scores[i][0])
                if z > 1.5:
                    anomalies.append({
                        "type": "topic_spike",
                        "period": row["year_month"],
                        "metric": f"{topic_name} mentions",
                        "value": round(float(row[topic_col] * 100), 1),
                        "z_score": round(z, 2),
                        "direction": "spike",
                        "severity": "high" if z > 2 else "medium",
                        "description": f"{topic_name} mentions spiked in {row['year_month']}"
                    })
    
    return sorted(anomalies, key=lambda x: abs(x.get("z_score", 0)), reverse=True)


def generate_evidence(
    df: pd.DataFrame,
    trends: dict,
    topic_freq: list,
    topic_sentiment: list,
    before_after: dict,
    segments: list,
    anomalies: list
) -> list[dict]:
    """Step 13: Generate structured evidence summaries."""
    evidence = []
    
    # Evidence from trends
    if trends.get("trend_direction") == "declining":
        monthly = trends.get("monthly_trends", [])
        if len(monthly) >= 2:
            first_rating = monthly[0]["avg_rating"]
            last_rating = monthly[-1]["avg_rating"]
            pct_change = ((last_rating - first_rating) / first_rating) * 100
            evidence.append({
                "id": "trend_rating_decline",
                "type": "trend",
                "title": "Rating Decline Detected",
                "description": f"Average rating declined from {first_rating} to {last_rating}",
                "metric": "average_rating",
                "baseline": first_rating,
                "current": last_rating,
                "change": round(last_rating - first_rating, 2),
                "pct_change": round(pct_change, 1),
                "sample_size": sum(m["review_count"] for m in monthly),
                "confidence": "high" if sum(m["review_count"] for m in monthly) > 50 else "medium",
                "time_range": f"{monthly[0]['period']} to {monthly[-1]['period']}"
            })
        
        # Sentiment trend
        if len(monthly) >= 2:
            first_sent = monthly[0]["avg_sentiment"]
            last_sent = monthly[-1]["avg_sentiment"]
            if abs(first_sent) > 0.001:
                sent_pct = ((last_sent - first_sent) / abs(first_sent)) * 100
            else:
                sent_pct = 0
            evidence.append({
                "id": "trend_sentiment_decline",
                "type": "trend",
                "title": "Sentiment Decline Detected",
                "description": f"Average sentiment shifted from {first_sent:.3f} to {last_sent:.3f}",
                "metric": "average_sentiment",
                "baseline": round(first_sent, 3),
                "current": round(last_sent, 3),
                "change": round(last_sent - first_sent, 3),
                "pct_change": round(sent_pct, 1),
                "sample_size": sum(m["review_count"] for m in monthly),
                "confidence": "high" if sum(m["review_count"] for m in monthly) > 50 else "medium",
                "time_range": f"{monthly[0]['period']} to {monthly[-1]['period']}"
            })
    
    # Evidence from before/after topic changes
    if before_after.get("change_detected") and "topic_changes" in before_after:
        for tc in before_after["topic_changes"]:
            if abs(tc["frequency_change_pct"]) > 30:
                direction = "increased" if tc["frequency_change_pct"] > 0 else "decreased"
                evidence.append({
                    "id": f"topic_change_{tc['topic_key']}",
                    "type": "topic_change",
                    "title": f"{tc['topic']} Mentions {direction.title()}",
                    "description": f"{tc['topic']} mentions {direction} by {abs(tc['frequency_change_pct']):.0f}% after {before_after['change_point']}",
                    "metric": f"{tc['topic_key']}_frequency",
                    "baseline": tc["before_frequency_pct"],
                    "current": tc["after_frequency_pct"],
                    "change": round(tc["after_frequency_pct"] - tc["before_frequency_pct"], 1),
                    "pct_change": tc["frequency_change_pct"],
                    "sample_size": tc["before_mentions"] + tc["after_mentions"],
                    "confidence": "high" if (tc["before_mentions"] + tc["after_mentions"]) > 20 else "medium",
                    "time_range": f"Before: {before_after['before_period']}, After: {before_after['after_period']}"
                })
    
    # Evidence from segment comparisons
    for seg in segments:
        segs = seg.get("segments", [])
        if len(segs) >= 2:
            best = max(segs, key=lambda x: x["avg_rating"])
            worst = min(segs, key=lambda x: x["avg_rating"])
            diff = best["avg_rating"] - worst["avg_rating"]
            
            if diff > 0.3:
                evidence.append({
                    "id": f"segment_gap_{seg['segment_type']}",
                    "type": "segment_gap",
                    "title": f"{seg['segment_label']} Performance Gap",
                    "description": f"{worst['segment_value']} ({worst['avg_rating']}) significantly underperforms {best['segment_value']} ({best['avg_rating']})",
                    "metric": f"{seg['segment_type']}_rating_gap",
                    "baseline": best["avg_rating"],
                    "current": worst["avg_rating"],
                    "change": round(-diff, 2),
                    "pct_change": round(-diff / best["avg_rating"] * 100, 1),
                    "sample_size": worst["count"] + best["count"],
                    "confidence": "high" if min(worst["count"], best["count"]) > 15 else "medium"
                })
    
    # Evidence from anomalies
    for anomaly in anomalies[:5]:  # Top 5
        evidence.append({
            "id": f"anomaly_{anomaly['type']}_{anomaly['period']}",
            "type": "anomaly",
            "title": anomaly["description"],
            "description": f"Z-score: {anomaly['z_score']} (severity: {anomaly['severity']})",
            "metric": anomaly["metric"],
            "baseline": None,
            "current": anomaly["value"],
            "change": None,
            "pct_change": None,
            "z_score": anomaly["z_score"],
            "sample_size": anomaly.get("sample_size", 0),
            "confidence": anomaly["severity"]
        })
    
    return evidence


def run_pipeline(csv_path: str) -> dict:
    """Main pipeline orchestrator."""
    try:
        # Load data
        df = pd.read_csv(csv_path)
        
        # Step 1: Validate
        validation = validate_data(df)
        if not validation["valid"]:
            return {"error": True, "message": "Validation failed", "details": validation}
        
        # Step 2: Handle missing values
        df = handle_missing_values(df)
        
        # Step 3: Clean
        df = clean_data(df)
        
        # Step 4: Deduplicate
        df, n_dupes = detect_duplicates(df)
        
        # Step 5: Sentiment analysis
        df = analyze_sentiment(df)
        
        # Step 6: Topic discovery
        df = discover_topics(df)
        
        # Step 7: Topic frequency
        topic_freq = analyze_topic_frequency(df)
        
        # Step 8: Sentiment by topic
        topic_sentiment = analyze_sentiment_by_topic(df)
        
        # Step 9: Trends
        trends = analyze_trends(df)
        
        # Step 10: Before/after comparison
        before_after = before_after_comparison(df)
        
        # Step 11: Segments
        segments = compare_segments(df)
        
        # Step 12: Anomalies
        anomalies = detect_anomalies(df)
        
        # Step 13: Evidence
        evidence = generate_evidence(df, trends, topic_freq, topic_sentiment, before_after, segments, anomalies)
        
        # Dataset summary
        dataset_summary = {
            "total_reviews": len(df),
            "duplicates_removed": n_dupes,
            "date_range": {
                "start": str(df["date"].min().date()) if "date" in df.columns else None,
                "end": str(df["date"].max().date()) if "date" in df.columns else None
            },
            "restaurants": df["restaurant"].nunique() if "restaurant" in df.columns else 0,
            "validation": validation
        }
        
        # Sentiment summary
        sentiment_summary = {
            "overall_avg": round(float(df["blended_sentiment"].mean()), 3),
            "overall_std": round(float(df["blended_sentiment"].std()), 3),
            "positive_pct": round(float((df["blended_sentiment"] > 0.05).mean() * 100), 1),
            "negative_pct": round(float((df["blended_sentiment"] < -0.05).mean() * 100), 1),
            "neutral_pct": round(float(((df["blended_sentiment"] >= -0.05) & (df["blended_sentiment"] <= 0.05)).mean() * 100), 1),
            "avg_rating": round(float(df["rating"].mean()), 2) if "rating" in df.columns else None,
            "rating_std": round(float(df["rating"].std()), 2) if "rating" in df.columns else None,
            "rating_distribution": {
                str(int(k)): int(v) for k, v in df["rating"].value_counts().sort_index().items()
            } if "rating" in df.columns else {}
        }
        
        # Reputation momentum (trend of last period vs overall)
        reputation_momentum = 0.0
        monthly = trends.get("monthly_trends", [])
        if len(monthly) >= 2:
            overall_avg = sentiment_summary["avg_rating"]
            last_month_avg = monthly[-1]["avg_rating"]
            if overall_avg > 0:
                reputation_momentum = round((last_month_avg - overall_avg) / overall_avg * 100, 1)
        
        result = {
            "error": False,
            "dataset_summary": dataset_summary,
            "sentiment": sentiment_summary,
            "reputation_momentum": reputation_momentum,
            "trends": trends,
            "topics": topic_freq,
            "topic_sentiment": topic_sentiment,
            "before_after": before_after,
            "segment_comparisons": segments,
            "anomalies": anomalies,
            "evidence": evidence
        }
        
        return result
        
    except Exception as e:
        return {
            "error": True,
            "message": f"Pipeline error: {str(e)}",
            "details": {"traceback": str(e)}
        }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": True, "message": "Usage: python pipeline.py <csv_path>"}))
        sys.exit(1)
    
    csv_path = sys.argv[1]
    
    if sys.argv[-1] == "--test":
        # Test mode: validate the pipeline can import and run
        print(json.dumps({"status": "ok", "message": "Pipeline imports successful"}))
        sys.exit(0)
    
    result = run_pipeline(csv_path)
    
    # Output JSON to stdout
    print(json.dumps(result, default=str))

# ==============================================================================
# 4. SERVICES: Bedrock Service (Amazon Bedrock Converse API Orchestrator)
# ==============================================================================

import os
from functools import lru_cache
from dotenv import load_dotenv
import boto3

# Load environment variables from .env
load_dotenv()

@lru_cache(maxsize=1)
def get_bedrock_client():
    """Create and return a cached Bedrock Runtime boto3 client (Singleton)."""
    return boto3.client(
        service_name="bedrock-runtime",
        region_name=os.getenv("AWS_REGION", "ap-southeast-2"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )

def build_trip_prompt(
    destination: str,
    days: int,
    budget: float,
    category: str,
    daily_budget: float | None = None,
    travel_style: str | None = None
) -> str:
    """
    Build a human-curated, highly specific travel guide prompt with strict persona & budget adaptation.
    """
    if daily_budget is None and days > 0:
        daily_budget = budget / days
    elif daily_budget is None:
        daily_budget = budget

    persona_label = travel_style if travel_style else category

    return f"""You are a seasoned local travel writer and insider curator (writing in the editorial style of Monocle, Conde Nast Traveler, and Lonely Planet).
Create a bespoke, authentic, and realistic {days}-day travel itinerary for {destination}.

Trip Parameters:
- Destination: {destination}
- Duration: {days} days
- Total Budget: USD {budget:,.2f}
- Daily Budget Limit: USD {daily_budget:,.2f} per day
- Travel Persona / Style: {persona_label}

WRITING STYLE & TONE GUIDELINES (CRITICAL):
1. Editorial & Authentic Tone: Write with crisp, sophisticated, and engaging prose. Avoid generic tourist brochure talk.
2. BANNED AI CLICHÉS (DO NOT USE):
   - Never use phrases like "bustling metropolis", "rich tapestry", "mouthwatering culinary delights", "hidden gem", "without further ado", "feast for your senses", "a testament to", "embark on an unforgettable journey".
   - Do NOT write cheesy introductions or robotic concluding summaries. Start directly with the itinerary.
3. Hyper-Specific Local Venues: Always specify real venue names, neighborhoods, subway stations/lines, and specific signature dish recommendations.

TRAVEL PERSONA DIRECTIVES (STRICTLY ADAPT PACING, VENUES & ATMOSPHERE):
- If 'Family': Prioritize relaxed pacing, family-friendly dining with ample seating, low-stress transit routes, interactive cultural sites, and avoid exhausting non-stop walking or nightlife districts.
- If 'Solo': Curate safe and walkable neighborhood hubs, cozy social cafés/bookstores, vibrant cultural districts, and welcoming dining suitable for single travelers.
- If 'Backpacker': Focus on iconic social hostels, vibrant street food night markets, affordable public transit/metro passes, and free or low-cost walking explorations.
- If 'Romantic': Emphasize intimate bistros, scenic sunset viewpoints, atmospheric historic alleys, and charming scenic spots.
- If 'Adventure': Focus on nature trails, outdoor exploration, national parks, scenic hikes, and active pacing.
- If 'Luxury': Focus on 5-star premier hospitality, fine dining reservations, private transfers, and curated VIP access.
- If custom style ('{persona_label}'): Strictly tailor all activities, dining styles, and day pacing to embody the essence of '{persona_label}'.

STRICT BUDGET & REALISM RULES:
1. Hard Daily Budget Ceiling: Total expenditure for each day (Accommodation + Food + Transit + Activities) MUST NOT EXCEED USD {daily_budget:,.2f}.
2. Tier Realism:
   - Daily budget < $150/day: Recommend authentic hostels, boutique guesthouses, public transit, street food markets, and free/low-cost cultural walks. DO NOT suggest luxury 5-star hotels or expensive private transfers.
   - Daily budget $150–$350/day: Recommend stylish 3–4 star boutique hotels, neighborhood bistros, and regional express trains.
   - Daily budget $400+/day: Suggest premier 5-star luxury hotels, private tours, and fine dining.
3. Daily cost breakdown MUST realistically sum to <= USD {daily_budget:,.2f}.

FORMATTING STRUCTURE:
For EACH Day, provide:
- Header: ## Day X: [Catchy Thematic Title, e.g., "Old-Town Heritage & Back-Alley Dining"]
- ### Morning: 2 specific activities with location/neighborhood context.
- ### Afternoon: Cultural site, neighborhood stroll, or artisan shops with transit tips.
- ### Evening: Specific dinner recommendation (naming the restaurant or food street) & evening atmosphere.
- ### Insider Tip: 1 practical, non-obvious piece of advice (e.g., ticket booking in advance, secret viewpoint, optimal arrival time).
- ### Daily Cost Breakdown: Itemized estimates (Stay, Food, Transit, Activities) summing up to <= USD {daily_budget:,.2f}.

Additional Sections at the End:
- ## Essential Local Dishes & Where to Try Them
- ## Smart Navigation & Transit Advice
- ## Practical Packing & Local Etiquette Tips

Format output strictly as clean Markdown without emoji prefixes in headings."""

def generate_trip_recommendation(prompt: str) -> str:
    """
    Send prompt to Amazon Bedrock using Converse API and extract text response.
    """
    client = get_bedrock_client()
    model_id = os.getenv("MODEL_ID") or os.getenv("BEDROCK_MODEL_ID") or "amazon.nova-lite-v1:0"

    # CONCEPT: Amazon Bedrock Converse API request structure with expanded token capacity
    response = client.converse(
        modelId=model_id,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        inferenceConfig={
            "maxTokens": 5120,
            "temperature": 0.7,
            "topP": 0.9,
        }
    )

    # Extract the AI generated text response
    ai_response = response["output"]["message"]["content"][0]["text"]
    return ai_response
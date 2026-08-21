# ==============================================================================
# 4. BEDROCK SERVICE (Amazon Bedrock Converse API Orchestrator)
# ==============================================================================

import os
from dotenv import load_dotenv
import boto3

# Load environment variables from .env
load_dotenv()

def get_bedrock_client():
    """Create and return a configured Bedrock Runtime boto3 client."""
    return boto3.client(
        service_name="bedrock-runtime",
        region_name=os.getenv("AWS_REGION", "ap-southeast-2")
    )

def build_trip_prompt(destination: str, days: int, budget: float, category: str) -> str:
    """
    Build a comprehensive travel planner prompt.
    Requests: 
    - Structured daily plan: Morning (2-3 activities), Afternoon (cultural sites), Evening (dinner & nightlife)
    - Budget breakdown, local food, transportation, formatted strictly in Markdown.
    """
    return f"""You are an experienced and professional travel planner.
Please create a detailed {days}-day travel itinerary for {destination}.

Trip Details:
- Destination: {destination}
- Duration: {days} days
- Total Budget: USD {budget:,.2f}
- Travel Style / Category: {category}

Please structure the daily plan for EACH day with these specific time blocks:
1. Morning Activities: Provide 2-3 exciting activities to start the morning.
2. Afternoon Activities: Include cultural sites, iconic landmarks, and authentic local experiences.
3. Evening Activities: Suggest recommended dinner spots, local culinary highlights, and nightlife options.

Additional Sections to Include:
- Estimated Daily Budget Breakdown
- Local Food Recommendations (must-try dishes)
- Transportation Suggestions (how to navigate the city)
- Essential Travel Tips

Format your response strictly as clean Markdown with clear headers (## for Days, ### for Time Blocks/Sections) and bullet lists (-)."""

def generate_trip_recommendation(prompt: str) -> str:
    """
    Send prompt to Amazon Bedrock using Converse API and extract text response.
    """
    client = get_bedrock_client()
    model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

    # CONCEPT: Amazon Bedrock Converse API request structure
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
        ]
    )

    # Extract the AI generated text response
    ai_response = response["output"]["message"]["content"][0]["text"]
    return ai_response
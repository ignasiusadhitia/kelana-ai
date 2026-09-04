# ==============================================================================
# 4. SERVICES: Vector Retrieval Engine (Amazon Bedrock Agent Runtime)
# ==============================================================================

import os
import math
import boto3
from typing import List, Dict, Any, Optional

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Calculate cosine similarity between two numeric vectors in [-1.0, 1.0]."""
    if not vec_a or not vec_b:
        return 0.0
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return float(dot_product / (norm_a * norm_b))

class AWSKnowledgeBaseStore:
    """
    Connects directly to Amazon Bedrock Knowledge Base (AWS S3 Managed Search)
    using the official AWS bedrock-agent-runtime retrieve API.
    """
    def __init__(self):
        """Initialize the AWS Knowledge Base store with environment credentials."""
        self.kb_id = os.getenv("KNOWLEDGE_BASE_ID", "EW7EM5BPON")
        self.region = os.getenv("AWS_REGION", "ap-southeast-2")
        self.aws_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
        self._client = None

    def get_client(self):
        """Create or return the cached bedrock-agent-runtime boto3 client."""
        if self._client is None:
            self._client = boto3.client(
                "bedrock-agent-runtime",
                region_name=self.region,
                aws_access_key_id=self.aws_key,
                aws_secret_access_key=self.aws_secret
            )
        return self._client

    def search(self, query: str, top_k: int = 3, min_score: float = 0.30, min_similarity: Optional[float] = None) -> List[Dict[str, Any]]:
        """Retrieve relevant knowledge chunks directly from AWS Bedrock Knowledge Base."""
        if not self.kb_id:
            return []

        effective_min = min_similarity if min_similarity is not None else min_score

        try:
            client = self.get_client()
            response = client.retrieve(
                knowledgeBaseId=self.kb_id,
                retrievalQuery={"text": query}
            )

            raw_results = response.get("retrievalResults", [])
            chunks = []
            
            for r in raw_results:
                score = float(r.get("score", 0.0))
                if score < min_score:
                    continue

                content = r.get("content", {}).get("text", "").strip()
                location = r.get("location", {})
                s3_uri = location.get("s3Location", {}).get("uri", "")
                
                # Extract exact S3 filename
                if s3_uri:
                    filename = os.path.basename(s3_uri)
                else:
                    filename = "s3-document"

                doc_title = filename.replace(".md", "").replace(".pdf", "").replace("-", " ").replace("_", " ").title()

                chunks.append({
                    "content": content,
                    "source": filename,
                    "doc_title": doc_title,
                    "score": round(score, 4),
                    "s3_uri": s3_uri
                })

            return chunks[:top_k]

        except Exception as e:
            print(f"[AWS Knowledge Base Error] Failed to retrieve from KB {self.kb_id}: {e}")
            return []


# Global singleton instance
vector_store = AWSKnowledgeBaseStore()

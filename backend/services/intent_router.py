# ==============================================================================
# 4. SERVICES: Intent Router (Dynamic Query Classification & Routing)
# ==============================================================================

import time
import re
from enum import Enum
from typing import List, Dict, Any, Optional
from dataclasses import dataclass


# ------------------------------------------------------------------------------
# Part A: Intent Definitions & Keyword Catalogs
# ------------------------------------------------------------------------------

class IntentType(str, Enum):
    """Enumeration of recognized user prompt intent categories."""
    OUT_OF_SCOPE = "OUT_OF_SCOPE"              # Non-travel (pure math equations, coding, general politics)
    TRAVEL_INQUIRY = "TRAVEL_INQUIRY"          # Universal travel inquiry subject to Tier 2 semantic vector probe
    CONVERSATIONAL_META = "CONVERSATIONAL_META"  # Greetings, thank yous, role clarifications
    # Backward-compatibility aliases
    OFFICIAL_POLICY_RAG = "OFFICIAL_POLICY_RAG"
    CREATIVE_PLANNING = "CREATIVE_PLANNING"


@dataclass
class IntentResult:
    """Result container representing the outcome of intent classification."""
    intent: IntentType
    confidence: float
    matched_keywords: List[str]
    latency_ms: float
    reason: str


# Explicit Non-Travel / Out-of-Scope Patterns (Strict word-boundary matching)
OUT_OF_SCOPE_KEYWORDS = [
    # Programming & Code
    "python", "javascript", "typescript", "golang", "react", "html", "css", "sql query",
    "binary search", "regex", "debug code", "write a code", "syntax error", "coding",
    "pemrograman", "source code", "bikin fungsi", "buatkan fungsi", "write code",
    # Politics & Non-Travel Trivia
    "pilpres", "pemilu", "partai politik", "presiden prancis", "menteri", "dpr", "kpk",
    # Homework & Academic
    "tugas sekolah", "skripsi", "rumus fisika", "rumus kimia", "aljabar", "kalkulus",
    "algebra", "calculus", "write a poem", "buatkan puisi", "tulis puisi", "buatkan cerpen",
    "write an essay", "tulis esai"
]

GREETING_KEYWORDS = [
    "halo", "hai", "hello", "hi", "hey", "selamat pagi", "selamat siang", "selamat sore", "selamat malam",
    "siapa kamu", "who are you", "terima kasih", "makasih", "thanks", "thank you",
    "tugasmu", "tugas kamu", "apa tugasmu", "apa tugas kamu", "kemampuanmu", "bisa apa"
]

TRAVEL_DOMAIN_KEYWORDS = [
    "trip", "liburan", "wisata", "jalan-jalan", "itinerary", "jadwal", "hotel", "penginapan", "villa",
    "pantai", "gunung", "kuliner", "makanan", "restoran", "kafe", "cafe", "tiket", "pesawat", "kereta",
    "shinkansen", "tokyo", "kyoto", "osaka", "bali", "lombok", "singapore", "malaysia", "thailand", "japan",
    "jepang", "korea", "seoul", "bangkok", "destinasi", "budget", "biaya", "rekomendasi", "packing", "musim",
    "korea selatan", "indonesia", "luar negeri", "dollar", "usd", "idr", "rupiah", "yen", "jpy"
]


# ------------------------------------------------------------------------------
# Part B: Fast-Path Rule-Based Intent Classification & Context Augmentation
# ------------------------------------------------------------------------------

def classify_user_intent(query: str, history_count: int = 0) -> IntentResult:
    """
    Classify incoming user query with word-boundary precision:
    1. OUT_OF_SCOPE: Mathematical formulas / coding requests / non-travel politics (< 1ms, $0)
    2. CONVERSATIONAL_META: Pure standalone greetings & role inquiries (< 1ms, $0)
    3. TRAVEL_INQUIRY: Universal travel inquiry delegated to Tier 2 Semantic Vector Probe
    """
    start_time = time.perf_counter()
    q_lower = query.lower().strip()
    
    # Step 1: Detect pure mathematical calculations (both symbolic and verbal)
    math_symbols = bool(re.search(r"(?:^|\s)\d+\s*[\+\-\*/\^=]\s*\d+", q_lower))
    verbal_math_id = bool(re.search(r"\b(satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|\d+)\s*(tambah|kurang|kali|bagi)\s*(satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|\d+)", q_lower))
    verbal_math_en = bool(re.search(r"\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s*(plus|minus|times|divided by|\+)\s*(one|two|three|four|five|six|seven|eight|nine|ten|\d+)", q_lower))
    math_lead = bool(re.search(r"^\s*(hitung|calculate|solve|math|equation|what is\s+\d+)", q_lower))
    has_travel_calc = any(re.search(r"\b" + re.escape(kw) + r"\b", q_lower) for kw in ["dollar", "usd", "idr", "rupiah", "yen", "jpy", "biaya", "budget", "cost", "tiket", "ticket", "hotel", "hari", "days", "malam", "nights"])

    if (math_symbols or verbal_math_id or verbal_math_en or math_lead) and not has_travel_calc:
        elapsed = (time.perf_counter() - start_time) * 1000
        return IntentResult(
            intent=IntentType.OUT_OF_SCOPE,
            confidence=0.99,
            matched_keywords=["math_equation"],
            latency_ms=elapsed,
            reason="Pure mathematical calculation detected"
        )

    # Step 2: Check for explicit Out-of-Scope topics (programming, politics, homework)
    matched_travel = [kw for kw in TRAVEL_DOMAIN_KEYWORDS if re.search(r"\b" + re.escape(kw) + r"\b", q_lower)]
    matched_out_of_scope = []
    for kw in OUT_OF_SCOPE_KEYWORDS:
        if " " in kw:
            if kw in q_lower:
                matched_out_of_scope.append(kw)
        else:
            if re.search(r"\b" + re.escape(kw) + r"\b", q_lower):
                matched_out_of_scope.append(kw)

    if matched_out_of_scope and not matched_travel:
        elapsed = (time.perf_counter() - start_time) * 1000
        return IntentResult(
            intent=IntentType.OUT_OF_SCOPE,
            confidence=0.95,
            matched_keywords=matched_out_of_scope,
            latency_ms=elapsed,
            reason=f"Out-of-scope keywords: {matched_out_of_scope}"
        )

    # Step 3: Check for pure Conversational Greetings & Identity Inquiries (bypass S3 KB search)
    matched_greetings = [kw for kw in GREETING_KEYWORDS if kw in q_lower]
    if matched_greetings and len(q_lower.split()) <= 10 and not matched_travel:
        elapsed = (time.perf_counter() - start_time) * 1000
        return IntentResult(
            intent=IntentType.CONVERSATIONAL_META,
            confidence=0.90,
            matched_keywords=matched_greetings,
            latency_ms=elapsed,
            reason="Conversational greeting or role clarification"
        )

    # Step 4: Universal Travel Inquiry (delegated to Tier 2 Semantic Vector Probe)
    elapsed = (time.perf_counter() - start_time) * 1000
    return IntentResult(
        intent=IntentType.TRAVEL_INQUIRY,
        confidence=0.95,
        matched_keywords=matched_travel,
        latency_ms=elapsed,
        reason="Travel inquiry delegated to semantic vector grounding"
    )


def build_augmented_retrieval_query(current_query: str, history_messages: list) -> str:
    """
    Augment retrieval query with antecedent conversational context to prevent
    anaphora / pronoun semantic collapse in multi-turn retrieval (e.g. 'apakah itu dihitung per orang?').
    Only triggers when query contains explicit anaphoric markers, preventing corruption
    of independent questions in multi-turn conversations.
    """
    q_stripped = current_query.strip()
    q_lower = q_stripped.lower()
    
    anaphoric_markers = [
        "itu", "tersebut", "ini", "dendanya", "biayanya", "syaratnya", "aturannya",
        "it", "they", "them", "that", "those", "this", "the rule", "the fine"
    ]
    
    has_anaphora = any(re.search(rf"\b{re.escape(m)}\b", q_lower) for m in anaphoric_markers)
    
    # Only augment if there is prior history AND explicit anaphora to resolve
    if not history_messages or not has_anaphora:
        return q_stripped
        
    # Find the most recent user prompt in history
    last_user_content = ""
    for msg in reversed(history_messages):
        role = getattr(msg, "role", None) or (msg.get("role") if isinstance(msg, dict) else None)
        content = getattr(msg, "content", None) or (msg.get("content") if isinstance(msg, dict) else "")
        if role == "user" and content:
            last_user_content = content.strip()
            break
            
    if last_user_content:
        return f"{last_user_content} {q_stripped}"
        
    return q_stripped



# ------------------------------------------------------------------------------
# Part C: Multilingual Refusal Handlers
# ------------------------------------------------------------------------------

OUT_OF_SCOPE_REFUSAL_ID = (
    "Maaf, saya adalah asisten perjalanan KelanaAI. Saya hanya dapat membantu pertanyaan seputar "
    "perencanaan perjalanan, destinasi wisata, rekomendasi kuliner, dan regulasi perjalanan. "
    "Ada yang bisa saya bantu terkait rencana liburan Anda?"
)

OUT_OF_SCOPE_REFUSAL_EN = (
    "Sorry, I am the KelanaAI travel assistant. I can only assist with questions regarding "
    "travel planning, destinations, dining recommendations, and travel regulations. "
    "Is there anything I can help with regarding your trip?"
)

# Backward-compatibility alias
OUT_OF_SCOPE_REFUSAL = OUT_OF_SCOPE_REFUSAL_ID


def get_out_of_scope_refusal(query: str) -> str:
    """Return refusal in English or Indonesian matching the user's language."""
    q_lower = query.lower()
    id_markers = ["apa", "berapa", "sama dengan", "kenapa", "mengapa", "bagaimana", "tolong", "bisa", "kamu", "hitung", "saya", "halo", "adalah"]
    if any(re.search(rf"\b{m}\b", q_lower) for m in id_markers):
        return OUT_OF_SCOPE_REFUSAL_ID
    return OUT_OF_SCOPE_REFUSAL_EN


def get_security_refusal(query: str) -> str:
    """Return security injection refusal matching the user's language."""
    q_lower = query.lower()
    id_markers = ["apa", "berapa", "kenapa", "mengapa", "tolong", "bisa", "kamu", "saya", "abaikan", "perintah", "sistem"]
    if any(re.search(rf"\b{m}\b", q_lower) for m in id_markers):
        return (
            "Maaf, saya tidak dapat memproses perintah yang mencoba mengubah instruksi sistem atau mengakses konfigurasi sensitif. "
            "Saya dengan senang hati membantu Anda seputar perencanaan perjalanan, destinasi, atau regulasi resmi!"
        )
    return (
        "Sorry, I cannot process commands that attempt to override system instructions or reveal sensitive configuration. "
        "I am happy to assist you with any travel planning, itineraries, or official regulations!"
    )

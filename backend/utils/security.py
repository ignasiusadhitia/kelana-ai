# ==============================================================================
# 6. UTILITIES: Security Sanitizer (Input Sanitization & Prompt Injection Defense)
# ==============================================================================

import re

# High-risk jailbreak and instruction-override heuristics (English + Bahasa Indonesia)
JAILBREAK_PATTERNS = [
    # --- English: ignore / disregard instructions ---
    r"ignore\s+(all\s+)?(previous|prior|above|your|the)\s+(instructions|directives|prompts|rules|context|constraints)",
    r"disregard\s+(all\s+)?(previous|prior|above|your|the)\s+(instructions|directives|prompts|rules|context|constraints)",
    r"forget\s+(all\s+)?(previous|prior|above|your|the)\s+(instructions|directives|prompts|rules|context|constraints)",
    r"forget\s+everything\s+(above|before|prior|you.ve\s+been\s+told)",
    r"override\s+(your\s+)?(instructions|system\s+prompt|rules|constraints|guidelines)",

    # --- English: developer mode / jailbreak ---
    r"you\s+are\s+now\s+(in\s+developer\s+mode|dan|jailbroken|unrestricted|free)",
    r"act\s+as\s+(dan|an?\s+unrestricted\s+ai|an?\s+evil\s+ai|a\s+different\s+ai|a\s+new\s+ai)",
    r"pretend\s+(you\s+(have\s+no|are\s+without|don.t\s+have)\s+restrictions|you\s+are\s+(unrestricted|free|dan))",
    r"developer\s+mode\s+(enabled|on|activated)",
    r"bypass\s+(all\s+)?(filters|rules|guidelines|restrictions|safety)",
    r"jailbreak",

    # --- English: system prompt extraction ---
    r"system\s*prompt\s*(reveal|show|print|display|output|tell me|what is)",
    r"(print|show|reveal|output|display|tell me|repeat|write out)\s+(the\s+)?(full\s+)?(system\s+prompt|your\s+(instructions|directives|constraints|rules|configuration))",
    r"show\s+(me\s+)?(your\s+)?(internal|hidden|original|initial|base)\s+(prompt|instructions|directives)",
    r"what\s+(are|is)\s+your\s+(system\s+prompt|instructions|directives|initial\s+prompt|base\s+prompt)",
    r"reveal\s+(your\s+)?(aws|database|secret|api|environment)\s+(key|keys|credentials|token)",

    # --- Bahasa Indonesia: abaikan / lupakan instruksi ---
    r"abaikan\s+(semua\s+)?(instruksi|perintah|aturan|konteks|panduan|batasan|prompt)",
    r"lupakan\s+(semua\s+)?(instruksi|perintah|aturan|konteks|panduan|batasan|prompt|sistem|system)",
    r"lupakan\s+semua",
    r"ignore\s+(semua\s+)?(instruksi|perintah|aturan)",
    r"abaikan\s+semua",
    r"lakukan\s+(saja\s+)?apa\s+(yang\s+)?(ku|saya|aku|gue)\s+(minta|perintahkan|suruh|bilang)",
    r"ikuti\s+(saja\s+)?perintah(ku|mu|saya)",

    # --- Bahasa Indonesia: developer mode / jailbreak ---
    r"kamu\s+sekarang\s+(bebas|tidak\s+terbatas|tidak\s+ada\s+aturan|tanpa\s+batasan)",
    r"pura.pura\s+(kamu\s+)?(adalah\s+)?(ai|bot|asisten)\s+(lain|baru|bebas|tanpa\s+aturan)",
    r"berpura.pura\s+(kamu\s+)?(adalah\s+)?(ai|bot|asisten)\s+(lain|baru|bebas|tanpa\s+aturan)",
    r"bertindak\s+sebagai\s+(ai|bot|asisten)\s+(lain|baru|bebas|tanpa\s+aturan|tanpa\s+batasan)",
    r"kamu\s+(tidak\s+punya|bebas\s+dari|tanpa)\s+(aturan|batasan|pembatasan|instruksi|sistem)",

    # --- Bahasa Indonesia: ekstrak system prompt ---
    r"(tampilkan|tunjukkan|ceritakan|beritahu|tulis|ulangi|print)\s+(system\s+prompt|instruksi\s+sistem|prompt\s+awal|prompt\s+asli|instruksi\s+asli)",
    r"apa\s+(instruksi|perintah|aturan|panduan|system\s+prompt)\s+(kamu|anda|mu|yang\s+diberikan)",
    r"(bocorkan|ungkap|reveal)\s+(system\s+prompt|instruksi\s+sistem|konfigurasi)",
]

COMPILED_JAILBREAK = [re.compile(p, re.IGNORECASE) for p in JAILBREAK_PATTERNS]

def sanitize_user_input(text: str) -> tuple[str, bool]:
    """
    Sanitize incoming user query to prevent prompt injection and delimiter spoofing:
    1. Replaces XML/Markdown structural spoofing tags (e.g. </user_query>, <system>).
    2. Strips control characters.
    3. Checks against known injection patterns (English + Bahasa Indonesia).
    Returns:
        (sanitized_text, is_suspicious)
    """
    if not text:
        return "", False

    # Step 1: Neutralize XML tag breakout attempts
    clean = (
        text.replace("<user_query>", "[user_query]")
        .replace("</user_query>", "[/user_query]")
        .replace("<context>", "[context]")
        .replace("</context>", "[/context]")
        .replace("<system>", "[system]")
        .replace("</system>", "[/system]")
        .replace("<instructions>", "[instructions]")
        .replace("</instructions>", "[/instructions]")
    )

    # Step 2: Detect known jailbreak / prompt leak exploits
    is_suspicious = any(pattern.search(clean) for pattern in COMPILED_JAILBREAK)

    return clean.strip(), is_suspicious


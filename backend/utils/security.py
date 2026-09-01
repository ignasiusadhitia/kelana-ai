# ==============================================================================
# PROMPT INJECTION GUARD & SECURITY SANITIZATION (Defense-in-Depth for RAG)
# ==============================================================================

import re

# High-risk jailbreak and instruction-override heuristics
JAILBREAK_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|prompts|rules)",
    r"disregard\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|prompts|rules)",
    r"you\s+are\s+now\s+(in\s+developer\s+mode|dan|jailbroken|unrestricted)",
    r"act\s+as\s+(dan|an\s+unrestricted\s+ai|an\s+evil\s+ai)",
    r"system\s*prompt\s*reveal",
    r"print\s+(the\s+)?(full\s+)?system\s+prompt",
    r"show\s+(me\s+)?(your\s+)?internal\s+prompt",
    r"developer\s+mode\s+enabled",
    r"bypass\s+all\s+(filters|rules|guidelines)",
    r"reveal\s+(your\s+)?(aws|database|secret|api)\s+key",
]

COMPILED_JAILBREAK = [re.compile(p, re.IGNORECASE) for p in JAILBREAK_PATTERNS]

def sanitize_user_input(text: str) -> tuple[str, bool]:
    """
    Sanitize incoming user query to prevent prompt injection and delimiter spoofing:
    1. Replaces XML/Markdown structural spoofing tags (e.g. </user_query>, <system>).
    2. Strips control characters.
    3. Checks against known injection patterns.
    Returns:
        (sanitized_text, is_suspicious)
    """
    if not text:
        return "", False

    # Neutralize XML tag breakout attempts
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

    # Detect known jailbreak / prompt leak exploits
    is_suspicious = any(pattern.search(clean) for pattern in COMPILED_JAILBREAK)

    return clean.strip(), is_suspicious

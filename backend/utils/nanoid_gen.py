import secrets
import string

# URL-safe alphanumeric alphabet (62 characters: 0-9, a-z, A-Z)
ALPHABET = string.digits + string.ascii_letters

def generate_id(prefix: str, length: int = 16) -> str:
    """
    Generates a cryptographically secure, collision-resistant, URL-safe identifier.
    Pattern: <prefix>_<random_alphanumeric_16_chars>
    Example: usr_k7x9p2m4a1b0c8d5, trp_9f8a7b6c5d4e3a2b
    """
    random_chars = "".join(secrets.choice(ALPHABET) for _ in range(length))
    return f"{prefix}_{random_chars}"

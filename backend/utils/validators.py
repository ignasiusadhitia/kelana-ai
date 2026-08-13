# ==============================================================================
# 2. VALIDATION RULES (small and independent function)
# ==============================================================================

def val_string(val: str) -> str:
    """Ensure the text is not blank and has a reasonable length."""
    if len(val) < 2:
        # 'raise' stop this function's execution immediately
        # and passes the message to the 'except' block in the prompt() function above.
        raise ValueError("Minimal input must be at least 2 characters long and cannot be empty.")
    
    # Smart Capitalization (Auto-format)
    # If the input only 2 or 3 characters long (e.g., "uk", "usa", "uae"), convert all to uppercase.
    if len(val) <= 3:
        return val.upper()

    # If more than 3 characters long (e.g. "japan", "united states"), convert to Title Case.
    # .title() automatically converts "united states" into "United States".
    else:
        return val.title()

def val_days(val: str) -> int:
    """Ensure the duration is a valid integer."""
    # If 'val' contains alphabets, this line will raise a ValueError.
    days = int(val)

    if days < 1:
        raise ValueError("Minimum duration is 1 day!")
    return days

def val_budget(val: str) -> float:
    """Ensure budget is a valid decimal or integer number."""
    budget = float(val)
    if budget <= 0:
        raise ValueError("Budget must be greater than 0!")
    return budget

def val_currency(val: str) -> str:
    """Ensure the currency code consists of 3 alphabetic characters."""
    # convert to uppercase (usd -> USD)
    val = val.upper()
    
    # .isalpha() ensures the value contains only aphabet, not numbers or symbols.
    if len(val) != 3 or not val.isalpha():
        raise ValueError("Use a 3-letter currency code (e.g., USD, IDR)!")
    return val

def val_month(val: str) -> str:
    """Ensure the value is a valid English month."""
    # Use a Tuple () because it is static data and processed faster than a List [].
    valid_months = (
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    )

    if val.lower() not in valid_months:
        raise ValueError("Invalid month! Please use English format.")
    
    # .title() capitalizes the first letter ("december" -> "December")
    return val.title()

def val_destinations(val: str) -> list:
    """Ensure at least one destination is provided."""
    # Check if the raw input is blank before processing.
    # Catches cases like "" or "  " before we even try to split.
    if not val.strip():
        raise ValueError("Please enter at least one destination.")

    # Split input by comma, strip whitespace from each item, and remove empty strings.
    # e.g. "japan, korea, " -> ["Japan", "Korea"]
    # e.g. "  ,  ,  " -> [] (all items removed, caught by the check below)
    destinations = [item.strip() for item in val.split(",") if item.strip()]

    # Secondary check: catches cases like "," or " , , " where split produces an empty list.
    if not destinations:
        raise ValueError("Please enter at least one valid destination, separated by commas.")
            
    # Reuse val_string to format each destination (uppercase if <= 3 chars, title case otherwise)
    return [val_string(d) for d in destinations]
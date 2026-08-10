# ==============================================================================
# 1. CORE PROMPT ENGINE
# ==============================================================================

def prompt(message: str, validator):
    """
    Core prompt engine to request input from the user and validate its values.
    """
    # while True creates an infinite loop. It will run until it hits a 'return' statement.
    while True:
        try:
            #1. input(message) = displays the text and retrieves user input
            #2. .strip() = remove leading and trailing whitespaces
            #3. Passes the result to the 'validator' function (a callback)
            return validator(input(message).strip())

        # except catches error
        # ValueError as e catches the specific error message raised by our validator function
        except ValueError as e:
            print(f" -> Error: {e}")

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

# ==============================================================================
# 3. VIEW FUNCTION (Formatted output)
# ==============================================================================

# -> None means this function only executes a process and does not return any value.
def print_trip_summary(destination: str, country: str, days: int, budget: float, currency: str, travel_month: str) -> None:
    # Print title
    print("\n========================")
    print("KelanaAI")
    print("========================")

    # Use f-string (f"...") to inject variables into text dynamically.
    # {:<20} creates a left-aligned padding of 20 characters so colons align perfectly.
    print(f"{'Destination':<20}: {destination}")
    print(f"{'Country':<20}: {country}")

    # Format days with international thousands separator (e.g., 1,500 days)
    days_display = f"{days:,}"
    print(f"{'Days':<20}: {days_display}")
       
    # Format budget with international thousands separator (e.g. 1,500.00 or 1,500.50) and fixed 2 decimal places
    budget_display = f"{budget:,.2f}"
    print(f"{'Budget':<20}: {budget_display} {currency}")

    print(f"{'Currency':<20}: {currency}")
    print(f"{'Travel Month':<20}: {travel_month}")

# ==============================================================================
# 4. MAIN CONTROLLER
# ============================================================================== 

def main() -> None:
    # Call the prompt() function and pass the respective validation functions as callback.
    destination = prompt("Destination: ", val_string)
    country = prompt("Country: ", val_string)
    days = prompt("Days: ", val_days)
    budget = prompt("Budget: ", val_budget)
    currency = prompt("Currency: ", val_currency)
    travel_month = prompt("Travel Month: ", val_month)

    # Print the final formatted results
    print_trip_summary(destination, country, days, budget, currency, travel_month)

# ==============================================================================
# ENTRY POINT
# ==============================================================================

# Ensure main() only runs if this file is executed directly ('python main.py').
# Prevents execution if this file is imported as a module by another file.
if __name__ == "__main__":
    main()
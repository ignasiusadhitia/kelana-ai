# ==============================================================================
# 5. MAIN CONTROLLER
# ==============================================================================
# Note: Section numbers follow the app execution order:
# 1. prompt_engine.py   -> Core input loop
# 2. validators.py      -> Input validation rules
# 3. trip_services.py   -> Business logic
# 4. trip_views.py      -> View functions
# 5. main.py            -> Controller + Entry point
# ==============================================================================

from utils.prompt_engine import prompt
from utils.validators import val_budget, val_currency, val_days, val_month, val_string, val_destinations
from views.trip_views import print_trip_summary


def main() -> None:
    # Call the prompt() function and pass the respective validation functions as callback.    

    # Accept multiple destinations separated by commas (e.g. "Japan", "Korea")
    destinations = prompt("Destinations (comma separated): ", val_destinations)
    country = prompt("Country: ", val_string)
    days = prompt("Days: ", val_days)
    budget = prompt("Budget: ", val_budget)
    currency = prompt("Currency: ", val_currency)
    travel_month = prompt("Travel Month: ", val_month)

    # Print the final formatted results
    print_trip_summary(destinations, country, days, budget, currency, travel_month)

# ==============================================================================
# ENTRY POINT
# ==============================================================================

# Ensure main() only runs if this file is executed directly ('python main.py').
# Prevents execution if this file is imported as a module by another file.
if __name__ == "__main__":
    main()
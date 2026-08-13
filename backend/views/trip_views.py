# ==============================================================================
# 4. VIEW FUNCTIONS (Formatted output)
# ==============================================================================

from services.trip_services import calculate_daily_budget, get_trip_category, get_trip_transportation_recommendation, get_recommended_places

# -> dict means this function returns a structured dictionary of trip data for one destination.
def build_trip_summary(destination: str, country: str, days: int, budget: float, currency: str, travel_month: str, category: str, transportation, places) -> dict:
    """Prepare and format all trip data for a single destination into a structured dict."""
    return {
        "destination"   : destination,
        "country"       : country,
        # Format days with international thousands separator (e.g., 1,500 days)
        "days"          : f"{days:,}",
        # Format budget with international thousands separator (e.g., 1,500.00) and fixed 2 decimal places
        "budget"        : f"{budget:,.2f} {currency}",
        "currency"      : currency,
        # Classify the trip style and calculate average spending per day
        "category"      : category,
        "daily_budget"  : f"{calculate_daily_budget(budget, days):,.2f} {currency}/Day",
        "travel_month"  : travel_month,
        "transportation": transportation,
        "places"        : places,
    }

# -> None means this function only executes a process and does not return any value.
def print_trip_summary(destinations: list, country: str, days: int, budget: float, currency: str, travel_month: str) -> None:
    """Loop each destination, build its summary, then print each one."""
    # get_recommended_places returns a dict: {destinations: [places] or ValueError}
    recommendations = get_recommended_places(destinations)

    # Loop each destination and print a separate summary block for each one:
    for destination in destinations:
        # Calculate trip category based on total budget.
        category = get_trip_category(budget)

        # Look up transportation recommendation based on trip category.
        transportation = get_trip_transportation_recommendation(category)

        # Build the summary dict for this destination.
        summary = build_trip_summary(
            destination,
            country,
            days,
            budget,
            currency,
            travel_month,
            category,
            transportation,
            recommendations[destination]
        )

        # Print title
        print("\n========================")
        print("KelanaAI")
        print("========================")
        # Use f-string (f"...") to inject variables into text dynamically.
        # {:<20} creates a left-aligned padding of 20 characters so colons align perfectly.
        print(f"{'Destination':<20}: {summary['destination']}")
        print(f"{'Country':<20}: {summary['country']}")                
        print(f"{'Days':<20}: {summary['days']}")
        print(f"{'Budget':<20}: {summary['budget']}")        
        print(f"{'Currency':<20}: {summary['currency']}")
        print(f"{'Category':<20}: {summary['category']}")
        print(f"{'Daily Budget':<20}: {summary['daily_budget']}")
        print(f"{'Travel Month':<20}: {summary['travel_month']}")
        
        # isinstance() checks if a variable is an instance of a specific type or class.
        if isinstance(summary['transportation'], ValueError):
            # It's an error - print the message directly.
            print(f"\n{'Recommended Transportation':<20}: -> {summary['transportation']}")
        else:
            print(f"\n{'Recommended Transportation':<20}: {summary['transportation']}")    

        print(f"\nRecommended Places\n")

        # isinstance() checks if a variable is an instance of a specific type or class.
        if isinstance(summary['places'], ValueError):
            # It's an error - print the message directly.
            print(f" -> {summary['places']}")
        else:
            # It's a list - print each place.
            for place in summary['places']:
                print(f" - {place}")
        
        print(f"\n")


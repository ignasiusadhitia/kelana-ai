# ==============================================================================
# CONSTANTS: TRAVEL SEASONS
# ==============================================================================

# Static lookup table mapping travel months to their season classification.
# Add or update season mappings here without touching trip_services.py
TRAVEL_SEASONS = {
    "December" : "Peak Season",
    "June"     : "Holiday Season" ,
}

# Default season when the month is not listed above.
DEFAULT_SEASON = "Regular Season"
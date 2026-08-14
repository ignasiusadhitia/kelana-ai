# ==============================================================================
# CONSTANTS: TRIP CATEGORIES
# ==============================================================================

# Static lookup table mapping budget thresholds to their trip category.
# Add or update category rules here without touching trip_services.py.
TRIP_CATEGORIES: list[tuple[int, str]] = [
    (999, "Backpacker"),
    (3000, "Standard"),
]


# Default category when exceeds all thresholds above.
DEFAULT_CATEGORY: str = "Luxury"
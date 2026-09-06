import unittest
from fastapi.testclient import TestClient

from utils.validators import (
    val_string,
    val_days,
    val_budget,
    val_currency,
    val_month,
    val_destinations,
)
from main import app

class TestKelanaAIValidators(unittest.TestCase):
    """Unit test suite verifying input sanitizer and validator functions."""

    # ====================================================
    # 1. TEST STRING VALIDATION (val_string)
    # ====================================================
    def test_val_string_valid(self):
        """Verify that valid destination names are properly title-cased."""
        self.assertEqual(val_string("japan"), "Japan")
        self.assertEqual(val_string("united states"), "United States")
    
    def test_val_string_short_uppercase(self):
        """Verify that short country codes are preserved in uppercase."""
        self.assertEqual(val_string("uk"), "UK")
        self.assertEqual(val_string("usa"), "USA")

    def test_val_string_too_short(self):
        """Verify that strings shorter than minimum length raise ValueError."""
        with self.assertRaises(ValueError):
            val_string("a")

    # ====================================================
    # 2. TEST DAY VALIDATION (val_days)
    # ====================================================
    def test_val_days_valid(self):
        """Verify that valid integer day strings are parsed correctly."""
        self.assertEqual(val_days("5"), 5)
        self.assertEqual(val_days("30"), 30)
    
    def test_val_days_invalid_number(self):
        """Verify that zero or negative day counts raise ValueError."""
        with self.assertRaises(ValueError):
            val_days("0")
        with self.assertRaises(ValueError):
            val_days("-3")
    
    def test_val_days_not_an_integer(self):
        """Verify that non-numeric or float day inputs raise ValueError."""
        with self.assertRaises(ValueError):
            val_days("lima")
        with self.assertRaises(ValueError):
            val_days("5.5")
    
    # ====================================================
    # 3. TEST BUDGET VALIDATION (val_budget)
    # ====================================================
    def test_val_budget_valid(self):
        """Verify that positive numeric budget values are parsed as floats."""
        self.assertEqual(val_budget("1500"), 1500.0)
        self.assertEqual(val_budget("1500.50"), 1500.5)

    def test_val_budget_invalid_number(self):
        """Verify that zero or negative budgets raise ValueError."""
        with self.assertRaises(ValueError):
            val_budget("0")
        with self.assertRaises(ValueError):
            val_budget("-100")
    
    def test_val_budget_not_a_number(self):
        """Verify that non-numeric budget inputs raise ValueError."""
        with self.assertRaises(ValueError):
            val_budget("mahal")
    
    # ====================================================
    # 4. TEST CURRENCY VALIDATION (val_currency)
    # ====================================================
    def test_val_currency_valid(self):
        """Verify that 3-letter currency codes are uppercased and validated."""
        self.assertEqual(val_currency("usd"), "USD")
        self.assertEqual(val_currency("idr"), "IDR")

    def test_val_currency_invalid_length(self):
        """Verify that currency codes not of length 3 raise ValueError."""
        with self.assertRaises(ValueError):
            val_currency("US")
        with self.assertRaises(ValueError):
            val_currency("USDT")

    def test_val_currency_contains_number(self):
        """Verify that currency codes containing digits raise ValueError."""
        with self.assertRaises(ValueError):
            val_currency("US1")

    # ====================================================
    # 5. TEST MONTH VALIDATION (val_month)
    # ====================================================
    def test_val_month_valid(self):
        """Verify that valid English calendar month names are parsed correctly."""
        self.assertEqual(val_month("december"), "December")
        self.assertEqual(val_month("JANUARY"), "January")

    def test_val_month_invalid(self):
        """Verify that non-English or invalid month names raise ValueError."""
        with self.assertRaises(ValueError):
            val_month("Desember")
        with self.assertRaises(ValueError):
            val_month("Bulan Purnama")

    # ====================================================
    # 6. TEST DESTINATIONS VALIDATION (val_destinations)
    # ====================================================
    def test_val_destinations_valid(self):
        """Verify that comma-delimited destination lists are split and sanitized."""
        result = val_destinations("japan, korea, usa")
        self.assertEqual(result, ["Japan", "Korea", "USA"])

    def test_val_destinations_empty(self):
        """Verify that empty or blank destination inputs raise ValueError."""
        with self.assertRaises(ValueError):
            val_destinations("")
        with self.assertRaises(ValueError):
            val_destinations("  ,  ")

class TestFastAPIMainApp(unittest.TestCase):
    """Integration test suite verifying core FastAPI endpoints."""

    def setUp(self):
        """Initialize FastAPI test client."""
        self.client = TestClient(app)

    def test_root_endpoint(self):
        """Verify that root API endpoint returns 200 with welcome message."""
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("Welcome to KelanaAI API", res.json()["message"])

    def test_health_endpoint(self):
        """Verify that /health endpoint returns 200 OK with database connectivity status."""
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "OK")
        self.assertIn("database", data)

if __name__ == "__main__":
    unittest.main()
            

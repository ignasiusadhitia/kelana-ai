import unittest
from unittest.mock import patch
from io import StringIO
# Import module from main.py (ensure main.py is inside backend folder)
from backend.main import val_string, val_days, val_budget, val_currency, val_month, prompt, print_trip_summary

class TestKelanaAIApp(unittest.TestCase):

    # ====================================================
    # 1. TEST STRING VALIDATION (val_string)
    # ====================================================
    def test_val_string_valid(self):
        # Normal scenario: converts into title case
        self.assertEqual(val_string("japan"), "Japan")
        self.assertEqual(val_string("united states"), "United States")
    
    def test_val_string_short_uppercase(self):
        # Specific scenario: 3-letter code converts into uppercase
        self.assertEqual(val_string("uk"), "UK")
        self.assertEqual(val_string("usa"), "USA")

    def test_val_string_too_short(self):
        # Error scenario: shorter than 2 charcters
        with self.assertRaises(ValueError):
            val_string("a")

    # ====================================================
    # 2. TEST DAY VALIDATION (val_days)
    # ====================================================
    def test_val_days_valid(self):
        # Normal scenario
        self.assertEqual(val_days("5"), 5)
        self.assertEqual(val_days("30"), 30)
    
    def test_val_days_invalid_number(self):
        # Error scenario: value under 1
        with self.assertRaises(ValueError):
            val_days("0")
        with self.assertRaises(ValueError):
            val_days("-3")
    
    def test_val_days_not_an_integer(self):
        # Error scenario: alphabet or decimal are not allowed
        with self.assertRaises(ValueError):
            val_days("lima")
        with self.assertRaises(ValueError):
            val_days("5.5")
    
    # ====================================================
    # 3. TEST BUDGET VALIDATION (val_budget)
    # ====================================================
    def test_val_budget_valid(self):
        # Normal scenario: Integer number or decimal (float)
        self.assertEqual(val_budget("1500"), 1500.0)
        self.assertEqual(val_budget("1500.50"), 1500.5)

    def test_val_budget_invalid_number(self):
        # Error scenario: Zero or negative
        with self.assertRaises(ValueError):
            val_budget("0")
        with self.assertRaises(ValueError):
            val_budget("-100")
    
    def test_val_budget_not_a_number(self):
        # Error scenario: alphabet inserted into budget
        with self.assertRaises(ValueError):
            val_budget("mahal")
    
    # ====================================================
    # 4. TEST CURRENCY VALIDATION (val_currency)
    # ====================================================
    def test_val_currency_valid(self):
        # Normal scenario: 3 letters convert automatically into uppercase
        self.assertEqual(val_currency("usd"), "USD")
        self.assertEqual(val_currency("idr"), "IDR")

    def test_val_currency_invalid_length(self):
        # Error scenario: more or less than 3 letters
        with self.assertRaises(ValueError):
            val_currency("US")
        with self.assertRaises(ValueError):
            val_currency("USDT")

    def test_val_currency_contains_number(self):
        # Error scenario: contains numbers or symbols
        with self.assertRaises(ValueError):
            val_currency("US1")

    # ====================================================
    # 5. TEST MONTH VALIDATION (val_month)
    # ====================================================
    def test_val_month_valid(self):
        # Normal scenario: Valid month in English (case-insensitive)
        self.assertEqual(val_month("december"), "December")
        self.assertEqual(val_month("JANUARY"), "January")

    def test_val_month_invalid(self):
        # Error scenario: invalid month
        with self.assertRaises(ValueError):
            val_month("Desember") # Indonesian format
        with self.assertRaises(ValueError):
            val_month("Bulan Purnama") # Random month name
    
    # ====================================================
    # 6. TEST CORE PROMPT ENGINE (Mocking Input)
    # ====================================================
    @patch('builtins.input', side_effect=["invalid", "5"])
    def test_prompt_retry_mechanism(self, mock_input):
        """
        To test if the prompt() function succeeds in looping (retry)
        when the user inputs an invalid value on the first try, then a valid one on the second try.
        """
        # First try inputs "invalid" (will raise ValueError on val_days, then loop continues)
        # Second try inputs "5" (valid and returns integer 5)
        result = prompt("Days: ", val_days)
        self.assertEqual(result, 5)

    # ====================================================
    # 7. TEST VIEW OUTPUT (Print Summary)
    # ====================================================
    @patch('sys.stdout', new_callable=StringIO)
    def test_print_trip_summary(self, mock_stdout):
        """
        To test if print_trip_summary() successfully formats and outputs
        the expected trip summary text to the console.
        """
        # Execute print function using dummy data
        print_trip_summary("Japan", "Japan", 1500, 1500.0, "USD", "December")

        # Capture the printed text from the simulated stdout stream
        output = mock_stdout.getvalue()

        # Verify that essential data points exists in the output stream
        self.assertIn("KelanaAI", output)
        self.assertIn("Japan", output)
        self.assertIn("1,500", output)
        self.assertIn("1,500.00 USD", output) # Ensure formatter number and currency concatenated correctly
        self.assertIn("December", output)

if __name__ == "__main__":
    unittest.main()
            

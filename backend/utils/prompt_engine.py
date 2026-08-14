# ==============================================================================
# 1. CORE PROMPT ENGINE
# ==============================================================================

from typing import Callable, Any

def prompt(message: str, validator: Callable[[str], Any]) -> Any:
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
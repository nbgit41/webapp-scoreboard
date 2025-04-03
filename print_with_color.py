
from colorama import init, Fore, Style

# Initialize colorama once when the module is imported.
init(autoreset=True)

def print_with_color(text, color="white") -> None:
    """
    Print the given text using the specified color.

    Parameters:
      text (str): The string to be printed.
      color (str): The name of the color (e.g., "BLACK", "RED", "GREEN", "YELLOW", "BLUE", "MAGENTA", "CYAN", "WHITE") or
      a hex code (e.g., "#FF5733"). For hex codes, your terminal must support true color.
    """
    # Check if the color is provided as a hex code.
    try:
        if isinstance(color, str) and color.startswith('#') and len(color) == 7:
            try:
                # Convert the hex code to RGB components.
                r = int(color[1:3], 16)
                g = int(color[3:5], 16)
                b = int(color[5:7], 16)
            except ValueError:
                raise ValueError(f"'{color}' is not a valid hex code.")

            # Construct ANSI escape sequence for true color (foreground).
            ansi_color = f'\033[38;2;{r};{g};{b}m'
            reset = "\033[0m"
            print(ansi_color + text + reset)
        else:
            # Assume the color is a named color and use colorama.
            color_attr = getattr(Fore, color.upper(), None)
            if color_attr is None:
                raise ValueError(
                    f"'{color}' is not a valid color. Use a named color provided by colorama.Fore or a hex code."
                )
            print(color_attr + text + Style.RESET_ALL)
    except Exception as e:
        print(e)
        print(text)

# # Example usage:
# # Using a named color
# print_with_color("Hello, world!", "red")
# # Using a hex code (ensure your terminal supports true color)
# print_with_color("Hello, hex world!", "#FF5733")
#
# print_with_color("If this sentence turns green, you've unlocked broccoli mode. "
#                  "If it's red, panic gently. "
#                  "Blue? Congratulations, you're officially aquatic. "
#                  "Anything else? Consult your local wizard immediately.",
#                  "#ffff00")
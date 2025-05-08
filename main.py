from flask import Flask, render_template, request, jsonify
import logging, time, json, os, re
# my modules
from print_with_color import print_with_color

# Load configuration from config.json if it exists; otherwise, use default values.
config_file = "config.json"
if os.path.exists(config_file):
    try:
        with open(config_file, "r") as f:
            config = json.load(f)
    except Exception as e:
        print("Error reading config.json, using default settings.", e)
        config = {}
else:
    config = {}

deb = config.get("deb", True)
port_poggies = config.get("port", 8540)
run_locally = config.get("run_locally", True)
GAME_FILE = "game.json"

# Global dictionary to store baseball state
baseball_stats = {
    "balls": 0,
    "strikes": 0,
    "outs": 0,
    "inning": 0
}

# map of color names → hex codes
DEFAULT_PRESET_COLORS = {
    "blue":   "#4287f5",
    "red":    "#FF0000",
    "green":  "#00FF00",
    "yellow": "#FFFF00",
    "orange": "#FFA500",
    "purple": "#800080",
    "black":  "#000000",
    "white":  "#FFFFFF",
    "pink": "#FFC0CB",
    "cyan": "#00FFFF",
    "magenta": "#FF00FF",
    "lime": "#00FF00",
    "navy": "#000080",
    "teal": "#008080",
    "olive": "#808000",
    "maroon": "#800000",
    "gray": "#808080",
    "silver": "#C0C0C0",
    "gold": "#FFD700",
    "brown": "#A52A2A",
    "coral": "#FF7F50",
    "indigo": "#4B0082",
    "violet": "#EE82EE",
    "turquoise": "#40E0D0",
    "salmon": "#FA8072",
}

# after loading `config = json.load(...) or {}`
PRESET_COLORS = config.get("preset_colors", DEFAULT_PRESET_COLORS)

# Timer state variables
countdown_duration = 120  # default duration in seconds (e.g., 5 minutes)
timer_remaining = countdown_duration
timer_start = None        # time when the timer was started/resumed
timer_running = False     # flag to track if the timer is running

baseball_stuff = False
timer_toggle = False

# Set the Werkzeug logger to only show errors (thus ignoring normal request logs)
logging.getLogger('werkzeug').setLevel(logging.ERROR)

app = Flask(__name__)

app.config["TEMPLATES_AUTO_RELOAD"] = True # this is the thing that makes it so that I don't have to reload the entire python file for a html change



def normalize_color(input_color: str) -> str:
    """
    Look up a preset name in PRESET_COLORS or validate a #RRGGBB hex.
    """
    val = input_color.strip().lower()
    if val in PRESET_COLORS:
        return PRESET_COLORS[val]
    m = re.fullmatch(r'#?([0-9a-f]{6})', val)
    if m:
        return "#" + m.group(1)
    raise ValueError(f"Invalid color: {input_color}")




@app.route("/get-game-json")
def get_game_json():
    with open(GAME_FILE, "r") as game_file:
        game_data = json.load(game_file)
    return jsonify(game_data)

@app.route("/change-score/<team>/<amount>")
def change_scores(team, amount):

    try:
        amount = int(amount)
    except ValueError:
        return jsonify({"error": "Invalid amount"}), 400

    # Load game data from file
    with open(GAME_FILE, "r") as game_file:
        game_data = json.load(game_file)

    # Ensure Scores exists and is initialized for each team
    if "Scores" not in game_data or len(game_data["Scores"]) != len(game_data["Teams"]):
        game_data["Scores"] = [0] * len(game_data["Teams"])

    # Look up the team index
    try:
        team_index = game_data["Teams"].index(team)
    except ValueError:
        return jsonify({"error": f"Team {team} not found"}), 404

    # Update the team’s score (adding the amount)
    game_data["Scores"][team_index] += amount

    # Write back the updated data to the JSON file
    with open(GAME_FILE, "w") as game_file:
        json.dump(game_data, game_file)

    return jsonify(game_data)

@app.route("/get-scores")
def get_scores():
    with open(GAME_FILE, "r") as game_file:
        game_data = json.load(game_file)
    return jsonify(game_data)

@app.route("/add-team", methods=["POST"])
def add_team():
    data = request.get_json()
    team_name   = data.get("teamName")
    raw_points  = data.get("teamPoints")
    raw_color   = data.get("teamColor", "")

    if not team_name or raw_points is None or not raw_color:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        team_points = int(raw_points)
    except ValueError:
        return jsonify({"error": "Invalid team points value"}), 400

    # normalize color (hex or preset name)
    try:
        team_color = normalize_color(raw_color)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    with open(GAME_FILE, "r") as f:
        game_data = json.load(f)

    game_data.setdefault("Teams", [])
    game_data.setdefault("Scores", [])
    game_data.setdefault("Colors", [])

    game_data["Teams"].append(team_name)
    game_data["Scores"].append(team_points)
    game_data["Colors"].append(team_color)

    with open(GAME_FILE, "w") as f:
        json.dump(game_data, f)

    return jsonify(game_data)


# @app.route("/change-team", methods=["POST"])
# def change_team():
#     data = request.get_json()
#     team_name    = data.get("teamName", "").strip()
#     new_name     = data.get("teamNewName", "").strip()
#     raw_points   = data.get("teamPoints", "").strip()
#     raw_color    = data.get("teamColor", "").strip()
#
#     # Must at least specify which team to change
#     if not team_name:
#         return jsonify({"error": "Missing teamName"}), 400
#
#     # Load game data
#     with open(GAME_FILE, "r") as f:
#         game_data = json.load(f)
#
#     # Find team
#     try:
#         idx = game_data["Teams"].index(team_name)
#     except ValueError:
#         return jsonify({"error": f"Team {team_name} not found"}), 404
#
#     # Change team name if provided
#     if new_name:
#         game_data["Teams"][idx] = new_name
#
#     # Change points if provided (blank means “keep old”)
#     if raw_points:
#         try:
#             game_data["Scores"][idx] = int(raw_points)
#         except ValueError:
#             return jsonify({"error": "Invalid teamPoints value"}), 400
#
#     # Change color if provided
#     if raw_color:
#         # ensure Colors array exists
#         if "Colors" not in game_data:
#             game_data["Colors"] = ["" for _ in game_data["Teams"]]
#         game_data["Colors"][idx] = raw_color
#
#     # Save and return
#     with open(GAME_FILE, "w") as f:
#         json.dump(game_data, f)
#
#     return jsonify(game_data)

@app.route("/change-team", methods=["POST"])
def change_team():
    data = request.get_json()
    team_name   = data.get("teamName", "").strip()
    new_name    = data.get("teamNewName", "").strip()
    raw_points  = data.get("teamPoints", "").strip()
    raw_color   = data.get("teamColor", "").strip()

    if not team_name:
        return jsonify({"error": "Missing teamName"}), 400

    with open(GAME_FILE, "r") as f:
        game_data = json.load(f)

    try:
        idx = game_data["Teams"].index(team_name)
    except ValueError:
        return jsonify({"error": f"Team {team_name} not found"}), 404

    if new_name:
        game_data["Teams"][idx] = new_name

    if raw_points:
        try:
            game_data["Scores"][idx] = int(raw_points)
        except ValueError:
            return jsonify({"error": "Invalid teamPoints value"}), 400

    if raw_color:
        try:
            color = normalize_color(raw_color)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        game_data.setdefault("Colors", [""] * len(game_data["Teams"]))
        game_data["Colors"][idx] = color

    with open(GAME_FILE, "w") as f:
        json.dump(game_data, f)

    return jsonify(game_data)


@app.route("/remove-team", methods=["POST"])
def remove_team():
    data = request.get_json()
    team_name = data.get("teamName")
    if not team_name:
        return jsonify({"error": "Missing team name"}), 400

    # Load game data from file
    with open(GAME_FILE, "r") as game_file:
        game_data = json.load(game_file)

    if "Teams" not in game_data:
        return jsonify({"error": "No teams available"}), 400

    try:
        index = game_data["Teams"].index(team_name)
    except ValueError:
        return jsonify({"error": f"Team {team_name} not found"}), 404

    # Remove the team and its associated score and color
    del game_data["Teams"][index]
    if "Scores" in game_data and len(game_data["Scores"]) > index:
        del game_data["Scores"][index]
    if "Colors" in game_data and len(game_data["Colors"]) > index:
        del game_data["Colors"][index]

    # Write back the updated game data
    with open(GAME_FILE, "w") as game_file:
        json.dump(game_data, game_file)

    return jsonify(game_data)

# Timer endpoints

@app.route("/get-timer")
def get_timer():
    global timer_remaining, timer_start, timer_running
    if timer_running:
        elapsed = time.time() - timer_start
        remaining = max(int(timer_remaining - elapsed), 0)
        if remaining == 0:
            # Automatically stop the timer when time is up
            timer_running = False
            timer_remaining = 0
    else:
        remaining = int(timer_remaining)
    minutes = remaining // 60
    seconds = remaining % 60
    formatted_time = f"{minutes:02d}:{seconds:02d}"
    return jsonify(timer=formatted_time)

@app.route("/start-timer", methods=["GET"])
def start_timer():
    global timer_running, timer_start, timer_remaining
    if not timer_running and timer_remaining > 0:
        timer_start = time.time()
        timer_running = True
        return jsonify(status="started", timer=timer_remaining)
    return jsonify(status="already running" if timer_running else "no time remaining")

@app.route("/pause-timer", methods=["GET"])
def pause_timer():
    global timer_running, timer_start, timer_remaining
    if timer_running:
        elapsed = time.time() - timer_start
        timer_remaining = max(timer_remaining - elapsed, 0)
        timer_running = False
        timer_start = None
        return jsonify(status="paused", timer=timer_remaining)
    return jsonify(status="timer not running", timer=timer_remaining)

@app.route("/reset-timer", methods=["GET"])
def restart_timer():
    global timer_running, timer_start, timer_remaining, countdown_duration
    timer_running = False
    timer_remaining = countdown_duration
    timer_start = time.time()
    return jsonify(status="restarted", timer=countdown_duration)

@app.route("/set-timer", methods=["POST"])
def set_timer():
    global countdown_duration, timer_remaining, timer_running, timer_start
    data = request.get_json()
    if not data or "duration" not in data:
        return jsonify({"error": "Please provide a duration in seconds."}), 400
    try:
        duration = int(data["duration"])
    except ValueError:
        return jsonify({"error": "Duration must be an integer."}), 400
    if duration < 0:
        return jsonify({"error": "Duration cannot be negative."}), 400
    countdown_duration = duration
    timer_remaining = duration
    timer_running = False
    timer_start = None
    return jsonify(status="timer set", duration=countdown_duration)

@app.route("/check-timer-toggle")
def check_timer_Toggle():
    if timer_toggle:
        return jsonify("yes")
    else:
        return jsonify("no")

@app.route("/toggle-timer")
def toggle_timer():
    global timer_toggle
    if timer_toggle:
        timer_toggle = False
        return jsonify(timer_toggle)
    else:
        timer_toggle = True
        return jsonify(timer_toggle)


@app.route("/check-baseball-stuff")
def check_baseball_stuff():
    if baseball_stuff:
        return jsonify("yes")
    else:
        return jsonify("no")

@app.route("/toggle-baseball-stuff")
def toggle_baseball_stuff():
    global baseball_stuff
    if baseball_stuff:
        baseball_stuff = False
        return jsonify(baseball_stuff)
    else:
        baseball_stuff = True
        return jsonify(baseball_stuff)

@app.route("/get-baseball", methods=["GET"])
def get_baseball():
    # Return the current baseball state as JSON
    return jsonify(baseball_stats)

@app.route("/update-baseball/<stat>/<int:amount>", methods=["POST"])
def update_baseball(stat, amount):
    global baseball_stats
    if stat in baseball_stats:
        baseball_stats[stat] += amount
    else:
        return jsonify({"error": f"Stat '{stat}' not found"}), 404
    return jsonify(baseball_stats)



@app.route("/")
def scoreboard():
    if deb:
        print_with_color("/", "#454545")
    return render_template("scoreboard.html", version=int(time.time()), timestamp=int(time.time()))

@app.route("/embedded")
def embedded():
    if deb:
        print_with_color("/embedded", "#454545")
    return render_template("scoreboard.html", version=int(time.time()), timestamp=int(time.time()))


@app.route("/backend")
def backend():
    if deb:
        print_with_color("/backend", "#454545")
    return render_template("backend.html", version=int(time.time()), timestamps=int(time.time()))

def run_flask():
    if run_locally:
        app.run(port=port_poggies, debug=True, use_reloader=False)
    else:
        app.run(host="0.0.0.0", port=port_poggies, debug=True, use_reloader=False)


def main():
    run_flask()

if __name__ == '__main__':
    main()

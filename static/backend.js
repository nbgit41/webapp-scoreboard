let clicked = null;

async function getGameStuff() {
    await fetch('/get-game-json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('team-selection');
            // Update or create buttons for current teams
            data.Teams.forEach((team, index) => {
                let teamElement = document.getElementById('team-' + index);
                if (!teamElement) {
                    teamElement = document.createElement('input');
                    teamElement.classList.add('button');
                    teamElement.type = 'button';
                    teamElement.id = 'team-' + index;
                    container.appendChild(teamElement);
                }
                teamElement.value = team;
                teamElement.onclick = () => {
                    document.querySelectorAll('.button').forEach(button => {
                        button.style.background = "black";
                    });
                    setClicked(team);
                    teamElement.style.background = "red";
                };
                if (clicked === team) {
                    teamElement.style.background = "red";
                }
            });

            // Remove any extra buttons
            const existingButtons = container.querySelectorAll('.button');
            existingButtons.forEach(button => {
                const btnIndex = parseInt(button.id.replace('team-', ''));
                if (btnIndex >= data.Teams.length) {
                    container.removeChild(button);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
        });
}

getGameStuff();


function setClicked(teamName) {
    clicked = teamName;
    console.log('clicked for team: ' + clicked);
}

function changeScore(value) {
    console.log('attempting to change score of ' + clicked + ' by ' + value);
    fetch(`/change-score/${clicked}/${value}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        getScoresPlz()
    })
}

function getScoresPlz() {
    console.log('attempting to getScoresPlz');
    fetch('/get-scores')
    .then(response => response.json())
    .then(data => {
        // Loop over each team and update its score element
        data.Teams.forEach((team, index) => {
            // Build the element id that you assigned when creating the element
            const scoreElement = document.getElementById(team + '-score');
            if (scoreElement) {
                scoreElement.textContent = data.Scores[index];
            }
        });
    })
    .catch(error => {
        console.error('Error fetching scores:', error);
    });
}

// Event listener for the "Add Team" form
document.getElementById('add-team-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent the form's default submit behavior

    // Retrieve form values
    const teamName = this.elements['team-name'].value;
    const teamPoints = this.elements['team-points'].value;
    const teamColor = this.elements['team-color'].value;

    try {
        // Send a POST request to add the new team
        const response = await fetch('/add-team', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ teamName, teamPoints, teamColor })
        });
        const result = await response.json();
        console.log('Team added:', result);
        // Refresh the team list if needed
        getGameStuff();
        // Optionally clear the form fields
        this.reset();
    } catch (error) {
        console.error('Error adding team:', error);
    }
});

// Event listener for the "Change Team" form
document.getElementById('change-team-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent the form's default submit behavior

    // Retrieve form values
    const teamName = this.elements['team-name'].value;
    const teamNewName = this.elements['team-new-name'].value;
    const teamPoints = this.elements['team-points'].value;
    const teamColor = this.elements['team-color'].value;

    try {
        // Send a POST request to change/update the team
        const response = await fetch('/change-team', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ teamName, teamNewName, teamPoints, teamColor })
        });
        const result = await response.json();
        console.log('Team updated:', result);
        // Refresh the team list or update the UI as needed
        getGameStuff();
        // Optionally clear the form fields
        this.reset();
    } catch (error) {
        console.error('Error updating team:', error);
    }
});

document.getElementById('remove-team-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent the default form submission

    const teamName = this.elements['team-name'].value;

    // Confirmation prompt
    if (!confirm(`Are you sure you want to remove the team: ${teamName}?`)) {
        return; // If the user cancels, do nothing
    }

    try {
        const response = await fetch('/remove-team', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ teamName })
        });
        const result = await response.json();
        console.log('Team removed:', result);
        // Refresh the team list on the backend
        getGameStuff();
        // Clear the form fields
        this.reset();
    } catch (error) {
        console.error('Error removing team:', error);
    }
    getGameStuff();
});


// Function to start the timer
function startTimer() {
  fetch('/start-timer')
    .then(response => response.json())
    .then(data => {
      console.log('Timer started:', data);
      // Optionally update the UI to reflect the timer's state
    })
    .catch(error => console.error('Error starting timer:', error));
}

// Function to pause the timer
function pauseTimer() {
  fetch('/pause-timer')
    .then(response => response.json())
    .then(data => {
      console.log('Timer paused:', data);
      // Optionally update the UI to reflect the timer's state
    })
    .catch(error => console.error('Error pausing timer:', error));
}

// Function to reset the timer
function resetTimer() {
  fetch('/reset-timer')
    .then(response => response.json())
    .then(data => {
      console.log('Timer reset:', data);
      // Optionally update the UI to reflect the timer's state
    })
    .catch(error => console.error('Error reseting timer:', error));
}

// Function to set the timer to a specific duration (in seconds)
// Example: setTimer(600) would set the countdown to 10 minutes
function setTimer(duration) {
  fetch('/set-timer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ duration: duration })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Timer set:', data);
    // Optionally update the UI to reflect the new timer duration
  })
  .catch(error => console.error('Error setting timer:', error));
}


function baseballModeToggle() {
    fetch('/toggle-baseball-stuff', {})
    .then(response => response.json())
    .then(data => {
        console.log('Toggle baseball stuff:', data);
    })
}

function timerToggle() {
    fetch('/toggle-timer', {})
    .then(response => response.json())
    .then(data => {
        console.log('Toggle timer:', data);
    })
}


function changeBaseballValue(stat, amount) {
    fetch(`/update-baseball/${stat}/${amount}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            console.log(`${stat} updated: `, data[stat]);
            // Refresh the display after updating the stat
            updateBaseballDisplay();
        })
        .catch(err => console.error("Error updating baseball stat:", err));
}

function checkTogglesPlz() {
    fetch('/check-baseball-stuff')
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        if (data === "no") {
            // console.log("its false")
            document.getElementById('baseball-mode-toggle').checked = false;
        }
        else {
            // console.log("its not false")
            document.getElementById('baseball-mode-toggle').checked = true;
        }
    })

    fetch('/check-timer-toggle')
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        if (data === "no") {
            // console.log("its false")
            document.getElementById('timer-toggle-toggle').checked = false;
        }
        else {
            // console.log("its not false")
            document.getElementById('timer-toggle-toggle').checked = true;
        }
    })

}

setInterval(checkTogglesPlz, 2000)
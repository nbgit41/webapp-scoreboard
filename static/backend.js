let clicked = null;

// Helper to format team names to Title Case and normalize case-insensitive input
function formatTeamName(name) {
    return name
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

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
                teamElement.setAttribute('data-team-name', team.trim().toLowerCase());
                teamElement.onclick = () => {
                    document.querySelectorAll('.button').forEach(button => {
                        button.style.background = "black";
                    });
                    setClicked(team);
                    teamElement.style.background = "red";
                };
                if (clicked && clicked.toLowerCase() === team.toLowerCase()) {
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
                const key = team.trim().toLowerCase();
                const scoreElement = document.querySelector(`[data-team-name="${key}"]-score`);
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

    // Retrieve and format form values
    const rawTeamName = this.elements['team-name'].value;
    const teamName = formatTeamName(rawTeamName);
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
        // Refresh the team list
        getGameStuff();
        // Clear the form fields
        this.reset();
    } catch (error) {
        console.error('Error adding team:', error);
    }
});

// Event listener for the "Change Team" form
document.getElementById('change-team-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent the form's default submit behavior

    // Retrieve and format form values
    const rawOldName = this.elements['team-name'].value;
    const teamName = formatTeamName(rawOldName);
    const rawNewName = this.elements['team-new-name'].value;
    const teamNewName = formatTeamName(rawNewName);
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
        // Refresh the team list
        getGameStuff();
        // Clear the form fields
        this.reset();
    } catch (error) {
        console.error('Error updating team:', error);
    }
});

// Event listener for the "Remove Team" form
document.getElementById('remove-team-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent the default form submission

    const rawTeamName = this.elements['team-name'].value;
    const teamName = formatTeamName(rawTeamName);

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
        // Refresh the team list
        getGameStuff();
        // Clear the form fields
        this.reset();
    } catch (error) {
        console.error('Error removing team:', error);
    }
});

// Timer and baseball toggles remain unchanged
function startTimer() {
    fetch('/start-timer')
        .then(response => response.json())
        .then(data => console.log('Timer started:', data))
        .catch(error => console.error('Error starting timer:', error));
}

function pauseTimer() {
    fetch('/pause-timer')
        .then(response => response.json())
        .then(data => console.log('Timer paused:', data))
        .catch(error => console.error('Error pausing timer:', error));
}

function resetTimer() {
    fetch('/reset-timer')
        .then(response => response.json())
        .then(data => console.log('Timer reset:', data))
        .catch(error => console.error('Error resetting timer:', error));
}

function setTimer(duration) {
    fetch('/set-timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration })
    })
        .then(response => response.json())
        .then(data => console.log('Timer set:', data))
        .catch(error => console.error('Error setting timer:', error));
}

function baseballModeToggle() {
    fetch('/toggle-baseball-stuff').then(r => r.json()).then(data => console.log('Toggle baseball stuff:', data));
}

function timerToggle() {
    fetch('/toggle-timer').then(r => r.json()).then(data => console.log('Toggle timer:', data));
}

function checkTogglesPlz() {
    fetch('/check-baseball-stuff').then(r => r.json()).then(data => document.getElementById('baseball-mode-toggle').checked = (data !== "no"));
    fetch('/check-timer-toggle').then(r => r.json()).then(data => document.getElementById('timer-toggle-toggle').checked = (data !== "no"));
}

setInterval(checkTogglesPlz, 2000);

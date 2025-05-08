checkTimerToggle()
checkBaseballStuff()
updateBaseballDisplay()

async function getGameFileStuff() {
    try {
        const response = await fetch('/get-game-json');
        const data = await response.json();
        const container = document.getElementById('scores');

        // Remove score elements for teams no longer present in data.Teams
        const scoreElements = container.querySelectorAll('h2[id$="-score"]');
        scoreElements.forEach(scoreElem => {
            const teamNameFromId = scoreElem.id.replace('-score', '');
            if (!data.Teams.includes(teamNameFromId)) {
                const teamScoreDiv = scoreElem.closest('.team-score');
                if (teamScoreDiv) {
                    container.removeChild(teamScoreDiv);
                }
            }
        });

        // Update or create score elements for each team in the current data
        data.Teams.forEach((team, index) => {
            let teamScoreElem = document.getElementById(team + '-score');
            const newScore = (data.Scores && data.Scores[index] !== undefined) ? data.Scores[index] : 0;
            const color = (data.Colors && data.Colors[index] !== undefined) ? data.Colors[index] : 'white';

            if (teamScoreElem) {
                // Update the existing score element
                teamScoreElem.textContent = newScore;
                teamScoreElem.style.color = color;
            } else {
                // Create new score element structure if it doesn't exist
                const newDiv = document.createElement('div');
                newDiv.classList.add('team-score');

                const newTextDiv = document.createElement('div');
                newTextDiv.classList.add('text');

                const teamElement = document.createElement('h1');
                teamElement.textContent = team;
                teamElement.style.color = color;

                const teamScore = document.createElement('h2');
                teamScore.id = team + '-score';
                teamScore.textContent = newScore;
                teamScore.style.color = color;

                newDiv.style.backgroundColor = hexToRGBA(color, 0.25);

                newTextDiv.appendChild(teamElement);
                newTextDiv.appendChild(teamScore);
                newDiv.appendChild(newTextDiv);
                container.appendChild(newDiv);
            }
        });
    } catch (error) {
        console.error('Error fetching JSON:', error);
    }
}

// Set interval to update every second
setInterval(getGameFileStuff, 1000);
getGameFileStuff();

function getScoresPlz() {
    // console.log('attempting to getScoresPlz');
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

setInterval(getScoresPlz, 1000);

function hexToRGBA(hex, alpha) {
  // Remove the hash if present
  hex = hex.replace('#', '');
  // If shorthand hex, expand it
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Function to update the timer display by fetching the current timer value from the backend
function updateTimerFromBackend() {
  fetch('/get-timer')
    .then(response => response.json())
    .then(data => {
      document.getElementById('timer').textContent = data.timer;
    })
    .catch(error => console.error("Error fetching timer:", error));
}

// Periodically update the timer display every second
setInterval(updateTimerFromBackend, 1000);
updateTimerFromBackend();

function checkBaseballStuff() {
    fetch('/check-baseball-stuff')
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        if (data === "no") {
            // console.log("its false")
            document.getElementById('baseball-stuff').style.display = 'none';
        }
        else {
            // console.log("its not false")
            document.getElementById('baseball-stuff').style.display = '';
            document.getElementById('scores').style.top = '40%';
        }
    })
}

setInterval(checkBaseballStuff, 5000);

function checkTimerToggle() {
    fetch('/check-timer-toggle')
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        if (data === "no") {
            // console.log("its false")
            document.getElementById('timer-container').style.display = 'none';
        }
        else {
            // console.log("its not false")
            document.getElementById('timer-container').style.display = '';
        }
    })
}

setInterval(checkTimerToggle, 5000)


function updateBaseballDisplay() {
    fetch("/get-baseball")
        .then(response => response.json())
        .then(data => {
            // Update each element with the latest values
            document.getElementById("balls-number").innerText = data.balls;
            document.getElementById("strikes-number").innerText = data.strikes;
            document.getElementById("outs-number").innerText = data.outs;
            document.getElementById("inning-number").innerText = data.inning;
        })
        .catch(error => console.error("Error updating baseball display:", error));
}

setInterval(updateBaseballDisplay, 1000)

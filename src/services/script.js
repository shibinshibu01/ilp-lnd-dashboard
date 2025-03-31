document.addEventListener("DOMContentLoaded", () => {
    const trainingDataUrl = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/trainings/.json";

    axios.get(trainingDataUrl)
        .then(response => {
            if (response.data) {
                displayTrainings(response.data);
            } else {
                console.error("No training data found.");
            }
        })
        .catch(error => console.error("Error fetching training details:", error));
});

function displayTrainings(trainings) {
    const trainingList = document.getElementById("training-list");
    if (!trainingList) {
        console.error("Element with ID 'training-list' not found.");
        return;
    }

    trainingList.innerHTML = ""; // Clear previous content

    Object.keys(trainings).forEach(trainingId => {
        const training = trainings[trainingId];
        
        let typeClass = "";
        if (training.training_type === "softskills") {
            typeClass = "soft-skills";
        } else if (training.training_type === "language") {
            typeClass = "language";
        } else if (training.training_type === "technical") {
            typeClass = "technical";
        }
       
        let statusClass = "";
        if (training.status === "completed") {
            statusClass = "completed";
        } else if (training.status === "in-progress") {
            statusClass = "in-progress";
        } else if (training.status === "scheduled") {
            statusClass = "scheduled";
        }
        let listItem = `
        <div class="training-item" >
            <p id="training__title" onclick="loadTrainingDetails('${trainingId}')">${training.training_name}</p>
            <p id="type" class="${typeClass}">${training.training_type}</p>
            <p id="duration">${training.duration}hrs</p>
            <p id="target_audience">${training.target_audience}</p>
            <p id="trainer">${training.trainer}</p>
            <p id="metrics">${training.employees_attended}</p>
            <p id="metrics">${training.attendance}%</p>
            <p id="metrics">${training.effectiveness_score}</p>
            <p id="mode">${training.mode}</p>
            <p id="status" class="${statusClass}">${training.status}</p>
        </div>`;

        trainingList.insertAdjacentHTML("beforeend", listItem); // Append without overwriting
    });
}




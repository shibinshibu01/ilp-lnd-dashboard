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
        const training = trainings[trainingId]; // Get training object
        let listItem = `
        <div class="training-item">
            <h3>${training.training_name}</h3>
            <p id="type">${training.training_type}</p>
            <h2>${training.duration}</h2>
            <p>${training.target_audience}</p>
            <p>${training.trainer}</p>
            <p id="metrics">${training.employees_attended}</p>
            <p id="metrics">${training.attendance}%</p>
            <p id="metrics">${training.effectiveness_score}</p>
            <p>${training.mode}</p>
            <p>${training.status}</p>
        </div>`;

        trainingList.insertAdjacentHTML("beforeend", listItem); // Append without overwriting
    });
}

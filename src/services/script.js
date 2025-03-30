//training program modal
const trainingModalurl = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/trainings.json";
const trainersUrl = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/trainers.json";
const employeesUrl = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/employees.json";
const departmentsUrl = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/departments.json";

let data = null;
let trainers = null;
let employees = null;
let departments = null;

Promise.all([
    axios.get(trainingModalurl),
    axios.get(trainersUrl),
    axios.get(employeesUrl),
    axios.get(departmentsUrl)
])
.then(([trainingsResponse, trainersResponse, employeesResponse, departmentsResponse]) => {
    data = trainingsResponse.data;
    trainers = trainersResponse.data;
    employees = employeesResponse.data;
    departments = departmentsResponse.data;

    console.log("Fetched trainings:", data);
    console.log("Fetched trainers:", trainers);
    console.log("Fetched employees:", employees);
    console.log("Fetched departments:", departments);
    
    loadTrainingDetails("tra001");
})
.catch(error => console.error('Error fetching data:', error));

function loadTrainingDetails(trainingId) {
    if (!data || !trainers || !employees || !departments) {
        console.error("Data not available yet.");
        return;
    }

    const training = data[trainingId];
    if (!training) {
        console.error("Training ID not found:", trainingId);
        return;
    }

    // Get trainer name
    const trainerId = training.trainer;
    const trainerName = trainers[trainerId] ? trainers[trainerId].name : "Unknown Trainer";

    console.log("Loading training details for:", trainingId, training);

    const trainingContainer = document.querySelector('.course-modal-details');
    trainingContainer.innerHTML = '';

    const employeeListHTML = training.attendees.map(empId => {
        const employee = employees[empId] || {};
        const empName = employee.emp_name || "Unknown Employee";
        const empDepartmentId = employee.emp_department || "Unknown Department";
        const empAttendance = employee.trainings_done?.[trainingId]?.attendance || "N/A";
        const empDepartment = departments[empDepartmentId]?.department_name || "Unknown";

        return `
            <div class="employee-card">
                <div class="employee-image">
                    <img src="./src/assets/user-pic.svg">
                </div>
                <div class="employee-info">
                    <h3 class="employee-name">${empName}</h3>
                    <p class="employee-attendance">Attendance: ${empAttendance}%</p>
                </div>
                <div class="employee-department">
                    <p class="department-label">Department</p>
                    <h3 class="department-name">${empDepartment}</h3>
                </div>
            </div>
        `;
    }).join('');

    const trainingElement = document.createElement('div');
    trainingElement.className = 'course-details';
    trainingElement.innerHTML = `
        <div class="course-title-metrics">
            <div class="course-title">
                <h1>${training.training_name}</h1>
            </div>
            <div class="course-metrics">
                <div class="metric-one">
                    <h1 class="metric-value">${training.attendance}%</h1>
                    <p class="metric-description">Attendance<br>Percentage</p>
                </div>
                <div class="metric-two">
                    <h1 class="metric-value">${training.employees_attended}</h1>
                    <p class="metric-description">Employees<br>Trained</p>
                </div>
                <div class="metric-three">
                    <h1 class="metric-value">${training.feedback_score}</h1>
                    <p class="metric-description">Feedback<br>Score</p>
                </div>
                <div class="metric-four">
                    <h1 class="metric-value">${training.effectiveness_score}</h1>
                    <p class="metric-description">Effectiveness<br>Score</p>
                </div>
            </div>
        </div>
        <div class="type-mode">
            <button class="btn-type">${training.training_type}</button>
            <button class="btn-mode">${training.mode}</button>
        </div>
        <div class="description">
            <p class="course-description">${training.training_description}</p>
        </div>
        <div class="course-date-duration">
            <h3 class="date-duration">${training.start_date} to ${training.end_date} (${training.duration} hrs)</h3>
        </div>
        <div class="trainer">
            <h3 class="trainer-title">Trainer: <span class="trainer-name">${trainerName}</span></h3>
        </div>
        <div class="course-status">
            <h3>Status: <span class="course-status-label">${training.status}</span></h3>
        </div>
        <div class="course-topics">
            <h3>Topics:</h3>
            <ul class="topics-list">
                ${training.topics.map(topic => `<li class="topic-item">${topic}</li>`).join('')}
            </ul>
        </div>
        <div class="employee-details">
            <div class="employee-header">
                <h2>Employees</h2>
                <div class="employee-status">
                    <p>Select Status</p>
                </div>
            </div>
            ${employeeListHTML}
        </div>
    `;

    trainingContainer.appendChild(trainingElement);
}



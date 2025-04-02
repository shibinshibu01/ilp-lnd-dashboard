function fetchData(type) {
    const baseUrl = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/";
    const endpoints = {
        1: "trainings.json",
        2: "employees.json",
        3: "trainers.json",
        4: "departments.json" // Endpoint for department details
    };

    // Function to fetch data with error handling
    const fetchJson = (endpoint) => {
        return axios.get(baseUrl + endpoint)
            .then(response => response.data)
            .catch(error => {
                console.error(`Error fetching ${endpoint}:`, error);
                return {};
            });
    };

    // Fetch all necessary data
    return Promise.all([
        fetchJson(endpoints[type]),
        fetchJson(endpoints[3]), // Trainers data
        fetchJson(endpoints[4])  // Department details
    ]).then(([mainData, trainersData, departmentDetails]) => {
        switch (type) {
            case 1: // Trainings
                return Object.keys(mainData).map(key => {
                    const training = mainData[key];
                    // Look up trainer name from trainers data
                    const trainerName = trainersData[training.trainer]?.name || training.trainer;
                    return {
                        title: training.training_name,
                        type: training.training_type,
                        duration: `${training.duration} hrs`,
                        effectiveness: training.effectiveness_score,
                        trainer: trainerName,
                        employeesAttended: training.employees_attended,
                        attendancePercentage: `${training.attendance}%`,
                        feedbackScore: training.feedback_score,
                        status: training.status,
                        topics: training.topics
                    };
                });
            case 2: // Employees
                return Object.keys(mainData).map(key => {
                    const employee = mainData[key];
                    // Look up full department name
                    const departmentName = departmentDetails?.[employee.emp_department]?.department_name || employee.emp_department;
                    console.log("Trying to access:", employee.emp_department, "=>", departmentDetails[employee.emp_department]?.department_name);

                    return {
                        name: employee.emp_name,
                        department: departmentName,
                        totalTrainingDays: `${employee.total_training_days} days`,
                        totalTrainingPrograms: employee.total_training_programs,
                        averageAttendance: employee.average_attendance,
                    };
                });
            case 3: // Trainers
                return Object.keys(mainData).map(key => {
                    const trainer = mainData[key];
                    return {
                        name: trainer.name,
                        trainingsConducted: trainer.trainings_conducted ? trainer.trainings_conducted.length : 0,
                        feedbackScore: trainer.feedback,
                    };
                });
            default:
                return [];
        }
    })
        .catch(error => {
            console.error(`Error fetching data for type ${type}:`, error);
            return [];
        });
}
function updateSecondFilter() {
    const mainCategory = document.getElementById('mainCategory').value;
    const secondFilter = document.getElementById('secondFilter');
    const thirdFilter = document.getElementById('thirdFilter');

    // Reset both filters
    secondFilter.innerHTML = '<option>Select condition</option>';
    thirdFilter.innerHTML = '<option>Select condition</option>';

    // Dynamically update second filter based on main category
    const filterOptions = {
        'Training Programs': [
            'Feedback Score',
            'Effectiveness Score',
            'Attendance'
        ],
        'Employees': [
            'Average Attendance',
            'Total Training Days',
            'Total Training Programs'
        ],
        'Trainers': [
            'Feedback Score'
        ]
    };

    (filterOptions[mainCategory] || []).forEach(option => {
        const el = document.createElement('option');
        el.textContent = option;
        secondFilter.appendChild(el);
    });
}

function updateThirdFilter() {
    const thirdFilter = document.getElementById('thirdFilter');
    thirdFilter.innerHTML = '<option>Select condition</option>';

    ['Greater than', 'Lesser than', 'Equals', 'Not Equals'].forEach(option => {
        const el = document.createElement('option');
        el.textContent = option;
        thirdFilter.appendChild(el);
    });
}

function setTableHeader(category) {
    const tableHeader = document.getElementById('tableHeader');
    tableHeader.innerHTML = ''; // Clear previous header

    const headerMap = {
        'Training Programs': [
            'Title', 'Type', 'Duration', 'Effectiveness',
            'Trainer', 'Employees Attended', 'Attendance %',
            'Feedback Score', 'Status'
        ],
        'Employees': [
            'Name', 'Department', 'Total Training Days',
            'Total Training Programs', 'Average Attendance'
        ],
        'Trainers': [
            'Name', 'Feedback Score', 'Number of Trainings Conducted'
        ]
    };

    const headers = headerMap[category] || [];
    const headerRow = document.createElement('tr');

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    tableHeader.appendChild(headerRow);
}

function generateTableRow(data, category) {
    const row = document.createElement('tr');
    const headerMap = {
        'Training Programs': [
            'Title', 'Type', 'Duration', 'Effectiveness',
            'Trainer', 'Employees Attended', 'Attendance',
            'Feedback Score', 'Status'
        ],
        'Employees': [
            'Name', 'Department', 'Total Training Days',
            'Total Training Programs', 'Average Attendance'
        ],
        'Trainers': [
            'Name', 'Feedback Score', 'Number of Trainings Conducted'
        ]
    };

    const rowDataMap = {
        'Training Programs': [
            data.title,
            createTypeTag(data.type, 'type'),
            data.duration,
            data.effectiveness,
            data.trainer,
            data.employeesAttended,
            data.attendancePercentage,
            data.feedbackScore,
            //createTypeTag(data.mode, 'mode'),
            createTypeTag(data.status, 'status')
        ],
        'Employees': [
            data.name,
            data.department,
            data.totalTrainingDays,
            data.totalTrainingPrograms,
            data.averageAttendance
        ],
        'Trainers': [
            data.name,
            data.feedbackScore,
            data.trainingsConducted
        ]
    };

    const headers = headerMap[category] || [];
    const rowData = rowDataMap[category] || [];

    rowData.forEach((cellData, index) => {
        const cell = document.createElement('td');
        // Add data-label attribute for responsive design
        cell.setAttribute('data-label', headers[index]);

        if (typeof cellData === 'string' || typeof cellData === 'number') {
            cell.textContent = cellData;
        } else {
            cell.appendChild(cellData);
        }
        row.appendChild(cell);
    });

    return row;
}
function createTypeTag(value, baseClass) {
    if (!value) return value;
    const tag = document.createElement('span');

    // Normalize the value for class generation
    const normalizedValue = value.toLowerCase().replace(/\s+/g, '-');


    // Add specific classes for different types
    tag.classList.add('type-tag', `type-${baseClass}`, `type-${baseClass}-${normalizedValue}`);
    tag.textContent = value;
    return tag;
}
console.log("tableBody:");
function applyFilter() {
    const mainCategory = document.getElementById('mainCategory').value;
    const secondFilter = document.getElementById('secondFilter').value;
    const thirdFilter = document.getElementById('thirdFilter').value;
    const filterValue = document.getElementById('filterValue').value.trim().toLowerCase();
    const resultsTable = document.getElementById('resultsTable');
    const tableBody = document.getElementById('tableBody');

    tableBody.innerHTML = ''; // Clear previous results
    setTableHeader(mainCategory);

    const fetchTypeMap = {
        'Training Programs': 1,
        'Employees': 2,
        'Trainers': 3
    };

    fetchData(fetchTypeMap[mainCategory] || 0)
        .then(dataSet => {
            let filteredData = Object.entries(dataSet).filter(([key, item]) => {
                if (secondFilter === 'Select condition' || filterValue === '') return true;

                const filterValueMap = {
                    'Feedback Score': () => parseFloat(item.feedbackScore),
                    'Duration': () => parseInt(item.duration),
                    'Attendance': () => parseFloat(item.attendancePercentage),
                    'Average Attendance': () => parseFloat(item.averageAttendance),
                    'Total Training Days': () => parseInt(item.totalTrainingDays),
                    'Total Training Programs': () => parseInt(item.totalTrainingPrograms),
                    'Effectiveness Score': () => parseFloat(item.effectiveness)
                };

                const getItemValue = filterValueMap[secondFilter];
                if (!getItemValue) {
                    return Object.values(item).some(val =>
                        val.toString().toLowerCase().includes(filterValue)
                    );
                }

                const itemValue = getItemValue();
                if (isNaN(itemValue)) return false;

                const filterNum = parseFloat(filterValue);
                const comparisons = {
                    'Greater than': () => itemValue > filterNum,
                    'Lesser than': () => itemValue < filterNum,
                    'Equals': () => itemValue === filterNum,
                    'Not Equals': () => itemValue !== filterNum
                };

                return comparisons[thirdFilter] ? comparisons[thirdFilter]() : true;
            });

            // ✅ Ensure rows get the correct key
            filteredData.forEach(([key, item], index) => {
                const formattedKey = `tra${String(index + 1).padStart(3, '0')}`; // 🔥 Start from 1
                const row = generateTableRow(item, mainCategory);
                row.dataset.key = formattedKey; // ✅ Assign formatted key
                console.log("Row assigned key:", formattedKey); // ✅ Debugging log
                tableBody.appendChild(row);
            });
            document.getElementById('tableBody').addEventListener('click', function (event) {
                const row = event.target.closest('tr');
                if (row && row.dataset.key) {
                    const trainingKey = row.dataset.key;
                    const mainCategory = document.getElementById('mainCategory').value; // Get the selected category

                    console.log("Clicked row key:", trainingKey);
                    if (mainCategory === "Training Programs") { // ✅ Call only for Training Programs
                        console.log("Passing key to loadTrainingDetails:", trainingKey);
                        loadTrainingDetails(trainingKey);
                        document.querySelector(".course-modal").style.display = "block";
                    }
                }
            });


        })
}




function getFilterValues() {
    let selects = document.querySelectorAll('.filter__select');
    let year = selects[0]?.value || null;
    let month = selects[1]?.value || null;
    let quarter = selects[2]?.value || null;

    // Lock out the Quarter or Month dropdown when one is selected
    if (month && quarter) {
        const lastChanged = document.querySelector('.filter__select:focus');
        if (lastChanged === selects[1]) {
            quarter = null; // If month was changed, reset quarter
        } else {
            month = null; // If quarter was changed, reset month
        }
    }

    // Disable the select options accordingly
    if (month) {
        selects[2].disabled = true; // Disable Quarter select
    } else {
        selects[2].disabled = false; // Enable Quarter select if Month is not selected
    }

    if (quarter) {
        selects[1].disabled = true; // Disable Month select
    } else {
        selects[1].disabled = false; // Enable Month select if Quarter is not selected
    }

    let values = { year, month, quarter };
    console.log("Selected Filters:", values);
    return values;
}



function dayDate(trainings) {
    console.log("Raw Trainings Data:", trainings);

    if (!trainings || Object.keys(trainings).length === 0) {
        console.log("No training data available.");
        return { trainings: {} };
    }

    let { year, month, quarter } = getFilterValues();
    if (!year && !month && !quarter) {
        console.log("No filters selected. Returning full dataset.");
        return { trainings };
    }

    if (year == month == quarter == null) {
        console.log("initial load");
        return { trainings };
    }

    console.log(`Filtering for Year: ${year}, Month: ${month}, Quarter: ${quarter}`);

    let quarterMonths = {
        Q1: ["01", "02", "03"],
        Q2: ["04", "05", "06"],
        Q3: ["07", "08", "09"],
        Q4: ["10", "11", "12"],
    };

    let filteredTrainings = Object.entries(trainings).reduce((acc, [id, training]) => {
        if (!training.start_date || !training.start_date.includes("-")) {
            console.log(`Training ${id} has an invalid start_date`, training);
            return acc;
        }

        let [trainingYear, trainingMonth] = training.start_date.split("-");
        trainingMonth = trainingMonth.padStart(2, "0"); // Ensure leading zero for single-digit months
        console.log(`Training ${id}: Year = ${trainingYear}, Month = ${trainingMonth}`);

        let match =
            (year && !month && !quarter && trainingYear === year) ||
            (year && month && trainingYear === year && trainingMonth === month) ||
            (year && quarter && trainingYear === year && quarterMonths[quarter]?.includes(trainingMonth));

        if (match) acc[id] = training;
        return acc;
    }, {});

    console.log("Filtered Trainings:", filteredTrainings);
    return { trainings: filteredTrainings };
}


// Attach event listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
    document.querySelectorAll('.filter__select').forEach(select => {
        select.addEventListener('change', fetchAndFilterData);
    });

    // Load charts with full dataset on initial load
    await fetchAndFilterData();
});

async function fetchAndFilterData() {
    const trainingData = await fetchDataFromFire(tables[0]);

    if (!trainingData) return;

    const { trainings: filteredTrainings } = dayDate(trainingData);

    updateTrainingProgramChart(filteredTrainings);
    updateTopTraining(filteredTrainings);
    updateTrainingCompliance(filteredTrainings);
    updateTrainings(filteredTrainings);
}
//training program modal
// JavaScript for the Training Modal
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

    const trainerId = training.trainer;
    const trainerName = trainers[trainerId] ? trainers[trainerId].name : "Unknown Trainer";

    console.log("Loading training details for:", trainingId, training);

    const trainingContainer = document.querySelector('.course-modal-details');
    const titleMetricsContainer = document.querySelector('.course-title-metrics');

    trainingContainer.innerHTML = '';


    titleMetricsContainer.querySelector('.course-title h1').textContent = training.training_name;
    titleMetricsContainer.querySelector('.metric-one .metric-value').textContent = training.attendance + "%";
    titleMetricsContainer.querySelector('.metric-two .metric-value').textContent = training.employees_attended;
    titleMetricsContainer.querySelector('.metric-three .metric-value').textContent = training.feedback_score;
    titleMetricsContainer.querySelector('.metric-four .metric-value').textContent = training.effectiveness_score;

    const trainingTypeFormatted = training.training_type.charAt(0).toUpperCase() + training.training_type.slice(1);
    const trainingStatusFormatted = training.status.charAt(0).toUpperCase() + training.status.slice(1);
    const trainingElement = document.createElement('div');
    trainingElement.className = 'course-details';
    trainingElement.innerHTML = `
        <div class="type-mode">
            <button class="btn-type" data-type="${training.training_type}">${trainingTypeFormatted}</button>
            <button class="btn-mode">${training.mode}</button>
        </div>
        <div class="description">
            <p class="course-description">${training.training_description}</p>
        </div>
        <div class="target-audience">
            <h3 class="course-audience">Target Audience: <span class="course-audience-span">${"DU" + parseInt(training.target_audience.replace("dept", ""), 10)}</span></h3>
        </div>
        <div class="course-date-duration">
            <h3 class="date-duration">Date: <span class="date-duration-span">${training.start_date} to ${training.end_date} (${training.duration} hrs)</span></h3>
        </div>
        <div class="trainer">
            <h3 class="trainer-title">Trainer: <span class="trainer-name">${trainerName}</span></h3>
        </div>
        <div class="course-status">
            <h3 class="status-title">Status: <span class="course-status-label" data-status="${training.status}">${trainingStatusFormatted}</span></h3>
        </div>
        <div class="course-topics">
            <h3 class="topic-title">Topics:</h3>
            <ul class="topics-list">
                ${training.topics.map(topic => `<li class="topic-item">${topic}</li>`).join('')}
            </ul>
        </div>
    `;

    trainingContainer.appendChild(trainingElement);

    const employeeListHTML = training.attendees.map(empId => {
        const employee = employees[empId] || {};
        const empName = employee.emp_name || "Unknown Employee";
        const empDepartmentId = employee.emp_department || "Unknown Department";
        const empAttendance = employee.trainings_done?.[trainingId]?.attendance || "N/A";
        const empDepartment = departments[empDepartmentId]?.department_name || "Unknown";

        return `
            <div class="employee-card" data-department="${empDepartment}" onclick="handleEmployeeClick('${empId}')">
                <div class="employee-image">
                    <img src="./src/assets/employees-icon.svg">
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

    const employeeDetailsElement = document.createElement('div');
    employeeDetailsElement.className = 'employee-details';
    employeeDetailsElement.innerHTML = `
        <div class="employee-header">
            <h2>Employees</h2>
            <div class="employee-status">
                <select id="departmentFilter" class="custom-select">
                    <option value="" disabled selected>Select Status</option>
                    <option value="all">All</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Engineering">Engineering</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                </select>
            </div>
        </div>
        <div id="employeeList">${employeeListHTML}</div>
    `;
    trainingContainer.appendChild(employeeDetailsElement);
    document.getElementById("departmentFilter").addEventListener("change", function () {
        const selectedDepartment = this.value;
        document.querySelectorAll(".employee-card").forEach(card => {
            if (selectedDepartment === "all" || card.dataset.department === selectedDepartment) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    });

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("back-button")) {
            document.querySelector(".course-modal").style.display = "none";
        }
    });
}

function handleEmployeeClick(empId) {
    document.querySelector(".course-modal").style.display = "none";
    displayEmployeeTrainings(empId, employees, data, trainers);
}

function adjustModalWidth() {
    const mainContent = document.querySelector(".main-content");
    const courseModal = document.querySelector(".course-modal");

    if (mainContent && courseModal) {
        const computedStyle = window.getComputedStyle(mainContent);
        courseModal.style.width = computedStyle.width;
    }
}

// Run function when page loads and on window resize
window.addEventListener("load", adjustModalWidth);
window.addEventListener("resize", adjustModalWidth);


//Stats
const database = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/";
const tables = ["trainings.json", "employees.json", "trainers.json", "departments.json"];
const getUrl = (table) => `${database}${table}`;

const fetchDataFromFire = async (table) => {
    try {
        const response = await axios.get(getUrl(table));
        return response.data;
    } catch (error) {
        console.error('Axios Error:', error);
        return null;
    }
}

const updateTrainings = async (trainingData) => {
    let ongoingTrainings = 0;
    let completedTrainings = 0;
    let trainingHours = 0;

    if (trainingData) {
        Object.values(trainingData).forEach(trainings => {
            if (trainings.status === "in-progress") {
                ongoingTrainings++;
            } else if (trainings.status === "completed") {
                completedTrainings++;
            }
            if (trainings.duration) {
                trainingHours += parseInt(trainings.duration);
            }
        });
    }

    const ongoingTrainingElement = document.getElementById("ongoingTraining");
    const completedTrainingElement = document.getElementById("completedTraining");
    const trainingHoursElement = document.getElementById("trainingHours");

    if (ongoingTrainingElement) {
        ongoingTrainingElement.textContent = ongoingTrainings;
    }
    if (completedTrainingElement) {
        completedTrainingElement.textContent = completedTrainings;
    }
    if (trainingHoursElement) {
        trainingHoursElement.textContent = Math.round(trainingHours / 8);
    }

    let isOriginalState = true;
    trainingHoursElement.parentElement.addEventListener("click", () => {
        if (isOriginalState) {
            trainingHoursElement.textContent = trainingHours;
            document.getElementById("trainingHoursLabel").innerHTML = "Training<br>Hours";
        } else {
            trainingHoursElement.textContent = Math.round(trainingHours / 8);
            document.getElementById("trainingHoursLabel").innerHTML = "Training<br>Days";
        }
        isOriginalState = !isOriginalState;
    });
};

const categorizeTrainings = async () => {
    const trainingData = await fetchDataFromFire(tables[0]);
    
    let techTrainings = 0;
    let softSkillsTrainings = 0;
    let languageTrainings = 0;
    let feedbackScore = 0;
    let effectivenessScore = 0;

    if (trainingData) {
        Object.values(trainingData).forEach(trainings => {
            if (trainings.training_type === "technical") {
                techTrainings++;
            } else if (trainings.training_type === "softskills") {
                softSkillsTrainings++;
            } else if (trainings.training_type === "language") {
                languageTrainings++;
            }
            if (trainings) {
                feedbackScore += parseInt(trainings.feedback_score);
                effectivenessScore += parseInt(trainings.effectiveness_score);
            }
        });
    }
    const techTrainingElement = document.getElementById("techTrainings");
    const softSkillsTrainingElement = document.getElementById("softTrainings");
    const languageTrainingElement = document.getElementById("langTrainings");
    const feedbackScoreElement = document.getElementById("avgFeedback");
    const effectivenessScoreElement = document.getElementById("avgEffectiveness");

    if (techTrainingElement) {
        techTrainingElement.textContent = techTrainings;
    }
    if (softSkillsTrainingElement) {
        softSkillsTrainingElement.textContent = softSkillsTrainings;
    }
    if (languageTrainingElement) {
        languageTrainingElement.textContent = languageTrainings;
    }
    if (feedbackScoreElement) {
        feedbackScoreElement.textContent = (feedbackScore / Object.keys(trainingData).length).toFixed(2);
    }
    if (effectivenessScoreElement) {
        effectivenessScoreElement.textContent = (effectivenessScore / Object.keys(trainingData).length).toFixed(2);
    }
    
};

const updateEmployees = async () => {
    const employeeData = await fetchDataFromFire(tables[1]);
    let trainedEmployeesCount = 0;
    let traineeDays = 0;

    if (employeeData) {
        Object.values(employeeData).forEach(employee => {
            if (employee.total_training_days > 0) {
                trainedEmployeesCount++;
            }
            if (employee.total_training_days) {
                traineeDays += parseInt(employee.total_training_days);
            }
        });
    }

    const trainedEmployeesElement = document.getElementById("employeesTrained");
    const traineeDaysElement = document.getElementById("traineeDays");
    if (trainedEmployeesElement) {
        trainedEmployeesElement.textContent = trainedEmployeesCount;
    }
    if (traineeDaysElement) {
        traineeDaysElement.textContent = traineeDays;
    }
    let isOriginalState = true;
    traineeDaysElement.parentElement.addEventListener("click", () => {
        if (isOriginalState) {
            traineeDaysElement.textContent = traineeDays;
            document.getElementById("traineeDaysLabel").innerHTML = "Trainee<br>Days";
        } else {
            traineeDaysElement.textContent = traineeDays * 8;
            document.getElementById("traineeDaysLabel").innerHTML = "Trainee<br>Hours";
        }
        isOriginalState = !isOriginalState;
    });
}

const updateTrainingCompliance = async (trainingComplianceData) => {
    let finishedTrainings = 0;
    let totalTrainings = 0;

    if (trainingComplianceData) {
        Object.values(trainingComplianceData).forEach(training => {
            if (training.status === "completed") {
                finishedTrainings++;
            }
            totalTrainings++;
        });
    }

    const compliancePercentage = totalTrainings > 0 ? Math.round((finishedTrainings / totalTrainings) * 100) : 0;
    const ctx = document.getElementById("complianceChart").getContext("2d");

    if (window.complianceChart?.destroy) {
        window.complianceChart.destroy();
    }

    window.complianceChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Completed Trainings", "Pending Trainings"],
            datasets: [{
                data: [finishedTrainings, totalTrainings - finishedTrainings],
                backgroundColor: ["#DC143B", "#E7E5E4"],
                borderWidth: 0,
                cutout: "35%",
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: function (chart) {
                const width = chart.width,
                    height = chart.height,
                    ctx = chart.ctx;

                ctx.restore();
                ctx.font = "bold 24px Poppins";
                ctx.fillStyle = "#DC143B";
                ctx.textBaseline = "middle";

                const text = `${compliancePercentage}%`;
                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                const textY = height / 2;

                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }]
    });

    document.getElementById("plannedTrainings").textContent = totalTrainings;
    document.getElementById("completedTrainings").textContent = finishedTrainings;
};

const updateDepartmentChart = async () => {
    const departmentData = await fetchDataFromFire(tables[3]);

    if (!departmentData) return;

    let engineeringTrainingHours = 0;
    let hrTrainingHours = 0;
    let financeTrainingHours = 0;
    let marketingTrainingHours = 0;
    let salesTrainingHours = 0;

    Object.values(departmentData).forEach(department => {
        switch (department.department_name) {
            case "Engineering":
                engineeringTrainingHours += department.total_training_hours || 0;
                break;
            case "HR":
                hrTrainingHours += department.total_training_hours || 0;
                break;
            case "Finance":
                financeTrainingHours += department.total_training_hours || 0;
                break;
            case "Marketing":
                marketingTrainingHours += department.total_training_hours || 0;
                break;
            case "Sales":
                salesTrainingHours += department.total_training_hours || 0;
                break;
        }
    });

    const departmentDataChart = document.getElementById('departmentOverviewChart').getContext('2d');

    if (window.departmentChart && typeof window.departmentChart.destroy === "function") {
        window.departmentChart.destroy();
    }

    window.departmentChart = new Chart(departmentDataChart, {
        type: 'line',
        data: {
            labels: ['HR', 'Marketing', 'Engineering', 'Sales', 'Finance'],
            datasets: [{
                data: [hrTrainingHours, marketingTrainingHours, engineeringTrainingHours, salesTrainingHours, financeTrainingHours],
                backgroundColor: "#DC143B",
                borderColor: "#DC143B",
                fill: false,
                tension: 0.5,
                pointRadius: 5,
                pointBackgroundColor: "#DC143B",
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Number of Training Hours in Each Department',
                    font: { size: 9 }
                }
            }
        }
    });
};

const updateTrainingProgramChart = async (trainingData) => {
    if (!trainingData) return;

    let technicalCourses = 0;
    let softSkillsCourses = 0;
    let behavioralCourses = 0;

    Object.values(trainingData).forEach(training => {
        switch (training.training_type) {
            case "technical":
                technicalCourses++;
                break;
            case "softskills":
                softSkillsCourses++;
                break;
            default:
                behavioralCourses++;
                break;
        }
    });

    const trainingProgramChart = document.getElementById('trainingProgramChart').getContext('2d');

    if (window.categoryChart?.destroy) {
        window.categoryChart.destroy();
    }

    window.categoryChart = new Chart(trainingProgramChart, {
        type: 'bar',
        data: {
            labels: ['Technical', 'Soft Skills', 'Behavioral'],
            datasets: [{
                data: [technicalCourses, softSkillsCourses, behavioralCourses],
                backgroundColor: ["#DC143B", "#DC143B", "#DC143B"],
                borderRadius: 5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            },
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Number of Trainings in Each Category', font: { size: 8 } }
            }
        }
    });
};


const updateTopTraining = async (trainingsData) => {
    if (trainingsData) {
        const sortedByFeedbackTrainings = Object.values(trainingsData)
            .sort((a, b) => b.feedback_score - a.feedback_score)
            .slice(0, 3);

        const sortedByEffectivenessTrainings = Object.values(trainingsData)
            .sort((a, b) => b.effectiveness_score - a.effectiveness_score)
            .slice(0, 3);

        const topFeedbackContainer = document.getElementById("topFeedbackTrainingChart");
        topFeedbackContainer.innerHTML = "<p>Based on Feedback Score.</p><br>";

        sortedByFeedbackTrainings.forEach(training => {
            const trainingElement = document.createElement("div");
            trainingElement.className = "top-training-item";
            trainingElement.innerHTML = `
                <h3 class="course-name">${training.training_name}</h3>
                <span class="course-score">${training.feedback_score}</span>
            `;
            topFeedbackContainer.appendChild(trainingElement);
        });

        const topEffectivenessContainer = document.getElementById("topEffectivenessTrainingChart");
        topEffectivenessContainer.innerHTML = "<p>Based on Effectiveness Score.</p><br>";

        sortedByEffectivenessTrainings.forEach(training => {
            const trainingElement = document.createElement("div");
            trainingElement.className = "top-training-item";
            trainingElement.innerHTML = `
                <h3 class="course-name">${training.training_name}</h3>
                <span class="course-score">${training.effectiveness_score}</span>
            `;
            topEffectivenessContainer.appendChild(trainingElement);
        });
    }
};


window.onload = () => {
    updateTrainings();
    updateEmployees();
    updateTrainingCompliance();
    updateDepartmentChart();
    updateTrainingProgramChart();
    updateTopTraining();
    categorizeTrainings();
};




function fetchData(type) {
    const baseUrl = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/";
    const endpoints = {
        1: "trainings.json",
        2: "employees.json",
        3: "trainers.json",
        4: "departments.json" // Endpoint for department details
    };

    // Function to fetch data with error handling
    const fetchJson = (endpoint) => {
        return axios.get(baseUrl + endpoint)
            .then(response => response.data)
            .catch(error => {
                console.error(`Error fetching ${endpoint}:`, error);
                return {};
            });
    };

    // Fetch all necessary data
    return Promise.all([
        fetchJson(endpoints[type]),
        fetchJson(endpoints[3]), // Trainers data
        fetchJson(endpoints[4])  // Department details
    ]).then(([mainData, trainersData, departmentDetails]) => {
        switch (type) {
            case 1: // Trainings
                return Object.keys(mainData).map(key => {
                    const training = mainData[key];
                    // Look up trainer name from trainers data
                    const trainerName = trainersData[training.trainer]?.name || training.trainer;
                    return {
                        title: training.training_name,
                        type: training.training_type,
                        duration: `${training.duration}hrs`,
                        effectiveness: training.effectiveness_score,
                        trainer: trainerName,
                        employeesAttended: training.employees_attended,
                        attendancePercentage: `${training.attendance}%`,
                        feedbackScore: training.feedback_score,


                        status: training.status,
                        topics: training.topics
                    };
                });
            case 2: // Employees
                return Object.keys(mainData).map(key => {
                    const employee = mainData[key];
                    // Look up full department name
                    const departmentName = departmentDetails?.[employee.emp_department]?.department_name || employee.emp_department;
                    console.log("Trying to access:", employee.emp_department, "=>", departmentDetails[employee.emp_department]?.department_name);

                    return {
                        name: employee.emp_name,
                        department: departmentName,
                        totalTrainingDays: `${employee.total_training_days} days`,
                        totalTrainingPrograms: employee.total_training_programs,
                        averageAttendance: employee.average_attendance,
                    };
                });
            case 3: // Trainers
                return Object.keys(mainData).map(key => {
                    const trainer = mainData[key];
                    return {
                        name: trainer.name,
                        trainingsConducted: trainer.trainings_conducted ? trainer.trainings_conducted.length : 0,
                        feedbackScore: trainer.feedback,
                    };
                });
            default:
                return [];
        }
    })
        .catch(error => {
            console.error(`Error fetching data for type ${type}:`, error);
            return [];
        });
}
function updateSecondFilter() {
    const mainCategory = document.getElementById('mainCategory').value;
    const secondFilter = document.getElementById('secondFilter');
    const thirdFilter = document.getElementById('thirdFilter');

    // Reset both filters
    secondFilter.innerHTML = '<option>Select condition</option>';
    thirdFilter.innerHTML = '<option>Select condition</option>';

    // Dynamically update second filter based on main category
    const filterOptions = {
        'Training Programs': [
            'Feedback Score',
            'Effectiveness Score',
            'Attendance'
        ],
        'Employees': [
            'Average Attendance',
            'Total Training Days',
            'Total Training Programs'
        ],
        'Trainers': [
            'Feedback Score'
        ]
    };

    (filterOptions[mainCategory] || []).forEach(option => {
        const el = document.createElement('option');
        el.textContent = option;
        secondFilter.appendChild(el);
    });
}

function updateThirdFilter() {
    const thirdFilter = document.getElementById('thirdFilter');
    thirdFilter.innerHTML = '<option>Select condition</option>';

    ['Greater than', 'Lesser than', 'Equals', 'Not Equals'].forEach(option => {
        const el = document.createElement('option');
        el.textContent = option;
        thirdFilter.appendChild(el);
    });
}

function setTableHeader(category) {
    const tableHeader = document.getElementById('tableHeader');
    tableHeader.innerHTML = ''; // Clear previous header

    const headerMap = {
        'Training Programs': [
            'Title', 'Type', 'Duration', 'Effectiveness',
            'Trainer', 'Employees Attended', 'Attendance %',
            'Feedback Score', 'Status'
        ],
        'Employees': [
            'Name', 'Department', 'Total Training Days',
            'Total Training Programs', 'Average Attendance'
        ],
        'Trainers': [
            'Name', 'Feedback Score', 'Number of Trainings Conducted'
        ]
    };

    const headers = headerMap[category] || [];
    const headerRow = document.createElement('tr');

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    tableHeader.appendChild(headerRow);
}

function generateTableRow(data, category) {
    const row = document.createElement('tr');
    const headerMap = {
        'Training Programs': [
            'Title', 'Type', 'Duration', 'Effectiveness',
            'Trainer', 'Employees Attended', 'Attendance %',
            'Feedback Score', 'Status'
        ],
        'Employees': [
            'Name', 'Department', 'Total Training Days',
            'Total Training Programs', 'Average Attendance'
        ],
        'Trainers': [
            'Name', 'Feedback Score', 'Number of Trainings Conducted'
        ]
    };

    const rowDataMap = {
        'Training Programs': [
            data.title,
            createTypeTag(data.type, 'type'),
            data.duration,
            data.effectiveness,
            data.trainer,
            data.employeesAttended,
            data.attendancePercentage,
            data.feedbackScore,
            //createTypeTag(data.mode, 'mode'),
            createTypeTag(data.status, 'status')
        ],
        'Employees': [
            data.name,
            data.department,
            data.totalTrainingDays,
            data.totalTrainingPrograms,
            data.averageAttendance
        ],
        'Trainers': [
            data.name,
            data.feedbackScore,
            data.trainingsConducted
        ]
    };

    const headers = headerMap[category] || [];
    const rowData = rowDataMap[category] || [];

    rowData.forEach((cellData, index) => {
        const cell = document.createElement('td');
        // Add data-label attribute for responsive design
        cell.setAttribute('data-label', headers[index]);

        if (typeof cellData === 'string' || typeof cellData === 'number') {
            cell.textContent = cellData;
        } else {
            cell.appendChild(cellData);
        }
        row.appendChild(cell);
    });

    return row;
}


function populateSidebar() {
    const topDepartments = document.getElementById('topDepartments');
    const topTrainees = document.getElementById('topTrainees');
    const topTrainers = document.getElementById('topTrainers');

    axios.get("https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/departments.json")
        .then(response => {
            const departments = Object.entries(response.data)
                .map(([id, dept]) => ({ id, ...dept }))
                .sort((a, b) => b.total_training_hours - a.total_training_hours)
                .slice(0, 3);

            departments.forEach((dept, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="header-row">
                        <span class="rank-label">Rank</span>
                        <span class="stat-label"></span>
                        <span class="stat-label">Employees Trained</span>
                        <span class="stat-label">Trainee Hrs</span>
                    </div>
                    <div class="value-row">
                        <span class="rank-number">${index + 1}</span>
                        <span class="department-name">${dept.department_name}</span>
                        <span class="stat-value">${dept.employees_trained}</span>
                        <span class="stat-value">${dept.total_training_hours} <span class="stat-hrs">Hrs</span></span>
                    </div>
                `;
                topDepartments.appendChild(li);
            });
        });

    axios.get("https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/employees.json")
        .then(response => {
            const trainees = Object.entries(response.data)
                .map(([id, emp]) => ({ id, ...emp }))
                .sort((a, b) => b.total_training_days - a.total_training_days)
                .slice(0, 3);

            trainees.forEach((trainee, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="header-row">
                        <span class="rank-label">Rank</span>
                        <span class="stat-label"></span>
                        <span class="stat-label">Total Training Days</span>
                    </div>
                    <div class="value-row">
                        <span class="rank-number">${index + 1}</span>
                        <span class="department-name">${trainee.emp_name}</span>
                        <span class="stat-value">${trainee.total_training_days} <span class="stat-hrs">Days</span></span>
                    </div>
                `;
                topTrainees.appendChild(li);
            });
        });

    axios.get("https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/trainers.json")
        .then(response => {
            const trainers = Object.entries(response.data)
                .map(([id, trainer]) => ({ id, ...trainer }))
                .sort((a, b) => b.feedback - a.feedback)
                .slice(0, 3);

            trainers.forEach((trainer, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="header-row">
                        <span class="rank-label">Rank</span>
                        <span class="stat-label"></span>
                        <span class="stat-label">Feedback</span>
                    </div>
                    <div class="value-row">
                        <span class="rank-number">${index + 1}</span>
                        <span class="department-name">${trainer.name}</span>
                        <span class="stat-value">${trainer.feedback}</span>
                    </div>
                `;
                topTrainers.appendChild(li);
            });
        });
}


document.addEventListener('DOMContentLoaded', populateSidebar);

// document.addEventListener("DOMContentLoaded", () => {
    const trainingDataUrl = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/trainings/.json";
    const employeesDataUrl = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/employees/.json";
    const trainersDataUrl = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/trainers/.json";
    
    axios.all([
        axios.get(trainingDataUrl),
        axios.get(employeesDataUrl),
        axios.get(trainersDataUrl) 
    ])
    .then(axios.spread((trainingsResponse, employeesResponse, trainersResponse) => {
        const trainingsData = trainingsResponse.data;
        const employeesData = employeesResponse.data;
        const trainersData = trainersResponse.data; 

        displayTrainings(trainingsData, trainersData);
        
    }))
    .catch(error => console.error("Error fetching data:", error));
// });

function displayTrainings(trainings, trainers) {
    const trainingList = document.getElementById("training-list");
    if (!trainingList) {
        console.error("Element with ID 'training-list' not found.");
        return;
    }

    trainingList.innerHTML = "";

    Object.keys(trainings).forEach(trainingId => {
        const training = trainings[trainingId];
        
        let typeClass = "";
        if (training.training_type === "softskills") {
            typeClass = "type-tag type-type-softskills";
        } else if (training.training_type === "language") {
            typeClass = "type-tag type-type-language";
        } else if (training.training_type === "technical") {
            typeClass = "type-tag type-type-technical";
        }
        
        let statusClass = "";
        if (training.status === "completed") {
            statusClass = "completed";
        } else if (training.status === "in-progress") {
            statusClass = "in-progress";
        } else if (training.status === "scheduled") {
            statusClass = "scheduled";
        }
        
    
        let trainerName = trainers && trainers[training.trainer] ? trainers[training.trainer].name : "No Trainer";
        

        let tableRow = `
        <tr class="training-item">
            <td id="training-title">${training.training_name}</td>
            <td class="${typeClass}">${training.training_type}</td>
            <td>${training.duration} hrs</td>
            <td>${training.target_audience.replace(/^dept0*/, "DU")}</td>
            <td>${trainerName}</td>
            <td>${training.employees_attended}</td>
            <td>${training.attendance}%</td>
            <td>${training.effectiveness_score}</td>
            <td ><p class="mode">${training.mode}<p></td>
            <td class="${statusClass}">${training.status}</td>
        </tr>`;

        trainingList.insertAdjacentHTML("beforeend", tableRow);
    });
}


async function selectEmployee(emp_id) {
    try {
        const [employeesResponse, trainersResponse, trainingsResponse] = await Promise.all([
            axios.get("https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/employees/.json"),
            axios.get("https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/trainers/.json"),
            axios.get("https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/trainings/.json")
        ]);

        const employees = employeesResponse.data;
        const trainers = trainersResponse.data;
        const trainings = trainingsResponse.data;

        // Find the specific employee

        const employee = employees[emp_id];
        if (!employee) {
            console.error("Employee not found:", emp_id);
            return;
        }

        
        displayEmployeeTrainings(emp_id,employees,trainings,trainers);
        
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}


function displayEmployeeTrainings(empId, employees, trainings, trainers) {
    const employeeList = document.getElementById("employeetraining-list");
    if (!employeeList) {
        console.error("Element with ID 'employee-training-list' not found.");
        return;
    }

    const employee = employees[empId]; 
    if (!employee) {
        console.error(`Employee with ID ${empId} not found.`);
        return;
    }

    const attendedTrainings = employee.trainings_done;
    if (!attendedTrainings) {
        console.error(`No trainings found for employee ${empId}.`);
        return;
    }

    employeeList.innerHTML = ""; 

    Object.keys(attendedTrainings).forEach(trainingId => {
        const training = trainings[trainingId]; 
        if (!training) return;

        let typeClass = "";
        if (training.training_type === "softskills") {
            typeClass = "type-tag type-type-softskills";
        } else if (training.training_type === "language") {
            typeClass = "type-tag type-type-language";
        } else if (training.training_type === "technical") {
            typeClass = "type-tag type-type-technical";
        }

        let statusClass = "";
        if (training.status === "completed") {
            statusClass = "completed";
        } else if (training.status === "in-progress") {
            statusClass = "in-progress";
        } else if (training.status === "scheduled") {
            statusClass = "scheduled";
        }

        

        let trainerName = trainers && trainers[training.trainer] ? trainers[training.trainer].name : "NO Trainer";

        let tableRow = `
        <tr>
            <td id="training-title">${training.training_name}</td>
            <td class="${typeClass}">${training.training_type}</td>
            <td>${training.duration} hrs</td>
            <td>${training.target_audience.replace(/^dept0*/, "DU")}</td>
            <td>${trainerName}</td>
            <td>${training.employees_attended}</td>
            <td>${training.attendance}%</td>
            <td>${training.effectiveness_score}</td>
            <td ><p class="mode">${training.mode}<p></td>
            <td class="${statusClass}">${training.status}</td>
        </tr>`;

        employeeList.insertAdjacentHTML("beforeend", tableRow);
    });
}


function searchTrainings() {
    let input = document.getElementById("searchInput").value.toLowerCase(); // Get input value
    let rows = document.querySelectorAll("#training-list tr"); // Get all table rows

    rows.forEach(row => {
        let trainingTitle = row.querySelector("td:first-child").textContent.toLowerCase(); // Get first column (Training Title)
        row.style.display = trainingTitle.includes(input) ? "" : "none"; // Show or hide row based on match
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const trainingDataUrl = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/trainings/.json";
    const employeesDataUrl = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/employees/.json";
    const trainersDataUrl = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/trainers/.json";
    
    axios.all([
        axios.get(trainingDataUrl),
        axios.get(employeesDataUrl),
        axios.get(trainersDataUrl) 
    ])
    .then(axios.spread((trainingsResponse, employeesResponse, trainersResponse) => {
        const trainingsData = trainingsResponse.data;
        const employeesData = employeesResponse.data;
        const trainersData = trainersResponse.data; 

        displayTrainings(trainingsData, trainersData);
        // displayEmployeeTrainings("emp001", employeesData, trainingsData,trainersData);
    }))
    .catch(error => console.error("Error fetching data:", error));
});

function displayTrainings(trainings, trainers) {
    const trainingList = document.getElementById("training-list");
    if (!trainingList) {
        console.error("Element with ID 'training-list' not found.");
        return;
    }

    trainingList.innerHTML = "";

    Object.keys(trainings).forEach(trainingId => {
        const training = trainings[trainingId];
        
        let typeClass = "";
        if (training.training_type === "softskills") {
            typeClass = "type-tag type-type-softskills";
        } else if (training.training_type === "language") {
            typeClass = "type-tag type-type-language";
        } else if (training.training_type === "technical") {
            typeClass = "type-tag type-type-technical";
        }
        
        let statusClass = "";
        if (training.status === "completed") {
            statusClass = "completed";
        } else if (training.status === "in-progress") {
            statusClass = "in-progress";
        } else if (training.status === "scheduled") {
            statusClass = "scheduled";
        }
        
    
        let trainerName = trainers && trainers[training.trainer] ? trainers[training.trainer].name : "No Trainer";
        
        let tableRow = `
        <tr>
            <td id="training-title">${training.training_name}</td>
            <td class="${typeClass}">${training.training_type}</td>
            <td>${training.duration} hrs</td>
            <td>${training.target_audience.replace(/^dept0*/, "DU")}</td>
            <td>${trainerName}</td>
            <td>${training.employees_attended}</td>
            <td>${training.attendance}%</td>
            <td>${training.effectiveness_score}</td>
            <td ><p class="mode">${training.mode}<p></td>
            <td class="${statusClass}">${training.status}</td>
        </tr>`;

        trainingList.insertAdjacentHTML("beforeend", tableRow);
    });
}


function displayEmployeeTrainings(empId, employees, trainings, trainers) {
    const employeeList = document.getElementById("employeetraining-list");
    if (!employeeList) {
        console.error("Element with ID 'employeetraining-list' not found.");
        return;
    }

    const employee = employees[empId]; 
    if (!employee) {
        console.error(`Employee with ID ${empId} not found.`);
        return;
    }

    const attendedTrainings = employee.trainings_done;
    if (!attendedTrainings) {
        console.error(`No trainings found for employee ${empId}.`);
        return;
    }

    // Find the parent table
    let tableContainer = employeeList.closest("table");
    if (!tableContainer) {
        console.error("No <table> element found wrapping #employeetraining-list.");
        return;
    }

    // Clear previous table content
    employeeList.innerHTML = "";
    tableContainer.innerHTML = ""; 

    // Create thead dynamically
    const tableHead = document.createElement("thead");
    tableHead.innerHTML = `
        <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Duration</th>
            <th>Target Audience</th>
            <th>Trainer</th>
            <th>Employee Attendance</th>
            <th>Attendance Percentage</th>
            <th>Feedback Score</th>
            <th>Mode</th>
            <th>Status</th>
        </tr>
    `;

    // Append thead to table
    tableContainer.appendChild(tableHead);
    tableContainer.appendChild(employeeList); // Reattach tbody

    // Create table rows dynamically
    Object.keys(attendedTrainings).forEach(trainingId => {
        const training = trainings[trainingId]; 
        if (!training) return;

        let typeClass = training.training_type === "softskills" ? "type-tag type-type-softskills" :
                        training.training_type === "language" ? "type-tag type-type-language" :
                        training.training_type === "technical" ? "type-tag type-type-technical" : "";

        let statusClass = training.status === "completed" ? "completed" :
                          training.status === "in-progress" ? "in-progress" :
                          training.status === "scheduled" ? "scheduled" : "";

        let trainerName = trainers && trainers[training.trainer] ? trainers[training.trainer].name : "Placeholder";

        let tableRow = `
        <tr>
            <td id="training-title">${training.training_name}</td>
            <td class="${typeClass}">${training.training_type}</td>
            <td>${training.duration} hrs</td>
            <td>${training.target_audience.replace(/^dept0*/, "DU")}</td>
            <td>${trainerName}</td>
            <td>${training.employees_attended}</td>
            <td>${training.attendance}%</td>
            <td>${training.effectiveness_score}</td>
            <td><p class="mode">${training.mode}</p></td>
            <td class="${statusClass}">${training.status}</td>
        </tr>`;

        employeeList.insertAdjacentHTML("beforeend", tableRow);
    });
}



function searchTrainings() {
    let input = document.getElementById("searchInput").value.toLowerCase(); // Get input value
    let rows = document.querySelectorAll("#training-list tr"); // Get all table rows

    rows.forEach(row => {
        let trainingTitle = row.querySelector("td:first-child").textContent.toLowerCase(); // Get first column (Training Title)
        row.style.display = trainingTitle.includes(input) ? "" : "none"; // Show or hide row based on match
    });
}

function populateTrainerSidebar() {
    const trainersList = document.getElementById('trainersList');
    const trainerTypeFilter = document.getElementById('trainerTypeFilter');

    let allTrainers = []; // Store all trainers for filtering

    // Fetch trainers data
    axios.get("https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/trainers.json")
        .then(response => {
            allTrainers = Object.entries(response.data).map(([id, trainer]) => ({ id, ...trainer }));
            renderTrainers(allTrainers);
        })
        .catch(error => {
            console.error("Error fetching trainers data:", error);
        });

    // Render trainers based on filter
    function renderTrainers(trainers) {
        trainersList.innerHTML = '';
        trainers.forEach(trainer => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="trainer-card">
                    <div class="trainer-card__left">
                        <h5 class="trainer-name">${trainer.name}</h5>
                        <span class="trainings-conducted">Trainings Provided: </span>
                        <span class="trainings-count">${trainer.trainings_conducted ? trainer.trainings_conducted.length : 0}</span>
                    </div>
                    <div class="trainer-card__right">
                        <span class="trainer-type">Type</span>
                        <span class="trainer-type__value">${trainer.type}</span>
                    </div>
                </div>
            `;
            trainersList.appendChild(li);
        });
    }

    // Filter trainers on dropdown change
    trainerTypeFilter.addEventListener('change', () => {
        const selectedType = trainerTypeFilter.value;
        if (selectedType === 'all') {
            renderTrainers(allTrainers); // Show all trainers
        } else {
            const filteredTrainers = allTrainers.filter(trainer => trainer.type === selectedType);
            renderTrainers(filteredTrainers); // Show filtered trainers
        }
    });
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', populateTrainerSidebar);

function populateEmployeeSidebar() {
    const employeeList = document.getElementById('employeeList');
    const employeeDepartmentFilter = document.getElementById('employeeDepartmentFilter');

    let allEmployees = []; // Store all employees for filtering
    let departmentMap = {}; // Map department IDs to names

    // Fetch department data
    axios.get("https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/departments.json")
        .then(response => {
            departmentMap = Object.fromEntries(
                Object.entries(response.data).map(([id, dept]) => [id, dept.department_name])
            );
        })
        .catch(error => {
            console.error("Error fetching department data:", error);
        });

    // Fetch employee data
    axios.get("https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/employees.json")
        .then(response => {
            allEmployees = Object.entries(response.data).map(([id, employee]) => ({
                id,
                ...employee,
                departmentName: departmentMap[employee.emp_department] || "Unknown"
            }));
            renderEmployees(allEmployees); // Render all employees initially
        })
        .catch(error => {
            console.error("Error fetching employees data:", error);
        });


    // Render employees based on filter
    function renderEmployees(employees, trainings, trainers) {
        const employeeList = document.getElementById("employeeList");
        employeeList.innerHTML = ''; 
    
        axios.get("https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/departments/.json")
            .then(response => {
                let departments = response.data; 
    
                employees.forEach(employee => {
                    const departmentName = departments?.[employee.emp_department]?.department_name || employee.emp_department;
    
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <div class="employee-sidebar-card" data-emp-id="${employee.emp_id}">
                            <div class="employee-sidebar-card__left">
                                <h5 class="employee-sidebar-card-name">${employee.emp_name}</h5>
                                <span class="trainings-attended">Trainings Attended: </span>
                                <span class="trainings-count">${employee.trainings_done ? Object.keys(employee.trainings_done).length : 0}</span>
                            </div>
                            <div class="employee-sidebar-card__right">
                                <span class="employee-sidebar-card-department">Department</span>
                                <span class="employee-sidebar-card__value">${departmentName}</span>
                            </div>
                        </div>
                    `;
    
                    li.addEventListener("click", () => {
                        selectEmployee(employee.id);
                        document.querySelector(".employee-dept").innerText = departmentName; 
                        document.querySelector(".employee-name").innerText = employee.emp_name;
                        document.querySelector(".employee-metrics1").innerText = employee.total_training_days;
                        document.querySelector(".employee-metrics2").innerText = employee.total_training_programs;
                        document.querySelector(".employee-metrics3").innerText = `${employee.average_attendance}%`;
                        document.querySelector(".metric-headings1").innerText = "Total Training Days";
                        document.querySelector(".metric-headings2").innerText = "Total Training Programs";
                        document.querySelector(".metric-headings3").innerText = "Total Training Average Attendance";
                    });
    
                    employeeList.appendChild(li);
                });
            })
            .catch(error => {
                console.error("Error fetching department data:", error);
            });
    }
    
    

    // Filter employees on dropdown change
    employeeDepartmentFilter.addEventListener('change', () => {
        const selectedDepartment = employeeDepartmentFilter.value;
        if (selectedDepartment === 'all') {
            renderEmployees(allEmployees); // Show all employees
        } else {
            const filteredEmployees = allEmployees.filter(employee => employee.departmentName.toLowerCase() === selectedDepartment.toLowerCase());
            renderEmployees(filteredEmployees); // Show filtered employees
        }
    });
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', populateEmployeeSidebar);



//Global Search

const searchInput = document.querySelector(".global-search");
const searchDropdown = document.querySelector(".global-search__dropdown");
const resultsContainer = document.getElementById("searchResults");

searchInput.addEventListener("focus", () => {
    resultsContainer.style.display = "block";
});

document.addEventListener("click", (event) => {
    if (!searchInput.contains(event.target) && !searchDropdown.contains(event.target) && !resultsContainer.contains(event.target)) {
        resultsContainer.style.display = "none";
    }
});
resultsContainer.style.display = "none";

searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    const category = searchDropdown.value;

    performSearch(query, category);
});

searchDropdown.addEventListener("change", () => {
    const query = searchInput.value.trim().toLowerCase();
    const category = searchDropdown.value;

    performSearch(query, category);
});

async function performSearch(query, category) {
    if (!query) return;
    let data;
    switch (category) {
        case "Training Programs":
            data = await fetchDataFromFire(tables[0]);
            break;
        case "Employees":
            data = await fetchDataFromFire(tables[1]);
            break;
        case "Trainers":
            data = await fetchDataFromFire(tables[2]);
            break;
        default:
            return;
    }

    if (!data) return;

    const filteredResults = Object.values(data).filter((item) => {
        return Object.values(item).some((value) => {
            return String(value).toLowerCase().includes(query)
        });
    });

    displayResults(filteredResults, category);
}

function displayResults(results, category) {
    if (!resultsContainer) return;
    
    if (results.length > 0) {
        resultsContainer.innerHTML = results
            .map(result => {
                return `
                    <div class="result-item">
                        ${formatResult(result, category)}
                    </div>
                `;
            })
            .join("");
    } else {
        resultsContainer.innerHTML = "<div class='no-results'>No results found</div>";
    }
}


function formatResult(result, category) {
    switch (category) {
        case "Training Programs":
            return `
                <h3>${result.training_name}</h3>
                <p><strong>Feedback Score:</strong> ${result.feedback_score}</p>
                <p><strong>Effectiveness Score:</strong> ${result.effectiveness_score}</p>
                <p><strong>Status:</strong> ${result.status}</p>
            `;
        case "Employees":
            return `
                <h3>${result.emp_name}</h3>
                <p><strong>Total Training Programs Done:</strong> ${result.total_training_programs}</p>
                <p><strong>Total Training Days Done:</strong> ${result.total_training_days}</p>
            `;
        case "Trainers":
            return `
                <h3>${result.name}</h3>
                <p><strong>Rating:</strong> ${result.feedback}</p>
                <p><strong>Type:</strong> ${result.type}</p>
            `;
        default:
            return `<p>Unknown category</p>`;
    }
}
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
                        mode: training.mode,
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
            'Feedback Score', 'Mode', 'Status'
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
            'Feedback Score', 'Mode', 'Status'
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
            createTypeTag(data.mode, 'mode'),
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
            let filteredData = dataSet.filter(item => {
                if (secondFilter === 'Select condition' || filterValue === '') return true;
                //console.log("Effectiveness Values:", dataSet.map(item => item.effectiveness));
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

            // Populate table with filtered data
            filteredData.forEach(item => {
                const row = generateTableRow(item, mainCategory);
                tableBody.appendChild(row);
            });
            resultsTable.classList.add('training-table');
            // Show/hide table based on results
            resultsTable.classList.toggle('visible', filteredData.length > 0);
        })
        .catch(error => {
            console.error("Error in filtering training data:", error);
        });
}


/////////////////////////////////////////////////////////////////////////
// Global variable to store fetched data
// Store filtered data





function getFilterValues() {
    let selects = document.querySelectorAll('.filter__select');
    let values = {
        year: selects[0]?.value || null,
        month: selects[1]?.value || null,
        quarter: selects[2]?.value || null,
    };
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

function fetchAndFilterData() {
    filteredTrainingsData = dayDate(trainingsData); // Store filtered data globally
    console.log("Final Filtered Data:", filteredTrainingsData);
}

// Attach event listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.filter__select').forEach(select => {
        select.addEventListener('change', fetchAndFilterData);
    });

    // fetchTrainingsData(); // Fetch data initially and filter it
});
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
    
    loadTrainingDetails(trainingId);
    initializeDropdown();
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

    const trainingElement = document.createElement('div');
    trainingElement.className = 'course-details';
    trainingElement.innerHTML = `
        <div class="type-mode">
            <button class="btn-type" data-type="${training.training_type}">${training.training_type}</button>
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
            <h3 class="status-title">Status: <span class="course-status-label" data-status="${training.status}">${training.status}</span></h3>
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
            <div class="employee-card" data-department="${empDepartment}">
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
                <div class="dropdown">
                    <button class="dropdown-btn">Select Status</button>
                    <ul class="dropdown-menu">
                        <li data-value="all">All</li>
                        <li data-value="Marketing">Marketing</li>
                        <li data-value="Engineering">Engineering</li>
                        <li data-value="HR">HR</li>
                        <li data-value="Finance">Finance</li>
                        <li data-value="Sales">Sales</li>
                    </ul>
                </div>
            </div>
        </div>
        <div id="employeeList">${employeeListHTML}</div>
    `;

    trainingContainer.appendChild(employeeDetailsElement);

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("back-button")) {
            document.querySelector(".course-modal").style.display = "none";
        }
    });
}
function initializeDropdown() {
    const dropdown = document.querySelector(".dropdown");
    const dropdownBtn = document.querySelector(".dropdown-btn");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    const employeeCards = document.querySelectorAll(".employee-card");

    if (!dropdown || !dropdownBtn || !dropdownMenu) {
        console.error("Dropdown elements not found.");
        return;
    }

    dropdownBtn.addEventListener("click", function(event) {
        event.stopPropagation();
        dropdown.classList.toggle("active");
    });

    dropdownMenu.addEventListener("click", function(event) {
        if (event.target.tagName === "LI") {
            const selectedDepartment = event.target.getAttribute("data-value");
            dropdownBtn.textContent = event.target.textContent;

            employeeCards.forEach(card => {
                if (selectedDepartment === "all" || card.dataset.department === selectedDepartment) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });

            dropdown.classList.remove("active"); 
        }
    });

    document.addEventListener("click", function(event) {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove("active");
        }
    });}
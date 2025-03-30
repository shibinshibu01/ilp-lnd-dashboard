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
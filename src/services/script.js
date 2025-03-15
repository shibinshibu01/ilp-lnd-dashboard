const url = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/.json";

axios.get(url)
    .then(response => {
        const data = response.data;

        let employees = Object.values(data.employees);
        const topPerformer = employees.reduce((max, emp) => 
            (emp.trainingHour> max.trainingHour ? emp : max), employees[0]);
        updateTopPerformer(topPerformer);

        let departments = Object.values(data.departments);
        const topDept = departments.reduce((max, dept) =>
            (dept.deptTrainingHours > max.deptTrainingHours ? dept : max), departments[0]);
        updateTopDept(topDept);

        
        let trainers = Object.values(data.trainers);
        const topTrainer = trainers.reduce((max, train) =>
            (train.feedbackScore > max.feedbackScore? train : max), trainers[0]);         
        updateTopTrainer(topTrainer);
    })

    .catch(error => {
        console.error("Axios Error:", error);
    });

function updateTopPerformer(employee) {
    document.querySelector('.employee .name').textContent = employee.firstName + " " + employee.lastName;
    document.querySelector('.employee .deptname').textContent = employee.deptName;
    document.querySelector('.employee .traininghr').textContent = employee.trainingHour;
}

function updateTopDept(department) {
    document.querySelector('.dept .name').textContent = department.deptName;
    document.querySelector('.dept .traininghr').textContent = department.deptTrainingHours;
}

function updateTopTrainer(trainer) {    
    document.querySelector('.trainer .name').textContent = trainer.firstName + " " + trainer.lastName;
}


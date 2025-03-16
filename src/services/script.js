const url = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/.json";

axios.get(url)
    .then(response => {
        const data = response.data;

        let employees = Object.values(data.employees);

        function topThree(object,key) {
            return object.reduce((top, current) => {
                top.push(current);  
                top.sort((a, b) => b[key] - a[key]); 
                if (top.length > 3) top.pop();    
                return top;
            }, []);
        }



        const topEmployees = topThree(employees, 'trainingHour');
        updateDisplayEmployee(topEmployees);

        const topTrainers = topThree(Object.values(data.trainers), 'feedbackScore');
        updateDisplayTrainer(topTrainers);

        const topDepartments= topThree(Object.values(data.departments), 'deptTrainingHours');
        updateDisplayDept(topDepartments);

    })
    .catch(error => {
        console.error("Axios Error:", error);
    });

function updateDisplayEmployee(topThree) {
    topThree.forEach((emp, index) => {
        document.querySelector(`.employee .name${index + 1}`).textContent = emp.firstName + emp.lastName;
        document.querySelector(`.employee .traininghr${index + 1}`).textContent = emp.trainingHour+"hrs";
    });
}

function updateDisplayTrainer(topThree) {
    topThree.forEach((train, index) => {
        document.querySelector(`.trainer .name${index + 1}`).textContent = train.firstName;
        document.querySelector(`.trainer .traininghr${index + 1}`).textContent = train.feedbackScore + "/5";
    });
}

function updateDisplayDept(topThree) {
    topThree.forEach((dept, index) => {
        document.querySelector(`.dept .name${index + 1}`).textContent = dept.deptName;
        document.querySelector(`.dept .traininghr${index + 1}`).textContent = dept.deptTrainingHours +"hrs";
    });
}
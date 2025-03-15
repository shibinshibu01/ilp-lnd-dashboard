const url = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/.json"; // Ensure to fetch with .json

axios.get(url)
    .then(response => {

        const data = response.data;
        let totalTraineeHours = 0;

        if (data.employees) {
            Object.values(data.employees).forEach(employee => {
                totalTraineeHours += employee.trainingHour || 0;
            });
        }

        document.querySelector('.total-hours__entry__trainee .total-hours__number').textContent = totalTraineeHours;

        let totalCourseHours = 0;

        if (data.courses) {
            Object.values(data.courses).forEach(course => {
                totalCourseHours += course.duration || 0;
            });
        }

        document.querySelector('.total-hours__entry__course .total-hours__number').textContent = totalCourseHours;




    })
    .catch(error => {
        console.error('Axios Error:', error);
    });



// document.querySelector('.total-hours__entry__trainee .total-hours__number').textContent = traineeHours;
// document.querySelector('.total-hours__entry__course .total-hours__number').textContent = courseHours;




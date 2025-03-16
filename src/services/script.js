const url = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/.json"; // Ensure to fetch with .json
let data = null;
axios.get(url)
    .then(response => {

        data = response.data;
        let totalTraineeHours = 0;
        console.log(data);

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


        const nominations = data.nominations;
        const nominationCards = document.querySelector('.nomination-cards');
        Object.values(nominations).forEach(nomination => {
            if (nomination.isApproved) {
                const nominationItem = document.createElement('div');
                nominationItem.classList.add('nomination-item');

                const courseImageElement = document.createElement('img');
                courseImageElement.src = nomination.picture;
                courseImageElement.alt = nomination.courseName;
                courseImageElement.classList.add('course-image');
                nominationItem.appendChild(courseImageElement);
                
                const textContainer = document.createElement('div');
                textContainer.classList.add('text-container');

                const nameElement = document.createElement('h4');
                nameElement.textContent = nomination.empName;
                textContainer.appendChild(nameElement);

                const empIdElement = document.createElement('h6');
                empIdElement.textContent = nomination.empId;
                textContainer.appendChild(empIdElement);

                const courseNameElement = document.createElement('h5');
                courseNameElement.textContent = nomination.courseName;
                textContainer.appendChild(courseNameElement);

                nominationItem.appendChild(textContainer); // Append textContainer to nominationItem
                nominationCards.appendChild(nominationItem); // Append nominationItem to nominationCards
            }
        });
    })
    .catch(error => {
        console.error('Axios Error:', error);
    });


// var modal = document.getElementById("course-modal");
var btn = document.querySelector('.total-hours__entry__course .total-hours__number');

btn.addEventListener("click", function (event) {
    openCourseModal("course021")
});


const courseModalBackdrop = document.getElementById('courseModalBackdrop');
const buttonContainer = document.getElementById('buttonContainer');

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    return `${day}${getDaySuffix(day)} ${month} ${year}`;
}

function getDaySuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}


function populateModalData(courseId) {
    const course = data.courses[courseId];

    document.getElementById('courseImage').src = course.courseBannerImage;

    const typeElement = document.getElementById('courseType');
    typeElement.textContent = course.courseType;
    typeElement.className = 'course-modal__tag';
    if (course.courseType === 'Technical') {
        typeElement.classList.add('course-modal__tag-technical');
    } else if (course.courseType === 'Softskills') {
        typeElement.classList.add('course-modal__tag-softskills');
    } else {
        typeElement.classList.add('course-modal__tag-behavioural');
    }

    document.getElementById('courseName').textContent = course.courseName;
    document.getElementById('courseDescription').textContent = course.shortDescription;
    document.getElementById('courseDuration').textContent = `${course.duration} hrs`;
    document.getElementById('courseStartDate').textContent = formatDate(course.startDate);

    const statusElement = document.getElementById('courseStatus');
    statusElement.textContent = course.status;
    statusElement.className = 'course-modal__detail-value';
    if (course.status === 'completed') {
        statusElement.classList.add('course-modal__status-completed');
    } else if (course.status === 'ongoing') {
        statusElement.classList.add('course-modal__status-ongoing');
    } else {
        statusElement.classList.add('course-modal__status-upcoming');
    }
    ////////////////////////////////////////////////
    var attendance = 0;
    var totalNominiees = course.totalNominees;
    var totalAttendees = course.totalAttendees;
    attendance = (totalAttendees / totalNominiees) * 100;

    /////////////////////////////////
    document.getElementById('courseTrainer').textContent = course.trainerName;
    document.getElementById('courseTypeDetails').textContent = course.courseType.toLowerCase();
    document.getElementById('courseMode').textContent = course.mode.toLowerCase();

    document.getElementById('courseFeedback').textContent = course.feedbackScore.toFixed(1);
    document.getElementById('courseEffectiveness').textContent = course.effectiveness.toFixed(1);
    document.getElementById('courseAttendance').textContent = attendance.toFixed(1) + "%";
}

function openCourseModal(courseId) {
    populateModalData(courseId);
    courseModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCourseModal() {
    courseModalBackdrop.classList.remove('active');
    document.body.style.overflow = 'auto';
}


courseModalBackdrop.addEventListener("click", function (event) {
    if (event.target === courseModalBackdrop) {
        closeCourseModal();
    }
});
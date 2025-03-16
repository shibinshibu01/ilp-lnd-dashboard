const url = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/.json";
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

        // Category Chart creation

        const courseCategoriesFunction = () => {
            let technicalCourses = 0;
            let softSkillsCourses = 0;
            let behavioralCourses = 0;
            if (data.courses) {
                Object.values(data.courses).forEach(course => {
                    if (course.courseType === 'Technical') {
                        technicalCourses++;
                    } else if (course.courseType === 'Softskills') {
                        softSkillsCourses++;
                    } else {
                        behavioralCourses++;
                    }
                });
            }
            return [technicalCourses, softSkillsCourses, behavioralCourses];
        };
        const [technicalCourses, softSkillsCourses, behavioralCourses] = courseCategoriesFunction();

        const courseCategoriesChart = document.getElementById('courseCategories').getContext('2d');
        
        const myChart = new Chart(courseCategoriesChart, {
            type: 'bar',
            data: {
                labels: ['Technical', 'Soft Skills', 'Behavioral'],
                datasets: [{
                    data: [technicalCourses, softSkillsCourses, behavioralCourses],
                    backgroundColor: ['#DC143B', '#DC143B', '#DC143B'],
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false 
                    }
                }
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
//to display courses
axios.get(url)
        .then(response => {
            console.log('Axios Data:', response.data);
            const courses=response.data.courses;
            
            const courseContainer = document.querySelector(".course-container");
            let newContent = "";
            
            Object.keys(courses).forEach(key=>{
                const course=courses[key];
                let courseTypeClass = "";
                if (course.courseType === "Softskills") {
                        courseTypeClass = "softskills-course";
                } else if (course.courseType === "Technical") {
                        courseTypeClass = "technical-course";
                } else if (course.courseType === "Behavioural") {
                        courseTypeClass = "behavioral-course";
                }
                let coursestatusClass = "";
                if (course.status === "completed") {
                        coursestatusClass = "completed-class";
                } else if (course.status === "in-progress") {
                        coursestatusClass = "inprogress-class";
                } else if (course.status === "scheduled") {
                        coursestatusClass = "scheduled-class";
                }
                newContent += `
                    <div class="course-card">
                        <div class="course-type-badge">
                            <button id="courseType" class="${courseTypeClass}">${course.courseType}</button>
                        </div>
                        <img class="course-img" src="${course.courseBannerImage}">
                        <div class="course-content">
                            <div class="title-type">
                                <h3 id="courseTitle">${course.courseName}</h3>
                            </div>
                            <p id="courseDesc">${course.shortDescription}</p>
                            <p id="courseDuration">duration: <span class="dynamic-content">${course.duration} hrs</span><p>
                            <p id="courseStartDate">start date: <span class="dynamic-content">${formatDate(course.startDate)}</span></p>
                            <div class="coursestatus-mode">
                                <p id="courseStatus">status: <span class="${coursestatusClass}">${course.status}</span></p>
                                <p id="courseMode"><span class="dynamic-content_mode">${course.mode}</span></p>
                            </div>
                        </div>
                    </div>`;
            });

            courseContainer.innerHTML = newContent;

            const prevBtn = document.getElementById("prevBtn");
            const nextBtn = document.getElementById("nextBtn");

            function formatDate(dateString) {
                const date = new Date(dateString);
                const day = date.getDate(); 
                const month = date.toLocaleString('en-US', { month: 'short' }); 
                const year = date.getFullYear();
            
                return `${day} ${month} ${year}`;
            }

            let autoScroll;

            function startAutoScroll(){
                stopAutoScroll();
                autoScroll=setInterval(() => {
                    courseContainer.scrollBy({left:320,behavior:'smooth'});

                    if (courseContainer.scrollLeft + courseContainer.clientWidth >= courseContainer.scrollWidth) {
                        setTimeout(() => {
                            courseContainer.scrollTo({ left: 0, behavior: 'smooth' });
                        }, 500); 
                    }
                }, 2500);
            }

            function stopAutoScroll(){
                clearInterval(autoScroll);
            }

            nextBtn.addEventListener("click",()=>{
                stopAutoScroll();
                courseContainer.scrollBy({left:320,behavior:'smooth'});
                setTimeout(startAutoScroll(),5000);
            })
            
            prevBtn.addEventListener("click",()=>{
                stopAutoScroll();
                courseContainer.scrollBy({left:-320,behavior:'smooth'});
                setTimeout(startAutoScroll(),5000);
            })

            courseContainer.addEventListener("mouseenter", stopAutoScroll());
            courseContainer.addEventListener("mouseleave", startAutoScroll());

            startAutoScroll();
        })
        .catch(error=>{
            console.error('Axios Error: ',error);
            document.querySelector(".course-container").innerHTML = "<p>Error fetching courses.</p>";
        })









const url = "https://ilp-js-default-rtdb.asia-southeast1.firebasedatabase.app/.json"; 


    axios.get(url)
        .then(response => {
            console.log('Axios Data:', response.data);
            const courses=response.data.courses;
            
            const courseContainer = document.querySelector(".course-container");
            let newContent = "";
            
            Object.keys(courses).forEach(key=>{
                const course=courses[key];
                newContent += `
                    <div class="course-card">
                        <img class="course-img" src="${course.courseBannerImage}">
                        <div class="course-content">
                            <div class="title-mode">
                                <h3>${course.courseName}</h3>
                                <button>${course.mode}</button>
                            </div>
                            <h4>Duration: ${course.duration}</h4>
                            <div class="coursestart-status">
                                <p>Start date: ${course.startDate}</p>
                                <p><span>Status: ${course.status}</span></p>
                            </div>
                        </div>
                    </div>`;
            });

            courseContainer.innerHTML = newContent;

            const prevBtn = document.getElementById("prevBtn");
            const nextBtn = document.getElementById("nextBtn");

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
        

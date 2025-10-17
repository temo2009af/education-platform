document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // 0. وظيفة التحقق من حالة الدخول وتوجيه المستخدم (الآلية الجديدة للتقييد)
    // ----------------------------------------------------
    window.checkAuthenticationAndRedirect = function(shouldBeLoggedIn) {
        const currentUserEmail = localStorage.getItem('currentUser');
        
        // التحقق من الصفحات المقيدة (index, courses, detail, profile)
        if (shouldBeLoggedIn) {
            if (!currentUserEmail) {
                // منع التوجيه اللانهائي إذا كان المستخدم بالخطأ في صفحة الدخول أو التسجيل
                const path = window.location.pathname;
                if (!path.includes('login.html') && !path.includes('signup.html')) {
                    alert('يجب تسجيل الدخول أولاً للوصول إلى هذا المحتوى.');
                    window.location.href = 'login.html';
                }
                return; 
            }
        } 
        // التحقق من صفحات المصادقة (login, signup)
        else {
            if (currentUserEmail) {
                // مسجل دخوله بالفعل، يوجه لصفحة البروفايل
                window.location.href = 'profile.html';
                return;
            }
        }
    }


    // ----------------------------------------------------
    // 1. وظائف المصادقة (التسجيل والدخول) وحفظ البيانات في Local Storage
    // ----------------------------------------------------

    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    // **أ. إنشاء حساب جديد (Signup)**
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (localStorage.getItem(email)) {
                alert('هذا الإيميل مستخدم بالفعل. يرجى تسجيل الدخول.');
                return;
            }

            const userData = {
                name: name,
                email: email,
                password: password, 
                // مسار الصورة الافتراضية
                profilePicture: 'js/images/default-profile.png', 
                enrolledCourses: [] 
            };

            localStorage.setItem(email, JSON.stringify(userData));
            localStorage.setItem('currentUser', email);

            alert('تم إنشاء حسابك بنجاح! سيتم تحويلك لصفحة البروفايل.');
            window.location.href = 'profile.html';
        });
    }

    // **ب. تسجيل الدخول (Login)**
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const storedUser = localStorage.getItem(email);

            if (storedUser) {
                const userData = JSON.parse(storedUser);
                if (userData.password === password) {
                    localStorage.setItem('currentUser', email);
                    alert('أهلاً بعودتك! تم تسجيل الدخول.');
                    window.location.href = 'profile.html';
                } else {
                    alert('كلمة المرور غير صحيحة.');
                }
            } else {
                alert('لا يوجد حساب بهذا الإيميل. يرجى إنشاء حساب.');
            }
        });
    }
    
    // **ج. تسجيل الخروج (Logout)**
    window.logout = function() {
        localStorage.removeItem('currentUser');
        alert('تم تسجيل الخروج بنجاح.');
        window.location.href = 'login.html'; // يوجه مباشرة لصفحة الدخول المقيدة
    }


    // ----------------------------------------------------
    // 2. وظيفة تحميل وتشغيل الفيديو (HTML5)
    // ----------------------------------------------------
    window.loadVideo = function(videoFileName, videoTitle) { 
        const currentUserEmail = localStorage.getItem('currentUser');
        if (!currentUserEmail) {
            alert('يجب تسجيل الدخول أولاً لمشاهدة محتوى الكورس.');
            window.location.href = 'login.html';
            return;
        }

        const videoPlayer = document.getElementById('main-video-player');
        const videoTitleElement = document.getElementById('current-video-title');
        
        if (videoPlayer && videoTitleElement) {
            // المسار داخل مجلد 'js/'
            videoPlayer.src = `js/${videoFileName}`; 
            
            videoTitleElement.textContent = `تشاهد الآن: ${videoTitle}`;
            
            videoPlayer.load(); 
            videoPlayer.play(); 
            
            document.getElementById('video-player-container').scrollIntoView({ behavior: 'smooth' });
        }
    };


    // ----------------------------------------------------
    // 3. وظائف صفحة البروفايل (تحميل وعرض البيانات)
    // ----------------------------------------------------
    
    if (document.body.classList.contains('profile-page')) {
        const currentUserEmail = localStorage.getItem('currentUser');
        if (!currentUserEmail) {
            return; 
        }

        const storedUser = localStorage.getItem(currentUserEmail);
        const userData = JSON.parse(storedUser);
        
        document.getElementById('profile-name').textContent = userData.name;
        document.getElementById('profile-email').textContent = userData.email;
        const profileImgElement = document.getElementById('profile-img');
        
        if (userData.profilePicture) {
            profileImgElement.src = userData.profilePicture;
        } else {
            profileImgElement.src = 'js/images/default-profile.png';
        }
        
        // ... (يمكن إضافة كود عرض الكورسات المسجل بها هنا لاحقاً) ...
    }
    
    // ----------------------------------------------------
    // 4. وظائف تجميلية (Accordion & Lazy Loading & Filter)
    // ----------------------------------------------------
    
    // وظيفة الأكورديون
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isActive = header.classList.contains('active');

            document.querySelectorAll('.accordion-header').forEach(h => {
                h.classList.remove('active');
                h.nextElementSibling.style.maxHeight = null;
            });
            
            if (!isActive) {
                header.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // وظيفة Lazy Loading (تحميل الصور عند الحاجة)
    const lazyImages = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.onload = () => {
                    img.style.opacity = 1; 
                };
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => {
        observer.observe(img);
    });

    // وظيفة فلترة الكورسات
    const filterButtons = document.querySelectorAll('.filter-btn');
    const coursesGrid = document.querySelector('.courses-grid');

    if (coursesGrid) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const category = button.dataset.category;
                const courses = coursesGrid.querySelectorAll('.course-card');

                courses.forEach(card => {
                    if (category === 'all' || card.classList.contains(category)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

});

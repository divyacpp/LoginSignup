document.addEventListener('DOMContentLoaded', () => {
    // Auth DOM Hooks
    const authContainer = document.getElementById('main-container');
    const loginBox = document.getElementById('login-box');
    const signupBox = document.getElementById('signup-box');
    const dashboardBox = document.getElementById('dashboard-box');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const toSignup = document.getElementById('to-signup');
    const toLogin = document.getElementById('to-login');
    const logoutBtn = document.getElementById('logout-btn');
    const loginMessage = document.getElementById('login-message');
    const signupMessage = document.getElementById('signup-message');
    const userDisplayName = document.getElementById('user-display-name');

    // Quiz DOM Hooks
    const qNumberSpan = document.getElementById('question-number');
    const scoreSpan = document.getElementById('score-counter');
    const qTextH2 = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const nextBtn = document.getElementById('next-btn');

    // Sample Question Repository Bank
    const quizQuestions = [
        {
            question: "Which language runs inside a standard web browser?",
            options: ["Java", "C", "Python", "JavaScript"],
            answer: 3
        },
        {
            question: "What does CSS stand for?",
            options: ["Cascading Style Sheets", "Creative Style System", "Computer Style Sheets", "Complex Style Syntax"],
            answer: 0
        },
        {
            question: "Which HTML tag is used to link an external JavaScript file?",
            options: ["<link>", "<script>", "<js>", "<href>"],
            answer: 1
        }
    ];

    let currentQuestionIndex = 0;
    let currentScore = 0;

    // --- Authentication Toggles & Logic ---
    toSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginBox.classList.add('hidden');
        signupBox.classList.remove('hidden');
        resetForms();
    });

    toLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupBox.classList.add('hidden');
        loginBox.classList.remove('hidden');
        resetForms();
    });

    function resetForms() {
        loginMessage.textContent = '';
        signupMessage.textContent = '';
        loginForm.reset();
        signupForm.reset();
    }

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;

        // FIXED: Password length check validation rule
        if (password.length < 8) {
            signupMessage.textContent = 'Password must be at least 8 characters.';
            signupMessage.className = 'message error';
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(u => u.email === email)) {
            signupMessage.textContent = 'Account already registered with this email!';
            signupMessage.className = 'message error';
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(users));

        signupMessage.textContent = 'Success! Directing to login panel...';
        signupMessage.className = 'message success';

        setTimeout(() => {
            signupBox.classList.add('hidden');
            loginBox.classList.remove('hidden');
            resetForms();
        }, 1300);
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        let users = JSON.parse(localStorage.getItem('users')) || [];
        const validUser = users.find(u => u.email === email && u.password === password);

        if (validUser) {
            localStorage.setItem('currentUser', JSON.stringify(validUser));
            loadDashboard(validUser.name);
        } else {
            loginMessage.textContent = 'Invalid email credentials or password.';
            loginMessage.className = 'message error';
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        dashboardBox.classList.add('hidden');
        authContainer.classList.remove('hidden');
        resetForms();
    });

    // --- Dashboard & Quiz Control Functions ---
    function loadDashboard(name) {
        authContainer.classList.add('hidden');
        userDisplayName.textContent = name;
        dashboardBox.classList.remove('hidden');
        
        // Initialize Quiz variables to zero state
        currentQuestionIndex = 0;
        currentScore = 0;
        scoreSpan.textContent = `Score: ${currentScore}`;
        loadQuizQuestion();
    }

    function loadQuizQuestion() {
        nextBtn.classList.add('hidden');
        optionsContainer.innerHTML = '';
        
        const currentData = quizQuestions[currentQuestionIndex];
        qNumberSpan.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
        qTextH2.textContent = currentData.question;

        currentData.options.forEach((optText, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = optText;
            btn.addEventListener('click', () => handleOptionSelection(index, btn));
            optionsContainer.appendChild(btn);
        });
    }

    function handleOptionSelection(selectedIndex, clickedBtn) {
        const correctIndex = quizQuestions[currentQuestionIndex].answer;
        const allButtons = optionsContainer.querySelectorAll('.option-btn');

        // Lock interface selection choices
        allButtons.forEach(b => b.setAttribute('disabled', 'true'));

        if (selectedIndex === correctIndex) {
            clickedBtn.classList.add('correct');
            currentScore += 10;
            scoreSpan.textContent = `Score: ${currentScore}`;
        } else {
            clickedBtn.classList.add('wrong');
            allButtons[correctIndex].classList.add('correct'); // Highlight answer logic
        }

        nextBtn.classList.remove('hidden');
    }

    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizQuestions.length) {
            loadQuizQuestion();
        } else {
            // Render quiz wrap-up summary page card info text parameters
            qNumberSpan.textContent = 'Assessment Finished';
            qTextH2.textContent = `Congratulations! You finished the quiz with a total score of ${currentScore} points.`;
            optionsContainer.innerHTML = '';
            nextBtn.classList.add('hidden');
        }
    });

    // Persistent login check
    const activeUser = JSON.parse(localStorage.getItem('currentUser'));
    if (activeUser) {
        loadDashboard(activeUser.name);
    }
});
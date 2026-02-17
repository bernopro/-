let fullExamQuestions = [];
let timerInterval;
let timeLeft = 20 * 60;

// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('themeToggle');
    
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeToggle) themeToggle.textContent = '☀️';
    } else {
        if (themeToggle) themeToggle.textContent = '🌙';
    }
    
    // Start the exam after theme is loaded
    setTimeout(() => {
        startExam();
    }, 100);
});

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function startExam() {
    // Use all questions, just shuffle the order
    fullExamQuestions = shuffleArray([...questions]);
    generateExam();
    startTimer();
}

function generateExam() {
    const quizForm = document.getElementById("quizForm");
    quizForm.innerHTML = "";

    // Display ALL questions
    fullExamQuestions.forEach((q, index) => {
        const questionDiv = document.createElement("div");
        questionDiv.classList.add("question");

        let shuffled = shuffleArray(
            q.options.map((opt, i) => ({
                text: opt,
                correct: i === q.answer
            }))
        );

        questionDiv.innerHTML = `
            <p>${index + 1}. ${q.question}</p>
            <div class="options">
                ${shuffled.map(opt => `
                    <label>
                        <input type="radio" name="q${index}" data-correct="${opt.correct}">
                        ${opt.text}
                    </label>
                `).join("")}
            </div>
        `;

        quizForm.appendChild(questionDiv);
    });
}

function startTimer() {
    // Clear any existing timer first
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // Create timer display if it doesn't exist
    let timerDisplay = document.getElementById("timer");
    if (!timerDisplay) {
        timerDisplay = document.createElement("div");
        timerDisplay.id = "timer";
        timerDisplay.classList.add("timer-display");
        document.body.appendChild(timerDisplay);
    }

    timerInterval = setInterval(() => {
        timeLeft--;

        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;

        timerDisplay.innerText = 
            `Ժամանակ՝ ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

        // Add warning class in last 1 minute
        if (timeLeft <= 60) {
            timerDisplay.classList.add("timer-warning");
        }

        // Time up
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }

    }, 1000);
}

function submitQuiz() {
    clearInterval(timerInterval);

    let score = 0;

    fullExamQuestions.forEach((q, index) => {
        const radios = document.querySelectorAll(`input[name="q${index}"]`);

        radios.forEach(radio => {
            const label = radio.parentElement;

            // reset classes
            label.classList.remove('correct-option', 'wrong-option');

            if (radio.checked && radio.dataset.correct === "true") {
                score++;
                label.classList.add("correct-option");
            }

            if (radio.checked && radio.dataset.correct === "false") {
                label.classList.add("wrong-option");
            }

            // always show correct answer in green
            if (radio.dataset.correct === "true") {
                label.classList.add("correct-option");
            }

            radio.disabled = true;
        });
    });

    let total = fullExamQuestions.length;

    // Calculate percentage and Armenian grade
    let percentage = Math.round((score / total) * 100);
    let armenianGrade = getArmenianGrade(percentage);

    document.getElementById("result").innerHTML = `
        <h2>Քննության արդյունք</h2>
        Ճիշտ պատասխաններ: ${score} / ${total}<br>
        Տոկոսային գնահատական: ${percentage}%<br>
        Հայկական գնահատական: ${armenianGrade}
    `;
}

function getArmenianGrade(percentage) {
    if (percentage >= 95) return "10";
    if (percentage >= 90) return "9+";
    if (percentage >= 85) return "9";
    if (percentage >= 80) return "8+";
    if (percentage >= 75) return "8";
    if (percentage >= 70) return "7+";
    if (percentage >= 65) return "7";
    if (percentage >= 60) return "6+";
    if (percentage >= 55) return "6";
    if (percentage >= 50) return "5+";
    if (percentage >= 45) return "5";
    if (percentage >= 40) return "4+";
    if (percentage >= 35) return "4";
    if (percentage >= 30) return "3+";
    if (percentage >= 25) return "3";
    if (percentage >= 20) return "2+";
    return "2";
}

function resetQuiz() {
    clearInterval(timerInterval);

    // Reset timer back to 20 minutes
    timeLeft = 20 * 60;

    const timerDisplay = document.getElementById("timer");
    if (timerDisplay) {
        timerDisplay.innerText = "Ժամանակ՝ 20:00";
        timerDisplay.classList.remove("timer-warning");
    }

    // Clear result
    document.getElementById("result").innerHTML = "";

    // Remove styling from all labels
    document.querySelectorAll('.options label').forEach(label => {
        label.classList.remove('correct-option', 'wrong-option');
    });

    // Re-enable all radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.disabled = false;
        radio.checked = false;
    });

    // Regenerate fresh randomized exam
    startExam();
}

function goHome() {
    window.location.href = 'index.html';
}
let examQuestions = [];
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
});

// Make sure your 117 questions are stored in a global variable called `questions`
// Example: const questions = [ ... 117 objects ... ];

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function startExam() {
    examQuestions = shuffleArray([...questions]); // randomize all 117
    generateExam();
    startTimer();
}

function generateExam() {
    const quizForm = document.getElementById("quizForm");
    quizForm.innerHTML = "";

    examQuestions.forEach((q, index) => {
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
    // Create timer display if it doesn't exist
    let timerDisplay = document.getElementById("timer");
    if (!timerDisplay) {
        timerDisplay = document.createElement("div");
        timerDisplay.id = "timer";
        timerDisplay.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: var(--card-bg);
            padding: 10px 15px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            border: 1px solid var(--card-border);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            z-index: 999;
            color: var(--text-color);
        `;
        document.body.appendChild(timerDisplay);
    }

    timerInterval = setInterval(() => {
        timeLeft--;

        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;

        timerDisplay.innerText = 
            `Ժամանակ՝ ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

        // 🔴 TURN RED IN LAST 1 MINUTE
        if (timeLeft <= 60) {
            timerDisplay.style.color = "red";
        }

        // ⏰ TIME UP
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }

    }, 1000);
}

function submitQuiz() {
    clearInterval(timerInterval);

    let score = 0;

    examQuestions.forEach((q, index) => {
        const radios = document.querySelectorAll(`input[name="q${index}"]`);

        radios.forEach(radio => {
            const label = radio.parentElement;

            // reset styles
            label.style.background = "";
            label.style.border = "";

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

    let total = examQuestions.length;

    // Grade from 0 to 1
    let grade = (score / total).toFixed(3);

    document.getElementById("result").innerHTML = `
        <h2>Քննության արդյունք</h2>
        Ճիշտ պատասխաններ: ${score} / ${total}<br>
        Վերջնական գնահատական: ${grade}
    `;
}

function resetQuiz() {
    clearInterval(timerInterval);

    // Reset timer back to 20 minutes
    timeLeft = 20 * 60;

    const timerDisplay = document.getElementById("timer");
    if (timerDisplay) {
        timerDisplay.innerText = "Ժամանակ՝ 20:00";
        timerDisplay.style.color = "var(--text-color)";
    }

    // Clear result
    document.getElementById("result").innerHTML = "";

    // Remove styling from all labels
    document.querySelectorAll('.options label').forEach(label => {
        label.classList.remove('correct-option', 'wrong-option');
        label.style.background = "";
        label.style.border = "";
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
    // Add your home navigation logic here
    window.location.href = 'index.html'; // or wherever your home page is
}

// Auto start when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure theme is loaded first
    setTimeout(() => {
        if (typeof questions !== 'undefined' && questions.length > 0) {
            startExam();
        }
    }, 100);
});
// ============================
// Shared utilities for all quiz pages
// ============================

// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');

    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeToggle.textContent = '\u{1F319}';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '\u{2600}\u{FE0F}';
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('themeToggle');

    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeToggle) themeToggle.textContent = '\u{2600}\u{FE0F}';
    } else {
        if (themeToggle) themeToggle.textContent = '\u{1F319}';
    }
});

// Fisher-Yates shuffle (unbiased)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Armenian grading scale
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

// Navigate to home page
function goHome() {
    window.location.href = 'index.html';
}

// Generate exam questions into #quizForm using getExamQuestions() from the page-specific script
let examQuestions = [];

function generateExam() {
    const quizForm = document.getElementById("quizForm");
    quizForm.innerHTML = "";

    examQuestions = getExamQuestions();
    const fragment = document.createDocumentFragment();

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

        fragment.appendChild(questionDiv);
    });

    quizForm.appendChild(fragment);
}

// Submit quiz and show results
function submitQuiz() {
    let score = 0;

    examQuestions.forEach((q, index) => {
        const radios = document.querySelectorAll(`input[name="q${index}"]`);

        radios.forEach(radio => {
            const label = radio.parentElement;

            label.classList.remove('correct-option', 'wrong-option');

            if (radio.checked && radio.dataset.correct === "true") {
                score++;
                label.classList.add("correct-option");
            }

            if (radio.checked && radio.dataset.correct === "false") {
                label.classList.add("wrong-option");
            }

            if (radio.dataset.correct === "true") {
                label.classList.add("correct-option");
            }

            radio.disabled = true;
        });
    });

    let total = examQuestions.length;
    let percentage = Math.round((score / total) * 100);
    let armenianGrade = getArmenianGrade(percentage);

    document.getElementById("result").innerHTML = `
        <h2>\u0554\u0576\u0576\u0578\u0582\u0569\u0575\u0578\u0582\u0576 \u0561\u0580\u0564\u0575\u0578\u0582\u0576\u0568</h2>
        \u054B\u056B\u0577\u057F \u057A\u0561\u057F\u0561\u057D\u057D\u0561\u0570\u0576\u0565\u0580: ${score} / ${total}<br>
        \u053F\u0578\u056D\u057D\u0561\u0575\u056B\u0576 \u0563\u0576\u0561\u0570\u0561\u056F\u0561\u0576: ${percentage}%<br>
        \u0540\u0561\u0575\u056F\u0561\u056F\u0561\u0576 \u0563\u0576\u0561\u0570\u0561\u056F\u0561\u0576: ${armenianGrade}
    `;
}

// Reset quiz to allow retaking
function resetQuiz() {
    document.getElementById("result").innerHTML = "";

    const quizForm = document.getElementById("quizForm");
    quizForm.querySelectorAll('.options label').forEach(label => {
        label.classList.remove('correct-option', 'wrong-option');
    });

    quizForm.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.disabled = false;
        radio.checked = false;
    });

    examQuestions = [];
    generateExam();
}

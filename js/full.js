let fullExamQuestions = [];
let timerInterval;
let timeLeft = 20 * 60;

document.addEventListener('DOMContentLoaded', function() {
    startExam();
});

function getExamQuestions() {
    fullExamQuestions = shuffleArray([...questions]);
    return fullExamQuestions;
}

function startExam() {
    generateExam();
    startTimer();
}

function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    let timerDisplay = document.getElementById("timer");
    if (!timerDisplay) {
        timerDisplay = document.createElement("div");
        timerDisplay.id = "timer";
        timerDisplay.classList.add("timer-display");
        document.body.appendChild(timerDisplay);
    }

    timerDisplay.textContent = '\u0544\u0576\u0561\u0581\u0561\u056E \u056A\u0561\u0574\u0561\u0576\u0561\u056F \u2014 20:00';

    timerInterval = setInterval(() => {
        timeLeft--;

        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;

        timerDisplay.textContent =
            '\u0544\u0576\u0561\u0581\u0561\u056E \u056A\u0561\u0574\u0561\u0576\u0561\u056F \u2014 ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;

        if (timeLeft <= 60) {
            timerDisplay.classList.add("timer-warning");
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }

    }, 1000);
}

function resetQuiz() {
    clearInterval(timerInterval);
    timeLeft = 20 * 60;

    const timerDisplay = document.getElementById("timer");
    if (timerDisplay) {
        timerDisplay.textContent = '\u0544\u0576\u0561\u0581\u0561\u056E \u056A\u0561\u0574\u0561\u0576\u0561\u056F \u2014 20:00';
        timerDisplay.classList.remove("timer-warning");
    }

    document.getElementById("result").innerHTML = "";

    const quizForm = document.getElementById("quizForm");
    quizForm.querySelectorAll('.options label').forEach(label => {
        label.classList.remove('correct-option', 'wrong-option');
    });

    quizForm.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.disabled = false;
        radio.checked = false;
    });

    startExam();
}

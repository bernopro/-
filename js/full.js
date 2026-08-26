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

    timerDisplay.textContent = '\u054A\u0561\u057F\u0561\u0572\u0561\u0584\u0584 \u2014 20:00';

    timerInterval = setInterval(() => {
        timeLeft--;

        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;

        timerDisplay.textContent =
            '\u054A\u0561\u057F\u0561\u0572\u0561\u0584\u0584 \u2014 ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;

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
        timerDisplay.textContent = '\u054A\u0561\u057F\u0561\u0572\u0561\u0584\u0584 \u2014 20:00';
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

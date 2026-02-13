let examQuestions = [];
let timerInterval;
let timeLeft = 20 * 60;

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

    timerInterval = setInterval(() => {

        timeLeft--;

        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;

        document.getElementById("timer").innerText =
            `Ժամանակ՝ ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

        // 🔴 TURN RED IN LAST 1 MINUTE
        if (timeLeft <= 60) {
            document.getElementById("timer").style.color = "red";
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
                label.style.background = "#d4edda";
                label.style.border = "2px solid #28a745";
            }

            if (radio.checked && radio.dataset.correct === "false") {
                label.style.background = "#f8d7da";
                label.style.border = "2px solid #dc3545";
            }

            // always show correct answer in green
            if (radio.dataset.correct === "true") {
                label.style.background = "#d4edda";
                label.style.border = "2px solid #28a745";
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
function resetExam() {

    clearInterval(timerInterval);

    // Reset timer back to 20 minutes
    timeLeft = 20 * 60;

    document.getElementById("timer").innerText = "Ժամանակ՝ 20:00";

    // Clear result
    document.getElementById("result").innerHTML = "";

    // Reset flag
    examFinished = false;

    // Regenerate fresh randomized exam
    startExam();
}



// Auto start
startExam();

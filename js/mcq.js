// MCQ-specific logic (20 random questions)
// Requires: shared.js, data.js

document.addEventListener('DOMContentLoaded', function() {
    generateExam();
});

function getExamQuestions() {
    return shuffleArray([...questions]).slice(0, 20);
}

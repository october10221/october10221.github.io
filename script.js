import { vocabulary } from "./vocabulary.js";
import { shuffleArray } from "./utils.js";

// ตัวแปรสำหรับสถานะเกม
let currentScore = 0;
let currentQuestionIndex = 0;
let shuffledVocabulary = [];
const totalQuestions = 100; // จำนวนคำถามในแต่ละเกม (แต่เกมจะจบเร็วขึ้นหากตอบผิด)
let countdownInterval; // ตัวแปรสำหรับเก็บ setInterval ของ countdown
let timeLeft; // เวลาที่เหลือ
const initialCountdown = 3; // เวลาเริ่มต้นของ cooldown
const zombieMaxScale = 2; // ขนาดสูงสุดของซอมบี้เมื่อหมดเวลา
let incorrectAnswers = []; // เก็บคำถามที่ตอบผิด

// กำหนดคลาสสำหรับสีปุ่มต่างๆ
const buttonColors = ['blue-gradient', 'green-gradient', 'orange-gradient', 'red-gradient'];

// อ้างอิงถึง Element ต่างๆ ใน HTML
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const startButton = document.getElementById('start-button');
const playAgainButton = document.getElementById('play-again-button');
const wordDisplay = document.getElementById('word-display');
const optionsContainer = document.getElementById('options-container');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('final-score');
const currentQuestionNumberDisplay = document.getElementById('current-question-number');
const totalQuestionsDisplay = document.getElementById('total-questions');
const zombieEmoji = document.getElementById('zombie-emoji');
const feedbackMessage = document.getElementById('feedback-message');
const countdownDisplay = document.getElementById('countdown'); // สำหรับแสดงเวลาถอยหลัง
const countdownContainer = document.getElementById('countdown-container'); // Container ของตัวจับเวลา
const incorrectAnswersDisplay = document.getElementById('incorrect-answers-display'); // สำหรับแสดงเฉลยคำตอบที่ผิด

// ฟังก์ชันสุ่ม Array (Fisher-Yates shuffle algorithm) นำเข้าใน utils.js
// ฟังก์ชันเริ่มต้นเกม
function startGame() {
    currentScore = 0;
    currentQuestionIndex = 0;
    incorrectAnswers = []; // เคลียร์คำตอบที่ผิดเมื่อเริ่มเกมใหม่
    // เลือกคำศัพท์ 100 คำจากคลังคำศัพท์ทั้งหมด
    shuffledVocabulary = shuffleArray([...vocabulary]).slice(0, totalQuestions); 
    totalQuestionsDisplay.textContent = totalQuestions; // ยังคงแสดงจำนวนคำถามรวมไว้

    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    countdownContainer.classList.remove('hidden'); // แสดงตัวจับเวลา

    // Reset zombie to initial size and remove shake
    zombieEmoji.style.opacity = '1';
    zombieEmoji.style.transform = 'scale(1)';
    zombieEmoji.classList.remove('shake-animation');
    incorrectAnswersDisplay.classList.add('hidden'); // ซ่อนส่วนเฉลยคำตอบที่ผิด

    displayQuestion();
}

// ฟังก์ชันเริ่มต้นนับถอยหลัง
function startCountdown() {
    clearInterval(countdownInterval); // ล้าง interval เก่าถ้ามี
    timeLeft = initialCountdown; // ตั้งเวลาเริ่มต้น
    countdownDisplay.textContent = timeLeft; // อัปเดตการแสดงผล

    // ตั้งค่าขนาดซอมบี้เริ่มต้น
    zombieEmoji.style.transform = 'scale(1)';

    countdownInterval = setInterval(() => {
        timeLeft--;
        countdownDisplay.textContent = timeLeft;

        // คำนวณขนาดซอมบี้ตามเวลาที่เหลือ (scale จาก 1 ถึง zombieMaxScale)
        const scaleFactor = 1 + (initialCountdown - timeLeft) * ((zombieMaxScale - 1) / initialCountdown);
        zombieEmoji.style.transform = `scale(${scaleFactor})`;


        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            // ปิดปุ่มตัวเลือกทั้งหมด
            Array.from(optionsContainer.children).forEach(button => {
                button.disabled = true;
            });
            feedbackMessage.textContent = '⏱️ หมดเวลา!';
            feedbackMessage.classList.remove('text-green-600');
            feedbackMessage.classList.add('text-red-500');
            zombieEmoji.classList.add('shake-animation'); // Zombie shakes

            // เพิ่มคำถามนี้เข้าไปใน incorrectAnswers ด้วย
            const currentQuestion = shuffledVocabulary[currentQuestionIndex];
            incorrectAnswers.push({
                word: currentQuestion.word,
                yourAnswer: "ไม่ได้ตอบ (หมดเวลา)",
                correctAnswer: currentQuestion.correct
            });

            setTimeout(() => {
                endGame(); // จบเกมเมื่อหมดเวลา
            }, 1200); // หน่วงเวลาเล็กน้อยก่อนจบเกม
        }
    }, 1000); // อัปเดตทุก 1 วินาที
}

// ฟังก์ชันแสดงคำถามและตัวเลือก
function displayQuestion() {
    // ถ้าตอบครบจำนวนคำถามที่กำหนด หรือเกมจบลงแล้ว
    if (currentQuestionIndex >= totalQuestions) {
        endGame();
        return;
    }

    // Reset zombie and feedback for next question
    zombieEmoji.style.opacity = '1';
    zombieEmoji.style.transform = 'scale(1)'; // ตั้งค่าขนาดซอมบี้กลับไปเป็นปกติสำหรับคำถามใหม่
    zombieEmoji.classList.remove('shake-animation');
    feedbackMessage.textContent = '';

    const question = shuffledVocabulary[currentQuestionIndex];
    wordDisplay.textContent = question.word;
    scoreDisplay.textContent = currentScore;
    currentQuestionNumberDisplay.textContent = currentQuestionIndex + 1;

    const allOptions = shuffleArray([question.correct, ...question.others]); // รวมและสุ่มตัวเลือกทั้งหมด
    optionsContainer.innerHTML = ''; // ล้างตัวเลือกเก่า

    // สุ่มลำดับสีสำหรับปุ่ม
    const shuffledButtonColors = shuffleArray([...buttonColors]);

    allOptions.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option-button');
        // เพิ่มคลาสสีที่แตกต่างกันสำหรับแต่ละปุ่ม
        button.classList.add(shuffledButtonColors[index % shuffledButtonColors.length]); 
        button.onclick = () => checkAnswer(option, question.correct);
        // Add a class for the correct answer button to apply a deeper clip-path
        if (option === question.correct) {
            button.classList.add('hint-clip');
        }
        optionsContainer.appendChild(button);
    });

    startCountdown(); // เริ่มนับถอยหลังสำหรับคำถามใหม่
}

// ฟังก์ชันตรวจสอบคำตอบ
function checkAnswer(selectedOption, correctAnswer) {
    clearInterval(countdownInterval); // หยุดการนับถอยหลังทันทีที่ตอบ

    // ปิดปุ่มตัวเลือกชั่วคราวเพื่อป้องกันการกดซ้ำ
    Array.from(optionsContainer.children).forEach(button => {
        button.disabled = true;
    });

    if (selectedOption === correctAnswer) {
        currentScore++;
        feedbackMessage.textContent = '✅ ถูกต้อง!';
        feedbackMessage.classList.remove('text-red-500');
        feedbackMessage.classList.add('text-green-600');
        zombieEmoji.style.opacity = '0'; // Zombie disappears on correct answer

        // ถ้าตอบถูก ให้ไปคำถามถัดไป
        setTimeout(() => {
            currentQuestionIndex++;
            displayQuestion();
        }, 1200); // หน่วงเวลา 1.2 วินาที ก่อนไปคำถามถัดไป
    } else {
        feedbackMessage.textContent = `❌ ผิด! คำตอบที่ถูกต้องคือ "${correctAnswer}"`;
        feedbackMessage.classList.remove('text-green-600');
        feedbackMessage.classList.add('text-red-500');
        zombieEmoji.classList.add('shake-animation'); // Zombie shakes on incorrect answer

        // เพิ่มคำถามที่ตอบผิดลงในรายการ
        const currentQuestion = shuffledVocabulary[currentQuestionIndex];
        incorrectAnswers.push({
            word: currentQuestion.word,
            yourAnswer: selectedOption,
            correctAnswer: correctAnswer
        });

        // ถ้าตอบผิด ให้จบเกมทันที
        setTimeout(() => {
            endGame();
        }, 1200); // หน่วงเวลา 1.2 วินาที ก่อนจบเกม
    }
}

// ฟังก์ชันจบเกม
function endGame() {
    clearInterval(countdownInterval); // ตรวจสอบให้แน่ใจว่าหยุดการนับถอยหลังเมื่อจบเกม
    countdownContainer.classList.add('hidden'); // ซ่อนตัวจับเวลา
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    finalScoreDisplay.textContent = currentScore;

    // แสดงเฉลยคำตอบที่ผิด
    incorrectAnswersDisplay.innerHTML = '<h3 class="text-xl font-bold text-rose-800 mb-3">คำศัพท์ที่ตอบผิด:</h3>'; // Clear previous list
    if (incorrectAnswers.length > 0) {
        incorrectAnswers.forEach(item => {
            const p = document.createElement('p');
            p.innerHTML = `<strong>${item.word}</strong><br>ของคุณ: <span class="text-red-600">${item.yourAnswer}</span> | ถูกต้อง: <span class="text-green-600">${item.correctAnswer}</span>`;
            incorrectAnswersDisplay.appendChild(p);
        });
        incorrectAnswersDisplay.classList.remove('hidden');
    } else {
        // ถ้าตอบถูกหมด (ในกรณีที่เล่นจนจบ 100 ข้อ)
        incorrectAnswersDisplay.classList.add('hidden');
    }
}

// Event Listeners
startButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', startGame);

// เริ่มต้นด้วยการแสดงหน้าจอเริ่มต้นเมื่อโหลดหน้าเว็บ
document.addEventListener('DOMContentLoaded', () => {
    startScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    countdownContainer.classList.add('hidden'); // ซ่อนตัวจับเวลาตั้งแต่แรก
    incorrectAnswersDisplay.classList.add('hidden'); // ซ่อนส่วนเฉลยคำตอบที่ผิดตั้งแต่แรก
});


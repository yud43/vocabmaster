// ============ PHONETICS API ============
async function fetchPhonetic(word) {
    try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        if (!res.ok) return '';
        const data = await res.json();
        if (!data[0]) return '';
        // Get IPA phonetic
        const phonetics = data[0].phonetics || [];
        const withText = phonetics.find(p => p.text) || {};
        return withText.text || data[0].phonetic || '';
    } catch {
        return '';
    }
}

// ============ SPEECH ============
function speak(text, lang = 'en-US') {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.85;
    // Try to pick a good voice
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith(lang.slice(0, 2)) && v.localService);
    if (preferred) u.voice = preferred;
    speechSynthesis.speak(u);
}

// Preload voices (needed on some browsers)
if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}

// ============ DATA LAYER ============
const DB_KEY = 'vocabmaster_words';

function loadWords() {
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
}

function saveWords(words) {
    localStorage.setItem(DB_KEY, JSON.stringify(words));
}

function addWord(english, vietnamese, example = '', phonetic = '') {
    const words = loadWords();
    words.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        english: english.trim(),
        vietnamese: vietnamese.trim(),
        example: example.trim(),
        phonetic: phonetic,
        isMastered: false,
        createdAt: new Date().toISOString(),
        reviewCount: 0
    });
    saveWords(words);
    return words;
}

function deleteWord(id) {
    const words = loadWords().filter(w => w.id !== id);
    saveWords(words);
    return words;
}

function toggleMastered(id) {
    const words = loadWords();
    const w = words.find(w => w.id === id);
    if (w) w.isMastered = !w.isMastered;
    saveWords(words);
    return words;
}

function incrementReview(id) {
    const words = loadWords();
    const w = words.find(w => w.id === id);
    if (w) w.reviewCount++;
    saveWords(words);
}

// ============ STATE ============
let currentPage = 'words';
let searchText = '';
let fcIndex = 0;
let fcFlipped = false;
let fcUnmasteredOnly = true;
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let quizSelected = null;
let quizStarted = false;
let quizFinished = false;
let quizCount = 10;
let quizMode = 'en2vn';

// ============ NAVIGATION ============
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        currentPage = tab.dataset.page;
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`page-${currentPage}`).classList.add('active');
        renderCurrentPage();
    });
});

function renderCurrentPage() {
    const titles = { words: 'Từ vựng', flashcard: 'Flashcard', quiz: 'Quiz', stats: 'Thống kê' };
    document.getElementById('page-title').textContent = titles[currentPage];
    const actions = document.getElementById('header-actions');
    actions.innerHTML = '';

    if (currentPage === 'words') {
        actions.innerHTML = `
            <button class="header-btn" onclick="openModal('add')" title="Thêm từ">+</button>
            <button class="header-btn" onclick="openModal('batch')" title="Nhập danh sách">☰</button>
        `;
        renderWords();
    } else if (currentPage === 'flashcard') {
        const icon = fcUnmasteredOnly ? '⊘' : '○';
        actions.innerHTML = `<button class="header-btn" onclick="toggleFcFilter()" title="Lọc">${icon}</button>`;
        renderFlashcard();
    } else if (currentPage === 'quiz') {
        renderQuiz();
    } else if (currentPage === 'stats') {
        renderStats();
    }
}

// ============ WORD LIST ============
function renderWords() {
    const words = loadWords();
    const container = document.getElementById('page-words');

    if (words.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📖</div>
                <h2>Chưa có từ vựng nào</h2>
                <p>Thêm từ mới hoặc nhập danh sách<br>để bắt đầu học!</p>
                <div class="btn-row">
                    <button class="btn btn-primary" onclick="openModal('add')">+ Thêm từ</button>
                    <button class="btn btn-secondary" onclick="openModal('batch')">☰ Nhập DS</button>
                </div>
            </div>`;
        return;
    }

    const filtered = searchText
        ? words.filter(w =>
            w.english.toLowerCase().includes(searchText.toLowerCase()) ||
            w.vietnamese.toLowerCase().includes(searchText.toLowerCase()))
        : words;

    const mastered = words.filter(w => w.isMastered).length;

    container.innerHTML = `
        <input class="search-bar" type="search" placeholder="🔍 Tìm từ..." value="${searchText}" oninput="searchText=this.value;renderWords()">
        <div class="summary-bar">
            <span>📝 ${words.length} từ</span>
            <span style="color:var(--green)">✅ ${mastered} đã thuộc</span>
        </div>
        ${filtered.map(w => `
            <div class="word-item">
                <div class="word-info" onclick="speak('${w.english.replace(/'/g, "\\'")}')">
                    <div class="word-en">
                        ${w.english}
                        ${w.phonetic ? `<span class="word-phonetic">${w.phonetic}</span>` : ''}
                        ${w.isMastered ? '<span class="mastered-icon">✅</span>' : ''}
                        <span class="speak-icon">🔊</span>
                    </div>
                    <div class="word-vn">${w.vietnamese}</div>
                    ${w.example ? `<div class="word-ex">${w.example}</div>` : ''}
                </div>
                <span class="word-badge">×${w.reviewCount}</span>
                <div class="word-actions">
                    <button class="word-action-btn" onclick="toggleMastered('${w.id}');renderWords()">${w.isMastered ? '⭐' : '☆'}</button>
                    <button class="word-action-btn" onclick="if(confirm('Xoá từ này?')){deleteWord('${w.id}');renderWords()}">🗑</button>
                </div>
            </div>
        `).join('')}
    `;
}

// ============ FLASHCARD ============
function getFlashcardWords() {
    const words = loadWords();
    return fcUnmasteredOnly ? words.filter(w => !w.isMastered) : words;
}

function toggleFcFilter() {
    fcUnmasteredOnly = !fcUnmasteredOnly;
    fcIndex = 0;
    fcFlipped = false;
    renderCurrentPage();
}

function renderFlashcard() {
    const words = getFlashcardWords();
    const allWords = loadWords();
    const container = document.getElementById('page-flashcard');

    if (words.length === 0) {
        if (allWords.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🃏</div>
                    <p>Thêm từ vựng để bắt đầu học</p>
                </div>`;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🎉</div>
                    <h2>Bạn đã thuộc tất cả!</h2>
                    <button class="btn btn-primary" onclick="fcUnmasteredOnly=false;renderCurrentPage()">Xem lại tất cả</button>
                </div>`;
        }
        return;
    }

    if (fcIndex >= words.length) fcIndex = words.length - 1;
    const w = words[fcIndex];
    const pct = ((fcIndex + 1) / words.length * 100).toFixed(0);

    container.innerHTML = `
        <div class="fc-progress">
            <span>${fcIndex + 1} / ${words.length}</span>
            ${w.isMastered ? '<span style="color:var(--green)">✅ Đã thuộc</span>' : ''}
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>

        <div class="flashcard ${fcFlipped ? 'back' : 'front'}" onclick="flipCard('${w.id}')">
            ${fcFlipped ? `
                <div class="fc-word">${w.vietnamese}</div>
                ${w.example ? `<div class="fc-example">${w.example}</div>` : ''}
                <div class="fc-flag">🇻🇳</div>
            ` : `
                <div class="fc-word">${w.english}</div>
                ${w.phonetic ? `<div class="fc-phonetic">${w.phonetic}</div>` : ''}
                <div class="fc-flag">🇬🇧</div>
                <div class="fc-hint">Chạm để lật</div>
            `}
            <button class="speak-btn" onclick="event.stopPropagation();speak('${w.english.replace(/'/g, "\\'")}')">🔊 Phát âm</button>
        </div>

        <div class="fc-controls">
            <button class="fc-btn prev" onclick="prevCard()" ${fcIndex === 0 ? 'disabled' : ''}>◀</button>
            <button class="fc-btn star ${w.isMastered ? 'active' : ''}" onclick="toggleMastered('${w.id}');renderFlashcard()">
                ${w.isMastered ? '⭐' : '☆'}
            </button>
            <button class="fc-btn next" onclick="nextCard()" ${fcIndex >= words.length - 1 ? 'disabled' : ''}>▶</button>
        </div>
    `;

    // Swipe support
    let startX = 0;
    const card = container.querySelector('.flashcard');
    card.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    card.addEventListener('touchend', e => {
        const diff = e.changedTouches[0].clientX - startX;
        if (diff < -80) nextCard();
        else if (diff > 80) prevCard();
    }, { passive: true });
}

function flipCard(id) {
    fcFlipped = !fcFlipped;
    if (fcFlipped) incrementReview(id);
    renderFlashcard();
}

function nextCard() {
    const words = getFlashcardWords();
    if (fcIndex < words.length - 1) {
        fcIndex++;
        fcFlipped = false;
        renderFlashcard();
    }
}

function prevCard() {
    if (fcIndex > 0) {
        fcIndex--;
        fcFlipped = false;
        renderFlashcard();
    }
}

// ============ QUIZ ============
function renderQuiz() {
    const words = loadWords();
    const container = document.getElementById('page-quiz');

    if (words.length < 4) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">🧠</div>
                <h2>Cần ít nhất 4 từ</h2>
                <p>Hiện có ${words.length} từ</p>
            </div>`;
        return;
    }

    if (!quizStarted) {
        renderQuizSetup(container, words);
    } else if (quizFinished) {
        renderQuizResult(container);
    } else {
        renderQuizQuestion(container, words);
    }
}

function renderQuizSetup(container, words) {
    container.innerHTML = `
        <div class="quiz-setup">
            <div class="icon">🧠</div>
            <h2>Kiểm tra từ vựng</h2>
            <div class="quiz-option-group">
                <label>Số câu hỏi</label>
                <div class="seg-control">
                    ${[5, 10, 20].map(n => `
                        <button class="seg-btn ${quizCount === n ? 'active' : ''}" onclick="quizCount=${n};renderQuiz()">${n}</button>
                    `).join('')}
                    <button class="seg-btn ${quizCount === words.length ? 'active' : ''}" onclick="quizCount=${words.length};renderQuiz()">Tất cả</button>
                </div>
            </div>
            <div class="quiz-option-group">
                <label>Chế độ</label>
                <div class="seg-control">
                    <button class="seg-btn ${quizMode === 'en2vn' ? 'active' : ''}" onclick="quizMode='en2vn';renderQuiz()">EN→VN</button>
                    <button class="seg-btn ${quizMode === 'vn2en' ? 'active' : ''}" onclick="quizMode='vn2en';renderQuiz()">VN→EN</button>
                    <button class="seg-btn ${quizMode === 'mixed' ? 'active' : ''}" onclick="quizMode='mixed';renderQuiz()">Trộn</button>
                </div>
            </div>
            <button class="btn btn-primary btn-full" onclick="startQuiz()" style="margin-top:20px">Bắt đầu</button>
        </div>`;
}

function startQuiz() {
    const words = loadWords();
    const count = Math.min(quizCount, words.length);
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    quizQuestions = selected.map(word => {
        const isEn2Vn = quizMode === 'en2vn' ? true : quizMode === 'vn2en' ? false : Math.random() > 0.5;
        const wrongAnswers = words
            .filter(w => w.id !== word.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(w => isEn2Vn ? w.vietnamese : w.english);

        const correct = isEn2Vn ? word.vietnamese : word.english;
        const options = [...wrongAnswers, correct].sort(() => Math.random() - 0.5);

        return {
            word,
            question: isEn2Vn ? word.english : word.vietnamese,
            questionLabel: isEn2Vn ? 'Nghĩa của từ này là gì?' : 'Từ nào có nghĩa này?',
            options,
            correctIndex: options.indexOf(correct)
        };
    });

    quizIndex = 0;
    quizScore = 0;
    quizSelected = null;
    quizStarted = true;
    quizFinished = false;
    renderQuiz();
}

function renderQuizQuestion(container) {
    const q = quizQuestions[quizIndex];
    const pct = (quizIndex / quizQuestions.length * 100).toFixed(0);

    container.innerHTML = `
        <div class="fc-progress">
            <span>Câu ${quizIndex + 1}/${quizQuestions.length}</span>
            <span style="color:var(--primary);font-weight:600">Điểm: ${quizScore}</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>

        <p class="quiz-question-text">${q.questionLabel}</p>
        <div class="quiz-word">${q.question} <button class="speak-btn-sm" onclick="speak('${q.word.english.replace(/'/g, "\\'")}')">🔊</button></div>
        ${q.word.phonetic ? `<div class="quiz-phonetic">${q.word.phonetic}</div>` : ''}

        <div class="quiz-answers">
            ${q.options.map((opt, i) => {
                let cls = '';
                let icon = '';
                if (quizSelected !== null) {
                    cls = 'disabled';
                    if (i === q.correctIndex) { cls += ' correct'; icon = '✅'; }
                    else if (i === quizSelected) { cls += ' wrong'; icon = '❌'; }
                }
                return `<div class="quiz-answer ${cls}" onclick="answerQuiz(${i})">${opt}<span>${icon}</span></div>`;
            }).join('')}
        </div>

        ${quizSelected !== null ? `
            <button class="btn btn-primary btn-full" style="margin-top:20px" onclick="nextQuizQuestion()">
                ${quizIndex < quizQuestions.length - 1 ? 'Câu tiếp →' : 'Xem kết quả'}
            </button>
        ` : ''}
    `;
}

function answerQuiz(index) {
    if (quizSelected !== null) return;
    quizSelected = index;
    if (index === quizQuestions[quizIndex].correctIndex) quizScore++;
    renderQuiz();
}

function nextQuizQuestion() {
    if (quizIndex < quizQuestions.length - 1) {
        quizIndex++;
        quizSelected = null;
        renderQuiz();
    } else {
        quizFinished = true;
        renderQuiz();
    }
}

function renderQuizResult(container) {
    const pct = (quizScore / quizQuestions.length * 100);
    const emoji = pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪';
    const msg = pct >= 80 ? 'Xuất sắc!' : pct >= 50 ? 'Khá tốt!' : 'Cần cố gắng thêm!';

    container.innerHTML = `
        <div class="quiz-result">
            <div class="icon">${emoji}</div>
            <h2>${msg}</h2>
            <div class="score">${quizScore}/${quizQuestions.length}</div>
            <p style="color:var(--text2);margin:8px 0 24px">câu đúng</p>
            <div class="btn-row">
                <button class="btn btn-secondary" onclick="quizIndex=0;quizScore=0;quizSelected=null;quizFinished=false;renderQuiz()">🔄 Làm lại</button>
                <button class="btn btn-primary" onclick="quizStarted=false;quizFinished=false;renderQuiz()">+ Quiz mới</button>
            </div>
        </div>`;
}

// ============ STATS ============
function renderStats() {
    const words = loadWords();
    const container = document.getElementById('page-stats');
    const mastered = words.filter(w => w.isMastered).length;
    const learning = words.length - mastered;
    const totalReviews = words.reduce((s, w) => s + w.reviewCount, 0);
    const pct = words.length ? (mastered / words.length * 100).toFixed(0) : 0;

    const topReviewed = [...words].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5).filter(w => w.reviewCount > 0);

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card indigo">
                <div class="icon">📝</div>
                <div class="value">${words.length}</div>
                <div class="label">Tổng từ</div>
            </div>
            <div class="stat-card green">
                <div class="icon">✅</div>
                <div class="value">${mastered}</div>
                <div class="label">Đã thuộc</div>
            </div>
            <div class="stat-card orange">
                <div class="icon">📖</div>
                <div class="value">${learning}</div>
                <div class="label">Đang học</div>
            </div>
            <div class="stat-card blue">
                <div class="icon">🔄</div>
                <div class="value">${totalReviews}</div>
                <div class="label">Lượt ôn</div>
            </div>
        </div>

        ${words.length > 0 ? `
            <div class="stats-section">
                <h3>Tiến độ học</h3>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                    <div class="progress-pct">${pct}%</div>
                    <span style="font-size:13px;color:var(--text2)">${mastered}/${words.length} từ</span>
                </div>
                <div class="progress-bar-lg"><div class="fill" style="width:${pct}%"></div></div>
            </div>
        ` : ''}

        ${topReviewed.length > 0 ? `
            <div class="stats-section">
                <h3>Ôn nhiều nhất</h3>
                ${topReviewed.map(w => `
                    <div class="top-word">
                        <div><div class="en">${w.english}</div><div class="vn">${w.vietnamese}</div></div>
                        <span class="count">×${w.reviewCount}</span>
                    </div>
                `).join('')}
            </div>
        ` : ''}
    `;
}

// ============ MODALS ============
function openModal(type) {
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById(`modal-${type}`).classList.remove('hidden');
    if (type === 'add') {
        setTimeout(() => document.getElementById('input-english').focus(), 100);
    }
    if (type === 'batch') {
        document.getElementById('input-batch').value = '';
        document.getElementById('batch-count').textContent = '';
    }
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    // Clear add form
    document.getElementById('input-english').value = '';
    document.getElementById('input-vietnamese').value = '';
    document.getElementById('input-example').value = '';
}

async function saveWord() {
    const en = document.getElementById('input-english').value.trim();
    const vn = document.getElementById('input-vietnamese').value.trim();
    const ex = document.getElementById('input-example').value.trim();
    if (!en || !vn) return;
    const btn = document.getElementById('btn-save');
    btn.textContent = '⏳';
    btn.disabled = true;
    const phonetic = await fetchPhonetic(en);
    addWord(en, vn, ex, phonetic);
    btn.textContent = 'Lưu';
    btn.disabled = false;
    closeModal();
    renderCurrentPage();
}

// Enter key support for add form
document.getElementById('input-example').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveWord();
});

// Batch import
document.getElementById('input-batch').addEventListener('input', function () {
    const parsed = parseBatch(this.value);
    document.getElementById('batch-count').textContent = parsed.length > 0 ? `Phát hiện ${parsed.length} từ` : '';
});

function parseBatch(text) {
    return text.split('\n').map(line => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        const sep = trimmed.includes(' - ') ? ' - ' : ':';
        const parts = trimmed.split(sep).map(s => s.trim()).filter(Boolean);
        if (parts.length < 2) return null;
        return { english: parts[0], vietnamese: parts[1], example: parts[2] || '' };
    }).filter(Boolean);
}

async function importWords() {
    const text = document.getElementById('input-batch').value;
    const parsed = parseBatch(text);
    if (parsed.length === 0) return;
    // Fetch phonetics in parallel
    const phonetics = await Promise.all(parsed.map(w => fetchPhonetic(w.english)));
    parsed.forEach((w, i) => addWord(w.english, w.vietnamese, w.example, phonetics[i]));
    closeModal();
    alert(`Đã nhập ${parsed.length} từ mới!`);
    renderCurrentPage();
}

// ============ SERVICE WORKER ============
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

// ============ INIT ============
renderCurrentPage();

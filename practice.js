const params  = new URLSearchParams(location.search);
const sceneId = params.get('scene');

let mode = 'ja-en'; // 'ja-en' or 'en-ja'
let chunks = [];

function speak(text) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}

function buildCards() {
  const list = document.getElementById('practice-list');
  list.innerHTML = '';

  chunks.forEach(chunk => {
    const card = document.createElement('div');
    card.className = 'practice-card';

    const isJaEn = mode === 'ja-en';
    const question = isJaEn ? chunk.ja : chunk.en;
    const answer   = isJaEn ? chunk.en : chunk.ja;

    card.innerHTML = `
      <div class="practice-question">${question}</div>
      <div class="practice-reveal">
        <button class="practice-reveal-btn">${isJaEn ? '英語を見る 👆' : '日本語を見る 👆'}</button>
        <div class="practice-answer" style="display:none">
          <div class="practice-answer-text">${answer}</div>
          <div class="practice-en-actions">
            ${isJaEn ? '<button class="practice-speak-btn">🔊 発音を聞く</button>' : ''}
            <button class="practice-close-btn">✕ 隠す</button>
          </div>
        </div>
      </div>
    `;

    const revealBtn  = card.querySelector('.practice-reveal-btn');
    const answerBlock = card.querySelector('.practice-answer');
    const closeBtn   = card.querySelector('.practice-close-btn');
    const speakBtn   = card.querySelector('.practice-speak-btn');

    revealBtn.addEventListener('click', () => {
      answerBlock.style.display = '';
      revealBtn.style.display = 'none';
      if (isJaEn) speak(chunk.en);
    });

    closeBtn.addEventListener('click', () => {
      answerBlock.style.display = 'none';
      revealBtn.style.display = '';
    });

    if (speakBtn) {
      speakBtn.addEventListener('click', () => speak(chunk.en));
    }

    list.appendChild(card);
  });
}

async function loadPractice() {
  if (!sceneId) { location.href = 'index.html'; return; }

  const res  = await fetch(`data/${sceneId}.json`);
  const data = await res.json();

  chunks = data.chunks;
  document.getElementById('scene-title').textContent = `${data.scene_icon} 練習`;
  document.title = `練習 - ${data.scene_label}`;

  buildCards();
}

document.getElementById('mode-ja-en').addEventListener('click', () => {
  mode = 'ja-en';
  document.getElementById('mode-ja-en').classList.add('active');
  document.getElementById('mode-en-ja').classList.remove('active');
  buildCards();
});

document.getElementById('mode-en-ja').addEventListener('click', () => {
  mode = 'en-ja';
  document.getElementById('mode-en-ja').classList.add('active');
  document.getElementById('mode-ja-en').classList.remove('active');
  buildCards();
});

loadPractice();

const params  = new URLSearchParams(location.search);
const sceneId = params.get('scene');

const TYPE_LABELS = {
  pattern:    'パターン',
  vocabulary: '単語',
  related:    '関連',
  answer:     '返し',
  variation:  '別表現',
};

function escAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;');
}

function speak(text) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}

function openModal({ en, ja, nuance, grammar, expected_responses }) {
  document.getElementById('card-en').textContent = en;
  document.getElementById('card-ja').textContent = ja;

  const nuanceEl = document.getElementById('card-nuance');
  if (nuance) {
    nuanceEl.textContent = nuance;
    nuanceEl.style.display = '';
  } else {
    nuanceEl.style.display = 'none';
  }

  // 文法解説
  const grammarEl   = document.getElementById('card-grammar');
  const grammarBody = document.getElementById('card-grammar-body');
  const grammarToggle = document.getElementById('card-grammar-toggle');
  grammarToggle.classList.remove('open');
  grammarBody.classList.remove('open');
  grammarToggle.textContent = '📖 文法を見る ▼';

  if (grammar) {
    const ROLE_CLASS = {
      'S': 'role-s', 'V': 'role-v', 'O': 'role-o', 'C': 'role-c',
      '助動詞': 'role-aux', '修飾': 'role-mod', '接続詞': 'role-conj', '前置詞句': 'role-prep'
    };
    const partsHTML = grammar.parts.map(p => `
      <div class="grammar-part">
        <span class="grammar-part-text">${p.text}</span>
        <span class="grammar-part-role ${ROLE_CLASS[p.role] || 'role-mod'}">${p.role}${p.note ? '・' + p.note : ''}</span>
      </div>
    `).join('');

    grammarBody.innerHTML = `
      <div class="grammar-parts">${partsHTML}</div>
      <div class="grammar-pattern">${grammar.pattern}</div>
      <div class="grammar-note">${grammar.note}</div>
    `;
    grammarEl.style.display = '';

    grammarToggle.onclick = () => {
      const isOpen = grammarBody.classList.toggle('open');
      grammarToggle.classList.toggle('open', isOpen);
      grammarToggle.textContent = isOpen ? '📖 文法を閉じる ▲' : '📖 文法を見る ▼';
    };
  } else {
    grammarEl.style.display = 'none';
  }

  const responsesEl  = document.getElementById('card-responses');
  const responseCards = document.getElementById('response-cards');
  if (expected_responses && expected_responses.length > 0) {
    responseCards.innerHTML = expected_responses.map(r => `
      <button class="response-card" data-en="${escAttr(r.en)}">
        <div class="response-card-en">${r.en}</div>
        <div class="response-card-ja">${r.ja}</div>
      </button>
    `).join('');
    responseCards.querySelectorAll('.response-card').forEach(btn => {
      btn.addEventListener('click', () => speak(btn.dataset.en));
    });
    responsesEl.style.display = '';
  } else {
    responsesEl.style.display = 'none';
  }

  const listenBtn = document.getElementById('card-listen-btn');
  listenBtn.onclick = () => speak(en);
  document.getElementById('card-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('card-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function renderMindset(mindset) {
  const card = document.createElement('div');
  card.className = 'mindset-card';

  const flowHTML = mindset.flow.map((step, i) => `
    <div class="flow-step">
      <span class="flow-label">${step}</span>
      ${i < mindset.flow.length - 1 ? '<span class="flow-arrow">›</span>' : ''}
    </div>
  `).join('');

  const fromThemHTML = mindset.from_them.map(p => `
    <div class="mindset-phrase">
      <div class="mindset-phrase-en">"${p.en}"</div>
      <div class="mindset-phrase-ja">${p.ja}</div>
    </div>
  `).join('');

  const fromYouHTML = mindset.from_you.map(p => `
    <div class="mindset-phrase">
      <div class="mindset-phrase-en">${p.en}</div>
      <div class="mindset-phrase-ja">${p.ja}</div>
    </div>
  `).join('');

  card.innerHTML = `
    <div class="mindset-title">この場で起きること</div>
    <div class="mindset-flow">${flowHTML}</div>
    <div class="mindset-cols">
      <div class="col-from-them">
        <div class="mindset-col-title">👂 相手から来る言葉</div>
        ${fromThemHTML}
      </div>
      <div class="col-from-you">
        <div class="mindset-col-title">💬 あなたが言う言葉</div>
        ${fromYouHTML}
      </div>
    </div>
  `;

  document.getElementById('chunk-list').appendChild(card);
}

async function loadScene() {
  if (!sceneId) {
    location.href = 'index.html';
    return;
  }

  let data;
  try {
    const res = await fetch(`data/${sceneId}.json`);
    data = await res.json();
  } catch (e) {
    document.getElementById('scene-title').textContent = 'データを読み込めませんでした';
    return;
  }

  document.getElementById('scene-title').textContent = `${data.scene_icon} ${data.scene_label}`;
  document.title = `${data.scene_label} - Lexical`;
  document.getElementById('practice-btn').href = `practice.html?scene=${sceneId}`;

  // 心構えカードを描画
  if (data.mindset) {
    renderMindset(data.mindset);
  }

  const list = document.getElementById('chunk-list');

  data.chunks.forEach(chunk => {
    const card = document.createElement('div');
    card.className = 'chunk-card';

    const branchesHTML = chunk.branches.map(b => `
      <div class="branch-item"
           data-en="${escAttr(b.en)}"
           data-ja="${escAttr(b.ja)}">
        <span class="branch-connector">└</span>
        <div class="branch-text">
          <div class="branch-en">${b.en}</div>
          <div class="branch-ja">${b.ja}</div>
        </div>
        <span class="branch-type type-${b.type}">${TYPE_LABELS[b.type] || b.type}</span>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="chunk-main">
        <div class="chunk-text">
          <div class="chunk-en">${chunk.en}</div>
          <div class="chunk-ja">${chunk.ja}</div>
        </div>
        <span class="chunk-level level-${chunk.level}">
          ${chunk.level === 'beginner' ? '初級' : '中級'}
        </span>
        <button class="expand-btn" aria-label="枝葉を開閉">▼</button>
      </div>
      <div class="branch-list">
        ${branchesHTML}
      </div>
    `;

    // 枝葉の開閉
    card.querySelector('.expand-btn').addEventListener('click', e => {
      e.stopPropagation();
      const btn = card.querySelector('.expand-btn');
      const branches = card.querySelector('.branch-list');
      btn.classList.toggle('open');
      branches.classList.toggle('open');
    });

    // メインチャンク → モーダル
    card.querySelector('.chunk-main').addEventListener('click', e => {
      if (e.target.closest('.expand-btn')) return;
      openModal({
        en:                 chunk.en,
        ja:                 chunk.ja,
        nuance:             chunk.nuance,
        grammar:            chunk.grammar || null,
        expected_responses: chunk.expected_responses || [],
      });
    });

    // 枝葉 → モーダル
    card.querySelectorAll('.branch-item').forEach(item => {
      item.addEventListener('click', () => {
        openModal({
          en:     item.dataset.en,
          ja:     item.dataset.ja,
          nuance: null,
        });
      });
    });

    list.appendChild(card);
  });
}

// モーダルを閉じる
document.getElementById('card-close').addEventListener('click', closeModal);
document.getElementById('card-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

// スワイプで閉じる（簡易版）
const modal = document.getElementById('card-modal');
const inner = modal.querySelector('.card-modal-inner');
let startY = 0;
inner.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
inner.addEventListener('touchend', e => {
  const dy = e.changedTouches[0].clientY - startY;
  if (dy > 80) closeModal();
}, { passive: true });

loadScene();

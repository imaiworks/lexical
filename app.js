const CATEGORIES = [
  {
    id: 'travel',
    label: '✈️ 旅行',
    scenes: [
      { id: 'airport',        label: '空港',          icon: '✈️' },
      { id: 'hotel',          label: 'ホテル',         icon: '🏨' },
      { id: 'restaurant',     label: 'レストラン・カフェ', icon: '🍽️' },
      { id: 'shopping',       label: 'ショッピング',   icon: '🛍️' },
      { id: 'transportation', label: '交通・移動',     icon: '🚕' },
      { id: 'sightseeing',    label: '観光',           icon: '🗺️' },
      { id: 'emergency',      label: '緊急・トラブル', icon: '🆘' },
    ]
  },
  {
    id: 'daily',
    label: '💬 日常',
    scenes: [
      { id: 'daily', label: '日常会話', icon: '💬' },
    ]
  },
  {
    id: 'business',
    label: '💼 仕事',
    scenes: [
      { id: 'meeting', label: '会議・打ち合わせ', icon: '💼' },
      { id: 'email',   label: 'メール・Slack',   icon: '📧' },
    ]
  },
];

let currentCategory = 'travel';

function renderTabs() {
  const tabs = document.getElementById('category-tabs');
  tabs.innerHTML = CATEGORIES.map(cat => `
    <button class="category-tab ${cat.id === currentCategory ? 'active' : ''}"
            data-id="${cat.id}">${cat.label}</button>
  `).join('');

  tabs.querySelectorAll('.category-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.id;
      renderTabs();
      renderScenes();
    });
  });
}

async function renderScenes() {
  const grid = document.getElementById('scene-grid');
  grid.innerHTML = '';

  const cat = CATEGORIES.find(c => c.id === currentCategory);

  for (const scene of cat.scenes) {
    const card = document.createElement('a');
    card.href = `scene.html?scene=${scene.id}`;
    card.className = 'scene-card';
    card.innerHTML = `
      <span class="scene-icon">${scene.icon}</span>
      <div class="scene-label">${scene.label}</div>
      <div class="scene-count" id="count-${scene.id}">読み込み中...</div>
    `;
    grid.appendChild(card);

    fetch(`data/${scene.id}.json`)
      .then(r => r.json())
      .then(data => {
        const branches = data.chunks.reduce((sum, c) => sum + c.branches.length, 0);
        const el = document.getElementById(`count-${scene.id}`);
        if (el) el.textContent = `${data.chunks.length} チャンク・${branches} 表現`;
      })
      .catch(() => {
        const el = document.getElementById(`count-${scene.id}`);
        if (el) el.textContent = '';
      });
  }
}

renderTabs();
renderScenes();

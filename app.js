const SCENES = [
  { id: 'restaurant',     label: 'レストラン・カフェ', icon: '🍽️' },
  { id: 'airport',        label: '空港',               icon: '✈️' },
  { id: 'hotel',          label: 'ホテル',              icon: '🏨' },
  { id: 'shopping',       label: 'ショッピング',        icon: '🛍️' },
  { id: 'transportation', label: '交通・移動',          icon: '🚕' },
  { id: 'sightseeing',    label: '観光',                icon: '🗺️' },
  { id: 'emergency',      label: '緊急・トラブル',      icon: '🆘' },
  { id: 'daily',          label: '日常会話',            icon: '💬' },
];

async function init() {
  const grid = document.getElementById('scene-grid');

  for (const scene of SCENES) {
    const card = document.createElement('a');
    card.href = `scene.html?scene=${scene.id}`;
    card.className = 'scene-card';
    card.innerHTML = `
      <span class="scene-icon">${scene.icon}</span>
      <div class="scene-label">${scene.label}</div>
      <div class="scene-count" id="count-${scene.id}">読み込み中...</div>
    `;
    grid.appendChild(card);

    // 非同期でチャンク数を取得して表示
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

init();

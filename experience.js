(() => {
  const results = document.querySelector('.calc-results');
  const form = document.querySelector('#impact-form');
  const visual = document.createElement('div');
  visual.className = 'capacity-visual'; visual.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 24; i++) { const bar = document.createElement('span'); bar.style.setProperty('--bar-height', `${18 + i * 1.2}px`); visual.append(bar); }
  const caption = document.createElement('p'); caption.className = 'capacity-caption';
  results.append(visual, caption);
  function update() {
    const t = Number(document.querySelector('#seconds').value);
    const valid = form.checkValidity();
    const fraction = valid ? Math.min(1, t / 5) : 0;
    [...visual.children].forEach((bar, i) => bar.classList.toggle('active', (i + 1) / 24 <= fraction));
    caption.textContent = valid ? `На шкале — ${new Intl.NumberFormat('ru-RU').format(t)} сек. сокращения на операцию${t > 5 ? ' (шкала до 5 сек.)' : ''}` : 'Укажите параметры расчёта';
    results.classList.remove('updated');
    requestAnimationFrame(() => results.classList.add('updated'));
  }
  form.addEventListener('input', update); update();
  const flow = document.createElement('div'); flow.className = 'demo-flow';
  flow.innerHTML = '<div><strong>Камера очков</strong><p>Видеопоток с рабочего места</p></div><span class="flow-connector" aria-hidden="true"></span><div><strong>Наше распознавание</strong><p>QR-коды и текст на маркировке</p></div><span class="flow-connector" aria-hidden="true"></span><div><strong>Результат сотруднику</strong><p>Подтверждение и данные операции</p></div>';
  document.querySelector('#product .process').after(flow);
})();

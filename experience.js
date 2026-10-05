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
  const player = document.createElement('div'); player.className = 'flow-player';
  player.innerHTML = '<div class="demo-flow"><div class="flow-step"><strong>Камера очков</strong><p>Видеопоток с рабочего места</p></div><span class="flow-connector" aria-hidden="true"></span><div class="flow-step"><strong>Наше распознавание</strong><p>QR-коды и текст на маркировке</p></div><span class="flow-connector" aria-hidden="true"></span><div class="flow-step"><strong>Результат сотруднику</strong><p>Подтверждение и данные операции</p></div></div><div class="flow-actions"><button id="scan-demo" type="button">Показать считывание</button><p class="flow-state"><output id="scan-title" aria-live="polite">От видеопотока к данным операции</output><span>Демонстрация сценария будущей интеграции</span></p></div>';
  document.querySelector('#product .process').after(player);
  const scan = player.querySelector('button');
  const status = player.querySelector('output');
  const steps = [...player.querySelectorAll('.flow-step')];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const setStep = (n) => steps.forEach((step, i) => step.classList.toggle('is-current', i <= n));
  scan.addEventListener('click', () => {
    scan.disabled = true; setStep(0); status.textContent = 'Маркировка попадает в поле зрения';
    const finish = () => { setStep(2); status.textContent = 'Пример результата: SKU 04821 · зона А-12'; scan.disabled = false; scan.textContent = 'Повторить сценарий'; };
    if (reduceMotion.matches) { finish(); return; }
    setTimeout(() => { setStep(1); status.textContent = 'ПО распознаёт код и текст'; }, 650);
    setTimeout(finish, 1500);
  });
})();

// js/app_v4.js
const APP_VERSION = "v3.1｜2026.02.06";
let historyApi;
let lastStage;

window.addEventListener('load', () => {
  // 共用 UI：版本顯示、日期預設、歷史收合、讀取歷史
  historyApi = initCommonUI({
    appVersion: APP_VERSION,
    storageKey: "history_baopei",
  });

  // 讓 HTML 的 onclick 也可用（保險）
  window.historyApi = historyApi;

  // 更新按鈕
  initUpdateButton();

  // 進階 D1 收合
  initAdvancedD1Toggle();

  // 依欄位自動顯示/隱藏
  bindAutoUI();
  updateFormVisibility();
});

function qs(id) { return document.getElementById(id); }

function setUpdateStatus(text) {
  const el = qs('updateStatus');
  if (!el) return;
  el.textContent = text || '';
}

function initUpdateButton() {
  const btn = qs('updateBtn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    try {
      setUpdateStatus('正在檢查更新…');
      btn.disabled = true;

      if (!('serviceWorker' in navigator)) {
        setUpdateStatus('此瀏覽器不支援自動更新（無 Service Worker）。');
        return;
      }

      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        setUpdateStatus('尚未註冊 Service Worker，請重新整理一次。');
        return;
      }

      // 等待「有 waiting worker」或判定「沒有更新」
      const waitForWaiting = () => new Promise((resolve) => {
        // 已經有 waiting
        if (reg.waiting) return resolve({ hasUpdate: true });

        let done = false;
        const finish = (result) => {
          if (done) return;
          done = true;
          try { reg.removeEventListener('updatefound', onUpdateFound); } catch (_) {}
          resolve(result);
        };

        const onStateChange = () => {
          // 安裝完成後，會變成 waiting（若有舊 controller）
          if (reg.waiting) finish({ hasUpdate: true });
        };

        const onUpdateFound = () => {
          const installing = reg.installing;
          if (installing) installing.addEventListener('statechange', onStateChange);
        };

        reg.addEventListener('updatefound', onUpdateFound);

        // 保險：2.5 秒後仍無 waiting，視為「目前已是最新」或更新尚未就緒
        setTimeout(() => {
          if (reg.waiting) finish({ hasUpdate: true });
          else finish({ hasUpdate: false });
        }, 2500);
      });

      // 1) 向網路查更新
      await reg.update();

      // 2) 等它下載到 waiting
      const { hasUpdate } = await waitForWaiting();

      if (!hasUpdate) {
        setUpdateStatus(`目前已是最新版（版本號：${APP_VERSION}）`);
        return;
      }

      // 3) 讓 waiting worker 立刻接管
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });

      // 4) 等 controller 換手後 reload
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return;
        reloaded = true;
        setUpdateStatus('已更新，重新載入中…');
        window.location.reload();
      });

      // 如果 controllerchange 沒發生（少數狀況），給提示
      setTimeout(() => {
        if (!reloaded) setUpdateStatus('更新已套用，若畫面未更新請手動重新開啟此頁。');
      }, 2500);
    } catch (e) {
      console.error(e);
      setUpdateStatus('更新失敗：請稍後再試，或重新整理頁面。');
    } finally {
      btn.disabled = false;
    }
  });
}

function bindAutoUI() {
  const ids = [
    'stage',
    'status',
    'specialMode',
    'planWhenAllObserving',
    'num1',
    'num2',
    'd1Type',
  ];
  ids.forEach((id) => {
    const el = qs(id);
    if (!el) return;
    el.addEventListener('change', updateFormVisibility);
    el.addEventListener('input', updateFormVisibility);
  });
}

function initAdvancedD1Toggle() {
  const btn = qs('toggleD1Btn');
  const content = qs('d1Content');
  if (!btn || !content) return;

  btn.addEventListener('click', () => {
    const isHidden = content.classList.contains('hidden');
    content.classList.toggle('hidden');
    btn.textContent = '🧩 D1 受精回報';
  });
}

function updateFormVisibility() {
  const stage = parseInt(qs('stage')?.value || '5', 10);
  const specialMode = qs('specialMode')?.value || 'none';

  const statusEl = qs('status');
  const status = statusEl?.value || 'done';

  const stageChanged = lastStage !== stage;
  lastStage = stage;

  const biopsyGroup = qs('biopsyFieldGroup');
  const planGroup = qs('planWhenAllObservingGroup');

  // 依不同天數，切換「胚胎狀態」預設
  // - D3：預設已完成
  // - D5/D6：預設仍在觀察中
  // - D7：預設已完成
  // 只在「切換 stage 的那一下」套用，避免你在同一天手動改狀態時被覆蓋
  if (specialMode === 'none' && stageChanged && statusEl) {
    if (stage === 3) statusEl.value = 'done';
    else if (stage === 5 || stage === 6) statusEl.value = 'observing';
    else if (stage === 7) statusEl.value = 'done';
  }

  // 特殊情境時：仍可輸入 stage/date/name/num1，但不需要 num2/狀態判斷
  if (specialMode !== 'none') {
    if (biopsyGroup) biopsyGroup.classList.add('hidden');
    if (planGroup) planGroup.classList.add('hidden');
    return;
  }

  // 重新讀一次（可能剛被自動改成 done）
  const status2 = statusEl?.value || status;

  // 只有 D5-7 會用到 num2（切片顆數）
  const showBiopsy = stage >= 5 && status2 !== 'all_observing';
  if (biopsyGroup) biopsyGroup.classList.toggle('hidden', !showBiopsy);

  // 「全部仍在觀察中」時，需要指定走 冷凍版 or 切片+冷凍版
  const showPlan = stage >= 5 && status2 === 'all_observing';
  if (planGroup) planGroup.classList.toggle('hidden', !showPlan);
}

function formatDatePlus(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
}

function queryDateByStage() {
  const date = qs('date')?.value;
  const stage = qs('stage')?.value;
  const d = new Date(date);
  const stageDay = parseInt(stage, 10);
  const daysToD8 = 8 - stageDay;
  d.setDate(d.getDate() + daysToD8);
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
}

function decideTemplateType({ stage, status, num1, num2 }) {
  // stage: 1/3/5/6/7
  // status: done/observing/all_observing

  // D1：保留舊邏輯（進階選單）
  if (stage === 1) {
    return qs('d1Type')?.value || '1️⃣D1（D5~D7 冷凍）';
  }

  // D3：目前只有一種（無觀察中）
  if (stage === 3) {
    return '3️⃣D3 冷凍（無觀察中）';
  }

  // D5-7
  const hasObservingText = status === 'observing' ? '（有觀察中）' : '（無觀察中）';

  if (status === 'all_observing') {
    const plan = qs('planWhenAllObserving')?.value || 'd5_freeze';
    return plan === 'pgt_a'
      ? '5️⃣D5 切片＋冷凍（全部仍在觀察中）'
      : '5️⃣D5 冷凍（全部仍在觀察中）';
  }

  const n1 = Number(num1) || 0;
  const n2 = Number(num2) || 0;

  // 防呆：如果選了 done/observing 但 num1=0，多半是操作誤差 → 直接走 all_observing
  if (n1 <= 0) {
    const plan = qs('planWhenAllObserving')?.value || 'd5_freeze';
    return plan === 'pgt_a'
      ? '5️⃣D5 切片＋冷凍（全部仍在觀察中）'
      : '5️⃣D5 冷凍（全部仍在觀察中）';
  }

  // 1) 全部都有切片（切片+冷凍）
  if (n2 > 0 && n2 >= n1) {
    return `5️⃣D5 切片＋冷凍${hasObservingText}`;
  }

  // 2) 有部分切片（冷凍含部分切片）
  if (n2 > 0 && n2 < n1) {
    return `5️⃣D5 冷凍含部分切片${hasObservingText}`;
  }

  // 3) 沒切片（冷凍）
  return `5️⃣D5 冷凍${hasObservingText}`;
}

function generateMessage() {
  const specialMode = qs('specialMode')?.value || 'none';
  const name = (qs('name')?.value || '').trim();
  const date = qs('date')?.value || '';
  const num1 = qs('num1')?.value || '0';
  const num2 = qs('num2')?.value || '0';
  const stage = parseInt(qs('stage')?.value || '5', 10);
  const status = qs('status')?.value || 'done';

  // 特殊情境：直接指定舊模板 key（沿用 templates_v4.js）
  let type;
  if (specialMode === 'd3_transfer_d5_no_freeze') {
    type = '3️⃣D3植入 + D5 冷凍（無胚可凍）';
  } else if (specialMode === 'd3_transfer_d5_no_biopsy') {
    type = '3️⃣D3植入 + D5 切片 + 冷凍（無胚可切）';
  } else {
    type = decideTemplateType({ stage, status, num1, num2 });
  }

  const payload = {
    type,
    name,
    date,
    num1,
    num2,
    stage,
    formatDatePlus,
    queryDateByStage: () => queryDateByStage(),
  };

  const message = window.renderBaopeiMessage(type, payload);
  qs('output').textContent = message;

  // 歷史：交給 ui_common
  if (window.historyApi) window.historyApi.addToHistory(message);
}

function copyOutput() {
  const text = qs('output')?.textContent;
  if (!text || text === '（訊息將顯示於此）') {
    alert('請先產生訊息再複製喔！');
    return;
  }
  const hidden = qs('hiddenCopy');
  hidden.value = text;
  hidden.select();
  document.execCommand("copy");
  hidden.blur();
  alert('訊息內容已複製，可以到官方Line使用嘍');
}

// 給 index.html 的 onclick="clearHistory()" 用：由 ui_common 實作
function clearHistory() {
  if (window.historyApi) window.historyApi.clearHistory();
}

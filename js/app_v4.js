// js/app_v4.js
const APP_VERSION = "v3.0 c｜2025.12.31";
let historyApi;

window.addEventListener('load', () => {
  // 共用 UI：版本顯示、日期預設、歷史收合、讀取歷史
  historyApi = initCommonUI({
    appVersion: APP_VERSION,
    storageKey: "history_baopei",
  });

  // 讓 HTML 的 onclick 也可用（保險）
  window.historyApi = historyApi;

  // 頁面專屬初始化
  toggleFields();
});

// 控制「切片顆數」欄位顯示
function toggleFields() {
  const type = document.getElementById('type')?.value || '';
  const biopsyGroup = document.getElementById('biopsyFieldGroup');
  if (!biopsyGroup) return;

  if (type.includes('切片')) {
    biopsyGroup.classList.remove('hidden');
  } else {
    biopsyGroup.classList.add('hidden');
  }
}

function formatDatePlus(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
}

function queryDateByStage() {
  const date = document.getElementById('date')?.value;
  const stage = document.getElementById('stage')?.value;
  const d = new Date(date);
  const stageDay = parseInt(stage, 10);
  const daysToD8 = 8 - stageDay;
  d.setDate(d.getDate() + daysToD8);
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
}

function generateMessage() {
  const type = document.getElementById('type')?.value || '';
  const name = (document.getElementById('name')?.value || '').trim();
  const date = document.getElementById('date')?.value || '';
  const num1 = document.getElementById('num1')?.value || '0';
  const num2 = document.getElementById('num2')?.value || '0';
  const stage = parseInt(document.getElementById('stage')?.value || '5', 10);

  const payload = {
    type, name, date, num1, num2, stage,
    formatDatePlus,
    queryDateByStage: () => queryDateByStage(),
  };

  const message = window.renderBaopeiMessage(type, payload);

  document.getElementById('output').textContent = message;

  // 歷史：交給 ui_common
  if (window.historyApi) window.historyApi.addToHistory(message);
}

function copyOutput() {
  const text = document.getElementById('output').textContent;
  if (!text || text === '（訊息將顯示於此）') {
    alert('請先產生訊息再複製喔！');
    return;
  }
  const hidden = document.getElementById('hiddenCopy');
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

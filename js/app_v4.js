  const APP_VERSION = "v3.0b（2025.12.31）";

const savedVersion = localStorage.getItem("app_version");
if (savedVersion !== APP_VERSION) {
  localStorage.setItem("app_version", APP_VERSION);
}
window.addEventListener('load', () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateInput = document.getElementById('date');
  if (dateInput && !dateInput.value) {
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  const vEl = document.getElementById('versionInfo');
  if (vEl) vEl.textContent = `修改日期：${APP_VERSION}`;
  
  loadHistory();
  toggleFields();
});

function toggleFields() {
    const type = document.getElementById('type').value;
    const biopsyGroup = document.getElementById('biopsyFieldGroup');
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
  const date = document.getElementById('date').value;
  const stage = document.getElementById('stage').value;
  const d = new Date(date);
  const stageDay = parseInt(stage);
  const daysToD8 = 8 - stageDay;
  d.setDate(d.getDate() + daysToD8);
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
}

function generateMessage() {
  const type = document.getElementById('type').value;
  const name = document.getElementById('name').value.trim();
  const date = document.getElementById('date').value;
  const num1 = document.getElementById('num1').value;
  const num2 = document.getElementById('num2').value;
  const stage = parseInt(document.getElementById('stage').value, 10);

  const payload = {
    type, name, date, num1, num2, stage,
    formatDatePlus,
    queryDateByStage: () => queryDateByStage(),
  };

  const message = window.renderBaopeiMessage(type, payload);

  document.getElementById('output').textContent = message;
  addToHistory(message);
}


function copyOutput() {
  const text = document.getElementById('output').textContent;
  if(!text || text === '（訊息將顯示於此）') {
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

function clearHistory() {
  if(confirm('確定要清除所有歷史紀錄嗎？')) {
      document.getElementById('historyList').innerHTML = '';
      localStorage.removeItem('messageHistory');
  }
}

function addToHistory(msg, fromLoad = false) {
  const historyList = document.getElementById('historyList');
  const li = document.createElement('li');

  const messageDiv = document.createElement('div');
  messageDiv.className = 'history-message';
  messageDiv.textContent = msg;

  const copyBtn = document.createElement('button');
  copyBtn.textContent = '複製此紀錄';
  copyBtn.style.marginTop = '0';
  copyBtn.style.backgroundColor = '#d8c3a5';
  copyBtn.style.padding = '0.5rem 1rem';
  copyBtn.style.fontSize = '0.9rem';
  copyBtn.style.alignSelf = 'flex-end';
  
  copyBtn.onclick = () => {
    const hidden = document.getElementById('hiddenCopy');
    hidden.value = msg;
    hidden.select();
    document.execCommand("copy");
    hidden.blur();
    alert("已複製紀錄！");
  };

  li.appendChild(messageDiv);
  li.appendChild(copyBtn);
  historyList.prepend(li);

  if (!fromLoad) saveHistory();
}

function saveHistory() {
  const items = [...document.querySelectorAll('#historyList .history-message')].map(div => div.textContent);
  localStorage.setItem('messageHistory', JSON.stringify(items));
}

function loadHistory() {
  const data = localStorage.getItem('messageHistory');
  if (data) {
    const messages = JSON.parse(data);
    messages.reverse().forEach(msg => addToHistory(msg, true));
  }
}
  document.getElementById('toggleHistoryBtn').addEventListener('click', () => {
  const content = document.getElementById('historyContent');
  const btn = document.getElementById('toggleHistoryBtn');

  const isHidden = content.classList.contains('hidden');
  content.classList.toggle('hidden');

  btn.textContent = isHidden
    ? '📂 隱藏歷史紀錄'
    : '📂 顯示歷史紀錄';
});

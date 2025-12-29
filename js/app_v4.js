<script>
  const APP_VERSION = "v3.0a（2025.12.29）";

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
  const stage = document.getElementById('stage').value;

  let message = '';

  if (type === '1️⃣D1（D5~D7 冷凍）') {
    message = `${name}您好，\n通知您這次療程一共有 ${num1} 顆卵子成功受精囉！\n胚胎發育是一個動態自我篩選的過程，我們會持續呵護胚胎寶寶。\n我們預計在 ${formatDatePlus(date, 4)}~${formatDatePlus(date, 6)} 之間幫胚胎進行冷凍，\n\n最後的冷凍顆數、胚胎的等級和照片您可於 ${formatDatePlus(date, 7)} 17:00後，在APP上査詢，謝謝您。`;
  } else if (type === '1️⃣D1（D5~D7 切片＋冷凍）') {
    message = `${name}您好，\n通知您這次療程一共有 ${num1} 顆卵子成功受精囉！\n胚胎發育是一個動態自我篩選的過程，我們會持續呵護胚胎寶寶。\n我們預計在 ${formatDatePlus(date, 4)}~${formatDatePlus(date, 6)} 之間幫胚胎進行切片及冷凍，\n\n最後的冷凍顆數、胚胎的等級和照片您可於 ${formatDatePlus(date, 7)} 17:00後，在APP上査詢，謝謝您。`;
  } else if (type === '1️⃣D1（D5 植入）') {
    message = `${name}您好，\n通知您，這次療程共有 ${num1} 顆卵子成功受精囉！\n胚胎的發育是一個自然篩選的過程，我們會細心呵護每一顆珍貴的胚胎寶寶。\n我們預計在 ${formatDatePlus(date, 4)} 進行胚胎植入，請您保持輕鬆愉快的心情，如有任何問題，歡迎與我們聯繫。\n祝您一切順利！`;
  } else if (type === '3️⃣D3 冷凍（無觀察中）') {
    message = `${name}您好，今天是胚胎培養的第 3 天，實驗室和您更新目前胚胎的狀況：\n\n✅已為您冷凍 ${num1} 顆胚胎。\n\n📲詳細的冷凍胚胎的等級和照片您可於 ${formatDatePlus(date, 1)} 17:00 後，在APP上查詢，謝謝您。`;
  } else if (type === '5️⃣D5 冷凍（有觀察中）') {
    message = `${name}您好，今天是胚胎培養的第 ${stage} 天，實驗室和您更新目前胚胎的狀況：\n\n✅我們今天已為您冷凍 ${num1} 顆胚胎寶寶。\n🐣還有胚胎仍在培養與觀察中。\n\n📲最終的冷凍顆數、胚胎等級及照片，您可於 ${queryDateByStage()} 17:00 後在APP上查詢，謝謝您。`;
  } else if (type === '5️⃣D5 冷凍（無觀察中）') {
    message = `${name}您好，今天是胚胎培養的第 ${stage} 天，實驗室和您更新目前胚胎的狀況：\n\n✅我們今天已為您冷凍 ${num1} 顆胚胎寶寶。\n\n📲冷凍胚胎的等級及照片，您可於 ${queryDateByStage()} 17:00 後在APP上查詢，謝謝您。`;
  } else if (type === '5️⃣D5 冷凍（全部仍在觀察中）') {
    message = `${name}您好，今天是胚胎培養的第 ${stage} 天，實驗室和您更新目前胚胎的狀況：\n\n🧫目前胚胎們仍在努力分裂長大中，今天尚未有達到冷凍條件的胚胎寶寶，\n我們會繼續細心照顧，同時也幫胚胎寶寶加油打氣，給他們一點時間，等待分裂至適當階段後，就可以冷凍了。\n\n📲提醒您，我們會於 ${formatDatePlus(date, 7 - stage)} 再以訊息回報您胚胎培養狀況，而最後的冷凍顆數、胚胎的等級和照片您可於 ${formatDatePlus(date, 8 - stage)} 17:00 後，在APP上查詢， 謝謝您。`;
  } else if (type === '5️⃣D5 切片＋冷凍（有觀察中）') {
    message = `${name}您好，今天是胚胎培養的第 ${stage} 天，實驗室和您更新目前胚胎的狀況：\n\n✅我們今天已為您切片及冷凍 ${num1} 顆胚胎寶寶。\n🐣尚有胚胎仍在培養與觀察中。\n\n📲最終的冷凍顆數、胚胎等級及照片，您可於 ${queryDateByStage()} 17:00 後在APP上查詢，謝謝您。`;
  } else if (type === '5️⃣D5 切片＋冷凍（無觀察中）') {
    message = `${name}您好，今天是胚胎培養的第 ${stage} 天，實驗室和您更新目前胚胎的狀況：\n\n✅本次已切片及冷凍 ${num1} 顆胚胎寶寶。\n\n📲冷凍胚胎的等級及照片，您可於 ${queryDateByStage()} 17:00 後在APP上查詢，謝謝您。`;
  } else if (type === '5️⃣D5 切片＋冷凍（全部仍在觀察中）') {
    message = `${name}您好，今天是胚胎培養的第 ${stage} 天，實驗室和您更新目前胚胎的狀況：\n\n🧫目前胚胎們仍在努力分裂長大中，今天尚未有達到切片和冷凍條件的胚胎寶寶，\n我們會繼續細心照顧，同時也幫胚胎寶寶加油打氣，給他們一點時間，等待分裂至適當階段後，就可以切片、冷凍了。\n\n📲提醒您，我們會於 ${formatDatePlus(date, 7 - stage)} 再以訊息回報您胚胎培養狀況，而最後的冷凍顆數、胚胎的等級和照片您可於 ${formatDatePlus(date, 8 - stage)} 17:00 後，在APP上查詢， 謝謝您。`;
  } else if (type === '5️⃣D5 冷凍含部分切片（有觀察中）') {
    message = `${name}您好，今天是胚胎培養的第 ${stage} 天，實驗室和您更新目前胚胎的狀況：\n\n✅我們今天已為您冷凍 ${num1} 顆，其中切片的胚胎寶寶有 ${num2} 顆。\n🐣尚有胚胎仍在培養觀察中。\n\n📲最後的冷凍顆數、胚胎的等級和照片您可於 ${queryDateByStage()} 17:00 後，在APP上查詢， 謝謝您。`;
  } else if (type === '5️⃣D5 冷凍含部分切片（無觀察中）') {
    message = `${name}您好，今天是胚胎培養的第 ${stage} 天，實驗室和您更新目前胚胎的狀況：\n\n✅本次共冷凍 ${num1} 顆，其中有 ${num2} 顆胚胎是有切片的。\n\n📲詳細冷凍胚胎的等級和照片您可於 ${queryDateByStage()} 17:00 後，在APP上查詢， 謝謝您。`;
  }
  
  // 按照您的要求，將這兩個判斷式移到最後，與 HTML 選項順序一致
  else if (type === '3️⃣D3植入 + D5 冷凍（無胚可凍）') {
    message = `${name}早安，\n今天是胚胎培養的第 ${stage} 天，\n很可惜，剩下還在培養中的胚胎寶寶沒有繼續分裂長大，所以我們這次除了已經植入的 ${num1} 顆胚胎寶寶之外，沒有剩餘可以冷凍的胚胎。\n\n希望此次植入的胚胎寶寶能夠順利著床好好長大，謝謝您`;
  } else if (type === '3️⃣D3植入 + D5 切片 + 冷凍（無胚可切）') {
    message = `${name}早安，\n今天是胚胎培養的第 ${stage} 天，\n很可惜，剩下還在培養中的胚胎寶寶沒有繼續分裂長大，所以我們這次除了已經植入的 ${num1} 顆胚胎寶寶之外，沒有剩餘可以切片及冷凍的胚胎。\n\n希望此次植入的胚胎寶寶能夠順利著床好好長大，謝謝您`;
  } 

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

</script>

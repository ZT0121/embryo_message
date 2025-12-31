// js/ui_common_v4.js
(function () {
  function qs(id) { return document.getElementById(id); }

  function setVersionText(appVersion, versionElId = "versionInfo") {
    const vEl = qs(versionElId);
    if (vEl) vEl.textContent = `修改日期：${appVersion}`;
  }

  function ensureTodayDate(dateElId = "date") {
    const dateInput = qs(dateElId);
    if (!dateInput || dateInput.value) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  function saveHistory(historyListElId, storageKey) {
    const items = [...document.querySelectorAll(`#${historyListElId} .history-message`)]
      .map(div => div.textContent);
    localStorage.setItem(storageKey, JSON.stringify(items));
  }

  function addToHistory({ msg, historyListElId, hiddenCopyElId, storageKey, fromLoad = false }) {
    const historyList = qs(historyListElId);
    if (!historyList) return;

    const li = document.createElement("li");

    const messageDiv = document.createElement("div");
    messageDiv.className = "history-message";
    messageDiv.textContent = msg;

    const copyBtn = document.createElement("button");
    copyBtn.className = "history-copy-btn";
    copyBtn.textContent = "複製";


    copyBtn.onclick = () => {
      const hidden = qs(hiddenCopyElId);
      if (!hidden) return;
      hidden.value = msg;
      hidden.select();
      document.execCommand("copy");
      hidden.blur();
      alert("已複製紀錄！");
    };

    li.appendChild(messageDiv);
    li.appendChild(copyBtn);
    historyList.prepend(li);

    if (!fromLoad) saveHistory(historyListElId, storageKey);
  }

  function loadHistory({ historyListElId, hiddenCopyElId, storageKey }) {
    const data = localStorage.getItem(storageKey);
    if (!data) return;
    const messages = JSON.parse(data);
    messages.reverse().forEach(msg =>
      addToHistory({ msg, historyListElId, hiddenCopyElId, storageKey, fromLoad: true })
    );
  }

  function clearHistory({ historyListElId, storageKey }) {
    if (!confirm("確定要清除所有歷史紀錄嗎？")) return;
    const list = qs(historyListElId);
    if (list) list.innerHTML = "";
    localStorage.removeItem(storageKey);
  }

  function initHistoryToggle({ toggleBtnId = "toggleHistoryBtn", contentId = "historyContent" }) {
    const btn = qs(toggleBtnId);
    const content = qs(contentId);
    if (!btn || !content) return;

    btn.addEventListener("click", () => {
      const isHidden = content.classList.contains("hidden");
      content.classList.toggle("hidden");
      btn.textContent = isHidden ? "📂 隱藏歷史紀錄" : "📂 顯示歷史紀錄";
    });
  }

  // 對外 API
  window.CommonUI = {
    setVersionText,
    ensureTodayDate,
    initHistoryToggle,
    addToHistory,
    loadHistory,
    clearHistory,
  };

  // 一鍵初始化（每頁只要呼叫一次）
  window.initCommonUI = function ({
    appVersion,
    storageKey,                 // 每頁不同，例如 "history_baopei", "history_rescueICSI"
    dateElId = "date",
    versionElId = "versionInfo",
    historyListElId = "historyList",
    hiddenCopyElId = "hiddenCopy",
    toggleBtnId = "toggleHistoryBtn",
    contentId = "historyContent",
  }) {
    // version + date
    if (appVersion) setVersionText(appVersion, versionElId);
    ensureTodayDate(dateElId);

    // history
    initHistoryToggle({ toggleBtnId, contentId });
    loadHistory({ historyListElId, hiddenCopyElId, storageKey });

    // 回傳工具，讓頁面可以直接用
    return {
      addToHistory: (msg) => addToHistory({ msg, historyListElId, hiddenCopyElId, storageKey }),
      clearHistory: () => clearHistory({ historyListElId, storageKey }),
      saveHistory: () => saveHistory(historyListElId, storageKey),
    };
  };
})();

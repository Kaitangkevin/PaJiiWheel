(function () {
  const config = window.LUCKY_DRAW_CONFIG;

  if (!config || !Array.isArray(config.prizes) || config.prizes.length === 0) {
    throw new Error("抽奖配置缺失，请检查 config.js。");
  }

  const canvas = document.getElementById("wheelCanvas");
  const drawButton = document.getElementById("drawButton");
  const statusText = document.getElementById("statusText");
  const rulesList = document.getElementById("rulesList");
  const probabilityNote = document.getElementById("probability-note");
  const modal = document.getElementById("resultModal");
  const resultTitle = document.getElementById("resultTitle");
  const resultText = document.getElementById("resultText");
  const closeModalButton = document.getElementById("closeModalButton");
  const context = canvas.getContext("2d");
  const drawScope = getDrawScope();
  const drawStorageKey = buildDrawStorageKey(drawScope.key);

  let currentRotation = 0;
  let isSpinning = false;

  resetIfRequested();
  renderRules();
  applyProbabilityNote();
  drawWheel();
  restoreDrawState();

  drawButton.addEventListener("click", handleDraw);
  closeModalButton.addEventListener("click", closeModal);
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  function renderRules() {
    rulesList.innerHTML = "";

    config.rules.forEach(function (rule) {
      const item = document.createElement("li");
      item.textContent = rule;
      rulesList.appendChild(item);
    });
  }

  function applyProbabilityNote() {
    probabilityNote.textContent = "";
  }

  function getProbabilityTotal() {
    return config.prizes.reduce(function (sum, item) {
      return sum + Math.max(0, Number(item.probability) || 0);
    }, 0);
  }

  function drawWheel() {
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 16;
    const segmentAngle = (Math.PI * 2) / config.prizes.length;

    context.clearRect(0, 0, size, size);
    context.save();
    context.translate(center, center);

    let startAngle = -Math.PI / 2;

    config.prizes.forEach(function (item, index) {
      const sliceAngle = segmentAngle;
      const endAngle = startAngle + sliceAngle;

      context.beginPath();
      context.moveTo(0, 0);
      context.arc(0, 0, radius, startAngle, endAngle);
      context.closePath();
      context.fillStyle = config.wheelPalette[index % config.wheelPalette.length];
      context.fill();

      context.save();
      context.rotate(startAngle + sliceAngle / 2);
      context.textAlign = "right";
      context.fillStyle = index % 2 === 0 ? "#06131b" : "#f8fafc";
      context.font = "700 28px sans-serif";
      context.fillText(item.name, radius - 38, -8);
      context.font = "400 18px sans-serif";
      context.fillText(item.description, radius - 38, 26);
      context.restore();

      startAngle = endAngle;
    });

    context.beginPath();
    context.arc(0, 0, 46, 0, Math.PI * 2);
    context.fillStyle = "#f8fafc";
    context.fill();

    context.beginPath();
    context.arc(0, 0, 28, 0, Math.PI * 2);
    context.fillStyle = "#06b6d4";
    context.fill();

    context.fillStyle = "#001018";
    context.font = "700 18px sans-serif";
    context.textAlign = "center";
    context.fillText("PaJii", 0, 7);
    context.restore();
  }

  function handleDraw() {
    if (isSpinning || drawButton.disabled) {
      return;
    }

    const total = getProbabilityTotal();
    const target = config.totalProbabilityTarget || 100;
    if (total <= 0) {
      statusText.textContent = "当前奖项概率配置无效，请先检查配置数组。";
      return;
    }

    if (!config.normalizeWhenTotalMismatch && total !== target) {
      statusText.textContent = "当前奖项总概率不是 100%，请先调整后再抽奖。";
      return;
    }

    const result = pickPrize();
    spinToPrize(result);
  }

  function pickPrize() {
    const total = getProbabilityTotal();
    const target = Math.random() * total;
    let cursor = 0;

    for (let index = 0; index < config.prizes.length; index += 1) {
      const prize = config.prizes[index];
      cursor += Math.max(0, Number(prize.probability) || 0);

      if (target <= cursor) {
        return {
          index: index,
          prize: prize,
        };
      }
    }

    return {
      index: config.prizes.length - 1,
      prize: config.prizes[config.prizes.length - 1],
    };
  }

  function spinToPrize(result) {
    isSpinning = true;
    drawButton.disabled = true;
    drawButton.textContent = "抽奖中...";
    statusText.textContent = "正在为你抽取结果，请稍候...";

    const angles = getSegmentAngles();
    const segment = angles[result.index];
    const segmentCenter = (segment.start + segment.end) / 2;
    const targetAngle = 360 - segmentCenter;
    const extraOffset = randomBetween(-segment.span * 0.25, segment.span * 0.25);
    const totalRotation =
      currentRotation + config.spinTurns * 360 + targetAngle + extraOffset;

    canvas.style.transitionDuration = (config.spinDurationMs / 1000).toFixed(2) + "s";
    canvas.style.transform = "rotate(" + totalRotation + "deg)";
    currentRotation = totalRotation % 360;

    window.setTimeout(function () {
      finishDraw(result.prize);
    }, config.spinDurationMs + 100);
  }

  function getSegmentAngles() {
    const span = 360 / config.prizes.length;
    let current = 0;

    return config.prizes.map(function () {
      const segment = {
        start: current,
        end: current + span,
        span: span,
      };
      current += span;
      return segment;
    });
  }

  function finishDraw(prize) {
    isSpinning = false;
    saveResult(prize);
    applyFinishedState(prize);
    openModal(prize);
  }

  function saveResult(prize) {
    const payload = {
      scope: drawScope.label,
      prizeName: prize.name,
      description: prize.description,
      time: new Date().toISOString(),
    };

    window.localStorage.setItem(drawStorageKey, JSON.stringify(payload));
  }

  function restoreDrawState() {
    const raw = window.localStorage.getItem(drawStorageKey);

    if (!raw) {
      drawButton.textContent = config.drawButtonText;
      statusText.textContent = config.defaultStatusText;
      return;
    }

    try {
      const data = JSON.parse(raw);
      applyFinishedState({
        name: data.prizeName,
        description: data.description,
      });
    } catch (error) {
      console.warn("Failed to restore lucky draw result.", error);
      window.localStorage.removeItem(drawStorageKey);
    }
  }

  function resetIfRequested() {
    const params = new URLSearchParams(window.location.search);

    if (params.get("reset") === "1") {
      window.localStorage.removeItem(drawStorageKey);
    }
  }

  function applyFinishedState(prize) {
    drawButton.disabled = true;
    drawButton.textContent = config.finishedButtonText;
    drawButton.classList.add("is-finished");
    resultTitle.textContent = config.modalTitleText;
    statusText.textContent = buildFinishedStatusMessage(prize);
  }

  function buildResultMessage(prize) {
    const descriptionText = prize.description ? "（" + prize.description + "）" : "";

    return config.modalResultTemplate
      .replace("{name}", prize.name)
      .replace("{descriptionText}", descriptionText);
  }

  function openModal(prize) {
    resultTitle.textContent = config.modalTitleText;
    resultText.textContent = buildResultMessage(prize);
    modal.classList.remove("hidden");
  }

  function closeModal() {
    modal.classList.add("hidden");
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function buildFinishedStatusMessage(prize) {
    if (!prize || !prize.name) {
      return "你已参与本次抽奖。";
    }

    return "你已参与本次抽奖，" + buildResultMessage(prize);
  }

  function getDrawScope() {
    const params = new URLSearchParams(window.location.search);
    const batch = normalizeScopeValue(params.get("batch"));
    const code = normalizeScopeValue(params.get("code"));

    if (batch) {
      return {
        type: "batch",
        key: batch,
        label: batch,
      };
    }

    if (code) {
      return {
        type: "code",
        key: code,
        label: code,
      };
    }

    const today = getTodayScopeValue();
    return {
      type: "today",
      key: today,
      label: today,
    };
  }

  function buildDrawStorageKey(scopeKey) {
    const prefix = config.storageKeyPrefix || "pajii_lucky_drawn_";
    return prefix + scopeKey;
  }

  function normalizeScopeValue(value) {
    const trimmed = String(value || "").trim();

    if (!trimmed) {
      return "";
    }

    const normalized = trimmed.replace(/[^a-zA-Z0-9_-]/g, "_");
    return normalized || "";
  }

  function getTodayScopeValue() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return "today_" + year + month + day;
  }
})();

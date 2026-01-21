(() => {
  const $ = (sel) => document.querySelector(sel);

  const statusLabel = $(".js-status-label");
  const hudBet = $(".js-hud-bet");
  const tableBet = $(".js-table-bet");
  const betRange = $(".js-bet-range");
  const betAmount = $(".js-bet-amount");
  const btnDeal = $(".js-btn-deal");
  const btnReset = $(".js-btn-reset");
  const btnHit = $(".js-btn-hit");
  const btnStand = $(".js-btn-stand");

  if (!betRange || !betAmount || !hudBet || !tableBet || !btnDeal || !btnReset || !statusLabel) return;

  const moneyFmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
  const fmtMoney = (n) => (Number.isFinite(n) ? `$${moneyFmt.format(n)}` : "$0");

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const stepRound = (n, step) => (step > 0 ? Math.round(n / step) * step : n);

  const min = Number(betRange.min || 0);
  const max = Number(betRange.max || 500);
  const step = Number(betRange.step || 1);

  let betLocked = false;
  let currentBet = 0;

  function applyBetToUI(n, source) {
    if (betLocked) return;

    // Allow 0 = no bet, otherwise enforce min/max/step.
    if (n !== 0) {
      n = clamp(n, min, max);
      n = stepRound(n, step);
      if (n < min) n = min;
    }

    currentBet = n;

    // Keep controls in sync (but don’t fight the field currently being typed in)
    if (source !== "range") betRange.value = String(n);
    if (source !== "number") betAmount.value = String(n);

    hudBet.textContent = fmtMoney(n);
    tableBet.textContent = fmtMoney(n);

    btnDeal.disabled = n <= 0;
    statusLabel.textContent = n > 0 ? "Ready to deal" : "Waiting for bet";
  }

  let rafPending = false;
  let pendingBet = 0;
  let pendingSource = "range";
  function setBet(next, source) {
    if (betLocked) return;
    let n = Number(next);
    if (!Number.isFinite(n)) n = 0;
    pendingBet = n;
    pendingSource = source;
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      applyBetToUI(pendingBet, pendingSource);
    });
  }

  function resetBetUI() {
    betLocked = false;
    betRange.disabled = false;
    betAmount.disabled = false;
    btnHit && (btnHit.disabled = true);
    btnStand && (btnStand.disabled = true);
    setBet(0);
  }

  betRange.addEventListener("input", (e) => setBet(e.target.value, "range"));
  betAmount.addEventListener("input", (e) => setBet(e.target.value, "number"));
  betAmount.addEventListener("blur", (e) => setBet(e.target.value, "number"));

  btnDeal.addEventListener("click", () => {
    if (currentBet <= 0) return;
    betLocked = true;
    betRange.disabled = true;
    betAmount.disabled = true;
    statusLabel.textContent = "Bet placed";
    if (btnHit) btnHit.disabled = false;
    if (btnStand) btnStand.disabled = false;
  });

  btnReset.addEventListener("click", () => {
    statusLabel.textContent = "Waiting for bet";
    resetBetUI();
  });

  // Init
  resetBetUI();
})();
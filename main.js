const SYMBOLS = ["BTCUSDT", "ETHUSDT", "USDTBRL"];
const LABELS = {
  BTCUSDT: "BTC/USDT",
  ETHUSDT: "ETH/USDT",
  USDTBRL: "USDT/BRL"
};

async function fetchPrices() {
  try {
    const endpoint = "https://api.binance.com/api/v3/ticker/24hr?symbols=" + encodeURIComponent(JSON.stringify(SYMBOLS));
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Ticker unavailable");

    const data = await response.json();
    return data.map((ticker) => ({
      symbol: LABELS[ticker.symbol] || ticker.symbol,
      price: Number(ticker.lastPrice),
      change: Number(ticker.priceChangePercent)
    }));
  } catch {
    return [
      { symbol: "BTC/USDT", price: 0, change: 0 },
      { symbol: "ETH/USDT", price: 0, change: 0 },
      { symbol: "USDT/BRL", price: 0, change: 0 }
    ];
  }
}

function formatPrice(price, symbol) {
  if (!price) return "Sob consulta";
  if (symbol === "USDT/BRL") return "R$ " + price.toFixed(2).replace(".", ",");
  return "$ " + price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderTicker(prices) {
  const ticker = document.getElementById("tickerContent");
  if (!ticker) return;

  const items = prices.map((price) => {
    const direction = price.change >= 0 ? "up" : "down";
    const arrow = price.change >= 0 ? "▲" : "▼";
    const change = price.price ? `${arrow} ${Math.abs(price.change).toFixed(2)}%` : "Mesa OTC";

    return `
      <span class="ticker-item">
        ${price.symbol}
        <strong>${formatPrice(price.price, price.symbol)}</strong>
        <span class="ticker-${direction}">${change}</span>
      </span>
    `;
  }).join("");

  ticker.innerHTML = items + items;

  const usdt = prices.find((price) => price.symbol === "USDT/BRL");
  const panelUsdt = document.getElementById("panelUsdt");
  if (panelUsdt && usdt) panelUsdt.textContent = formatPrice(usdt.price, usdt.symbol);
}

async function updateTicker() {
  renderTicker(await fetchPrices());
}

updateTicker();
setInterval(updateTicker, 30000);

const canvas = document.getElementById("heroCanvas");

if (canvas) {
  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let lines = [];

  function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    lines = Array.from({ length: 38 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 80 + Math.random() * 180,
      speed: 0.18 + Math.random() * 0.36,
      alpha: 0.05 + Math.random() * 0.13
    }));
  }

  function drawCanvas() {
    context.clearRect(0, 0, width, height);

    lines.forEach((line) => {
      context.strokeStyle = `rgba(255, 255, 255, ${line.alpha})`;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(line.x, line.y);
      context.lineTo(line.x + line.length, line.y - line.length * 0.28);
      context.stroke();

      line.x += line.speed;
      if (line.x > width + line.length) {
        line.x = -line.length;
        line.y = Math.random() * height;
      }
    });

    requestAnimationFrame(drawCanvas);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  requestAnimationFrame(drawCanvas);
}

const menuToggle = document.getElementById("menuToggle");
const nav = document.querySelector(".nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

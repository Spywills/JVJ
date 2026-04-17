// === TICKER ===
const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'USDTBRL'];
const LABELS = { BTCUSDT: 'BTC/USDT', ETHUSDT: 'ETH/USDT', USDTBRL: 'USDT/BRL' };

async function fetchPrices() {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=' + JSON.stringify(SYMBOLS));
    const data = await res.json();
    return data.map(t => ({
      symbol: LABELS[t.symbol] || t.symbol,
      price: parseFloat(t.lastPrice),
      change: parseFloat(t.priceChangePercent)
    }));
  } catch { return null; }
}

function formatPrice(price, symbol) {
  if (symbol === 'USDT/BRL') return 'R$ ' + price.toFixed(2);
  return '$ ' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderTicker(prices) {
  const el = document.getElementById('tickerContent');
  const items = prices.map(p => {
    const arrow = p.change >= 0 ? '▲' : '▼';
    const cls = p.change >= 0 ? 'up' : 'down';
    return `<span class="ticker-item">${p.symbol} <strong>${formatPrice(p.price, p.symbol)}</strong> <span class="ticker-${cls}">${arrow} ${Math.abs(p.change).toFixed(2)}%</span></span>`;
  }).join('');
  el.innerHTML = items + items;
}

async function updateTicker() {
  const prices = await fetchPrices();
  if (prices) renderTicker(prices);
}
updateTicker();
setInterval(updateTicker, 30000);

// === HERO CANVAS (subtle grid animation) ===
const canvas = document.getElementById('heroCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let w, h, dots = [];

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    dots = [];
    const spacing = 60;
    for (let x = 0; x < w; x += spacing) {
      for (let y = 0; y < h; y += spacing) {
        dots.push({ x, y, baseAlpha: Math.random() * 0.3 + 0.05, phase: Math.random() * Math.PI * 2 });
      }
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, w, h);
    dots.forEach(d => {
      const alpha = d.baseAlpha + Math.sin(time * 0.001 + d.phase) * 0.15;
      ctx.fillStyle = `rgba(59, 130, 246, ${Math.max(0, alpha)})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
}

// === SCROLL ANIMATIONS ===
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.section').forEach(s => observer.observe(s));

// === MOBILE MENU ===
const toggle = document.getElementById('menuToggle');
const nav = document.querySelector('.nav');
if (toggle) {
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.classList.toggle('active');
  });
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.classList.remove('active');
    });
  });
}

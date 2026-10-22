// --- 1. QUẢN LÝ NHẠC NỀN ---
const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicToggle');

function playAudio() {
  music.play().then(() => {
    if (musicBtn) musicBtn.classList.add('spinning');
  }).catch(() => {
    console.log("Cần tương tác để phát nhạc");
  });
}

function toggleMusic() {
  if (music.paused) {
    music.play();
    if (musicBtn) musicBtn.classList.add('spinning');
  } else {
    music.pause();
    if (musicBtn) musicBtn.classList.remove('spinning');
  }
}

// --- 2. HIỆU ỨNG MỞ PHONG BÌ THƯ (WAX SEAL UNBOXING) ---
function openEnvelope() {
  const envelope = document.getElementById('envelope');
  const envelopeScreen = document.getElementById('envelope-screen');

  // 1. Kích hoạt âm thanh ngay khi chạm vào con dấu
  music.volume = 0.8;
  playAudio();

  // 2. Kích hoạt hiệu ứng mở nắp & trượt thiệp
  envelope.classList.add('open');

  // 3. Sau 1.4s khi hiệu ứng mở thư hoàn tất, làm mờ màn hình nắp và lộ thiệp chính
  setTimeout(() => {
    envelopeScreen.style.opacity = '0';
    setTimeout(() => {
      envelopeScreen.style.visibility = 'hidden';
      // Kích hoạt ngay các animation đầu trang
      triggerInitialReveal();
    }, 900);
  }, 1400);
}

// --- 3. HIỆU ỨNG CUỘN (SCROLL REVEAL) ---
const observerOptions = {
  threshold: 0.12
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, observerOptions);

function triggerInitialReveal() {
  document.querySelector('.hero').classList.add('go');
  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}

// --- 4. ĐỒNG HỒ ĐẾM NGƯỢC ---
const weddingDate = new Date(2026, 11, 20, 11, 0, 0).getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = weddingDate - now;

  if (distance > 0) {
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = days < 10 ? '0' + days : days;
    document.getElementById('hours').innerText = hours < 10 ? '0' + hours : hours;
    document.getElementById('minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById('seconds').innerText = seconds < 10 ? '0' + seconds : seconds;
  }
}

setInterval(updateCountdown, 1000);
updateCountdown();

// --- 5. HIỆU ỨNG NÂNG CAO ---
const $ = (s) => [...document.querySelectorAll(s)];

// Hạt vàng bay lơ lửng
const sp = document.getElementById('sparks');
for (let i = 0; i < 22; i++) {
  const s = document.createElement('i');
  s.style.cssText = `left:${Math.random()*100}%;--s:${2+Math.random()*4}px;--t:${8+Math.random()*10}s;animation-delay:-${Math.random()*14}s`;
  sp.appendChild(s);
}

// Parallax: ảnh trượt chậm hơn khi cuộn
const pars = $('.par');
function parallax() {
  const h = innerHeight;
  pars.forEach(p => {
    const r = p.getBoundingClientRect();
    if (r.bottom < 0 || r.top > h) return;
    p.style.setProperty('--py', ((r.top + r.height / 2 - h / 2) * -0.12) + 'px');
  });
}
addEventListener('scroll', parallax, { passive: true });
parallax();

// Ảnh album xuất hiện lần lượt
$('.grid img').forEach((e, i) => e.style.setProperty('--d', i * 90 + 'ms'));

// Bấm ảnh để phóng to
$('.grid img, .pol img').forEach(i => i.onclick = () => {
  const l = document.getElementById('lb');
  l.firstElementChild.src = i.src;
  l.classList.add('on');
});

// Pháo giấy
function confetti(x, y, n = 60) {
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i');
    c.className = 'cf';
    c.style.cssText = `left:${x}px;top:${y}px;background:hsl(${Math.random()<.3?350:45},70%,${55+Math.random()*30}%);--dx:${(Math.random()-.5)*360}px;--dy:${-120-Math.random()*260}px;--r:${Math.random()*720}deg`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 1800);
  }
}

// PLOT TWIST: pháo giấy nổ khi cuộn tới
const twistIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    const r = e.target.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height / 2, 80);
    twistIO.unobserve(e.target);
  }
}), { threshold: 1 });
$('.twist').forEach(t => twistIO.observe(t));

// RSVP: nút "Bận" né tay người bấm
const no = document.getElementById('no'), yes = document.getElementById('yes'), msg = document.getElementById('rsvpMsg');
const lines = ['Ơ kìa, trượt rồi 😳', 'Đừng mà 🥺', 'Nút này hỏng rồi 🐉'];
let n = 0;
function ok(el) {
  const r = el.getBoundingClientRect();
  confetti(r.left + r.width / 2, r.top, 90);
  msg.textContent = 'Cảm ơn bạn! Hẹn gặp nhau ngày 20/12 nhé 🐉💍';
  msg.classList.add('show');
}
yes.onclick = () => ok(yes);
no.addEventListener('pointerenter', () => {
  if (n < 3) {
    no.textContent = lines[n++];
    no.style.transform = `translate(${(Math.random()-.5)*160}px,${(Math.random()-.5)*70}px)`;
  } else {
    no.style.transform = '';
    no.textContent = 'Thôi, tôi đến! 🎉';
    no.onclick = () => ok(no);
  }
});

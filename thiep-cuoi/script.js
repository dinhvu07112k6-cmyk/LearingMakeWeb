/*
 * CẤU HÌNH THIỆP — sửa các giá trị ở đây trước khi đăng công khai.
 * RSVP_FORM_URL: đường dẫn gửi câu trả lời của Google Forms (/viewform).
 * formEntries: mã trường entry.xxxxx lấy từ liên kết Google Forms điền sẵn.
 * ZALO_URL: liên kết Zalo của người nhận xác nhận, ví dụ https://zalo.me/09xxxxxxxx.
 */
const WEDDING_CONFIG = {
  groomName: 'Đình Vũ',       // TODO: thay bằng tên thật của chú rể
  brideName: 'Đình Vũ',       // TODO: thay bằng tên thật của cô dâu
  weddingDate: new Date(2026, 11, 20, 11, 0, 0),
  RSVP_FORM_URL: '',           // TODO: dán URL Google Form công khai vào đây
  ZALO_URL: '',                // TODO: dán link Zalo nhận xác nhận vào đây nếu muốn dùng Zalo
  formEntries: {
    guestName: '',             // ví dụ: '123456789' — chỉ nhập số sau entry.
    attendance: '',
    guestCount: '',
    note: ''
  }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const music = $('#bgMusic');
const musicToggle = $('#musicToggle');
const trackSelect = $('#trackSelect');
let selectedAttendance = 'yes';
let lastFocus = null;

function setText(selector, text) {
  const element = $(selector);
  if (element) element.textContent = text;
}

function setupNames() {
  const groomIds = ['#groomNameHero', '#groomNamePortrait', '#groomNameEvent'];
  const brideIds = ['#brideNameHero', '#brideNamePortrait', '#brideNameEvent'];
  groomIds.forEach(id => setText(id, WEDDING_CONFIG.groomName));
  brideIds.forEach(id => setText(id, WEDDING_CONFIG.brideName));
  $$('.couple-names').forEach(el => {
    el.setAttribute('aria-label', `${WEDDING_CONFIG.groomName} và ${WEDDING_CONFIG.brideName}`);
  });
  $$('.letter-names').forEach(el => { el.innerHTML = `${escapeHTML(WEDDING_CONFIG.groomName)} <i>&</i> ${escapeHTML(WEDDING_CONFIG.brideName)}`; });
  $$('.footer-names').forEach(el => { el.innerHTML = `${escapeHTML(WEDDING_CONFIG.groomName)} <i>&</i> ${escapeHTML(WEDDING_CONFIG.brideName)}`; });
  $$('.event-names').forEach(el => { el.setAttribute('aria-label', `${WEDDING_CONFIG.groomName} và ${WEDDING_CONFIG.brideName}`); });
  document.title = `Thiệp cưới | ${WEDDING_CONFIG.groomName} & ${WEDDING_CONFIG.brideName}`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function guestFromURL() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('ten') || '').trim().slice(0, 100);
}

function setupGuestName() {
  const guest = guestFromURL() || 'Quý khách';
  setText('#guestNameHero', guest);
  setText('#guestNameWelcome', guest);
  setText('#envelopeGuest', guest);
  $('#rsvpName').value = guest === 'Quý khách' ? '' : guest;
}

function setupCountdown() {
  const target = WEDDING_CONFIG.weddingDate.getTime();
  const update = () => {
    let distance = target - Date.now();
    if (distance <= 0) {
      ['#days', '#hours', '#minutes', '#seconds'].forEach(id => setText(id, '00'));
      setText('#countdownNote', 'Hôm nay là ngày vui! Hẹn gặp bạn tại lễ cưới.');
      return;
    }
    const values = {
      '#days': Math.floor(distance / 86400000),
      '#hours': Math.floor((distance % 86400000) / 3600000),
      '#minutes': Math.floor((distance % 3600000) / 60000),
      '#seconds': Math.floor((distance % 60000) / 1000)
    };
    Object.entries(values).forEach(([id, value]) => setText(id, String(value).padStart(2, '0')));
  };
  update();
  window.setInterval(update, 1000);
}

function startMusic() {
  if (!music) return;
  music.volume = 0.48;
  const playAttempt = music.play();
  if (playAttempt && typeof playAttempt.then === 'function') {
    playAttempt.then(() => musicToggle.classList.add('is-playing')).catch(() => {
      musicToggle.classList.remove('is-playing');
    });
  }
}

function toggleMusic() {
  if (!music) return;
  if (music.paused) startMusic();
  else {
    music.pause();
    musicToggle.classList.remove('is-playing');
  }
}

function changeTrack() {
  if (!music || !trackSelect) return;
  const wasPlaying = !music.paused;
  const newSource = trackSelect.value;
  music.pause();
  music.src = newSource;
  music.load();
  musicToggle.classList.remove('is-playing');
  if (wasPlaying) startMusic();
}

function openEnvelope() {
  const envelope = $('#envelope');
  const screen = $('#envelopeScreen');
  if (!envelope || !screen || envelope.classList.contains('is-open')) return;
  envelope.classList.add('is-open');
  startMusic();
  burst(window.innerWidth / 2, window.innerHeight / 2, 50);
  window.setTimeout(() => {
    screen.classList.add('is-hidden');
    $('#top').classList.add('is-visible');
    const video = $('#heroVideo');
    if (video && video.querySelector('source')) {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
    }
  }, 1250);
}

let revealObserver;
function setupRevealObserver() {
  const revealElements = $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('is-revealed'));
    return;
  }
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -25px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));
}

function setupPhotoFallbacks() {
  $$('img[src="anh-cuoi.jpg"]').forEach(img => {
    const useFallback = () => {
      if (img.dataset.fallbackUsed) return;
      img.dataset.fallbackUsed = 'true';
      img.src = 'photo-placeholder.svg';
    };
    img.addEventListener('error', useFallback, { once: true });
    // Covers files that failed before DOMContentLoaded attached the listener.
    if (img.complete && img.naturalWidth === 0) useFallback();
  });
}

function setupVideo() {
  const video = $('#heroVideo');
  const hero = $('#top');
  if (!video || !hero) return;
  video.addEventListener('canplay', () => hero.classList.add('video-ready'));
  video.addEventListener('error', () => hero.classList.remove('video-ready'));
}

function burst(x, y, count = 55) {
  const colors = ['#bd8e45', '#e8ca8d', '#a42336', '#d66c70', '#fff5dd'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('i');
    piece.className = 'confetti-piece';
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--dx', `${(Math.random() - 0.5) * 300}px`);
    piece.style.setProperty('--dy', `${-90 - Math.random() * 260}px`);
    piece.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
    document.body.appendChild(piece);
    window.setTimeout(() => piece.remove(), 1850);
  }
}

function setupSparks() {
  const holder = $('#sparkles');
  if (!holder) return;
  for (let i = 0; i < 18; i++) {
    const spark = document.createElement('i');
    spark.style.cssText = `left:${Math.random() * 100}%;--s:${2 + Math.random() * 3}px;--t:${10 + Math.random() * 12}s;--delay:-${Math.random() * 20}s;--drift:${(Math.random() - .5) * 100}px`;
    holder.appendChild(spark);
  }
}

function setupScrollProgress() {
  const bar = $('#pageProgress');
  const update = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const value = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, value))}%`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function openLightbox(image) {
  if (!image || !image.src) return;
  const box = $('#lightbox');
  $('#lightboxImage').src = image.src;
  box.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  $('#lightboxClose').focus();
}
function closeLightbox() {
  $('#lightbox').classList.remove('is-open');
  document.body.style.overflow = '';
}
function setupLightbox() {
  $$('.album-photo img, .story-image img, .portrait-frame img').forEach(img => {
    img.addEventListener('click', () => openLightbox(img));
  });
  $('#lightboxClose').addEventListener('click', closeLightbox);
  $('#lightbox').addEventListener('click', event => { if (event.target.id === 'lightbox') closeLightbox(); });
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeLightbox();
      closeRsvpModal();
    }
  });
}

function showRsvpModal(attendance) {
  selectedAttendance = attendance;
  lastFocus = document.activeElement;
  $('#rsvpAttendance').value = attendance;
  $('#rsvpStatus').textContent = '';
  $('#rsvpModal').hidden = false;
  document.body.style.overflow = 'hidden';
  window.setTimeout(() => $('#rsvpName').focus(), 50);
}
function closeRsvpModal() {
  const modal = $('#rsvpModal');
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.style.overflow = '';
  if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
}

function collectRsvp() {
  return {
    guestName: $('#rsvpName').value.trim(),
    attendance: $('#rsvpAttendance').value,
    guestCount: $('#rsvpCount').value,
    note: $('#rsvpNote').value.trim()
  };
}
function attendanceLabel(value) {
  return value === 'yes' ? 'Sẽ tham dự' : 'Không tham dự được';
}
function buildGoogleFormUrl(data) {
  const formUrl = WEDDING_CONFIG.RSVP_FORM_URL.trim();
  if (!formUrl) return null;
  try {
    const url = new URL(formUrl);
    url.searchParams.set('usp', 'pp_url');
    const mapping = {
      guestName: data.guestName,
      attendance: attendanceLabel(data.attendance),
      guestCount: data.guestCount,
      note: data.note
    };
    Object.entries(mapping).forEach(([key, value]) => {
      const entryId = String(WEDDING_CONFIG.formEntries[key] || '').trim().replace(/^entry\./, '');
      if (entryId) url.searchParams.set(`entry.${entryId}`, value);
    });
    return url.toString();
  } catch (error) {
    console.error('RSVP_FORM_URL không hợp lệ', error);
    return null;
  }
}
function createRsvpMessage(data) {
  return `Xác nhận thiệp cưới ${WEDDING_CONFIG.groomName} & ${WEDDING_CONFIG.brideName}\nTên khách: ${data.guestName}\nTrạng thái: ${attendanceLabel(data.attendance)}\nSố người: ${data.guestCount}\nLời nhắn: ${data.note || '(Không có)'}\nNgày cưới: 20/12/2026 - 11:00\nĐịa điểm: Trống Đồng Palace, 65 Quán Sứ, Hà Nội`;
}
function submitRsvp(event) {
  event.preventDefault();
  const data = collectRsvp();
  if (!data.guestName) {
    $('#rsvpStatus').textContent = 'Bạn vui lòng điền tên khách mời nhé.';
    $('#rsvpName').focus();
    return;
  }
  const target = buildGoogleFormUrl(data);
  if (target) {
    window.open(target, '_blank', 'noopener,noreferrer');
    $('#rsvpStatus').textContent = WEDDING_CONFIG.formEntries.guestName && WEDDING_CONFIG.formEntries.attendance
      ? 'Đã mở Google Form với thông tin điền sẵn. Hãy bấm Gửi trong Form để hoàn tất.'
      : 'Đã mở Google Form. Nếu chưa cấu hình mã trường, vui lòng điền lại thông tin trong Form rồi bấm Gửi.';
    return;
  }
  if (WEDDING_CONFIG.ZALO_URL.trim()) {
    $('#rsvpStatus').textContent = 'Sắp mở Zalo. Hãy dán nội dung xác nhận vào khung chat để gửi cho gia đình.';
    openZaloWithMessage(data);
    return;
  }
  $('#rsvpStatus').textContent = 'Thiệp chưa được nối với Google Form hoặc Zalo. Gia đình cần điền đường dẫn trong phần WEDDING_CONFIG của script.js trước khi gửi cho khách.';
}
function openZaloWithMessage(data) {
  const zaloUrl = WEDDING_CONFIG.ZALO_URL.trim();
  if (!zaloUrl) {
    $('#rsvpStatus').textContent = 'Chưa cấu hình ZALO_URL trong script.js.';
    return;
  }
  const message = createRsvpMessage(data);
  window.open(zaloUrl, '_blank', 'noopener,noreferrer');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(message).then(() => {
      $('#rsvpStatus').textContent = 'Đã sao chép nội dung xác nhận. Dán vào Zalo rồi bấm gửi nhé.';
    }).catch(() => {
      $('#rsvpStatus').textContent = 'Zalo đã mở. Bạn có thể sao chép nội dung xác nhận từ tin nhắn được hiển thị dưới đây.';
      const preview = document.createElement('textarea');
      preview.className = 'message-preview';
      preview.value = message;
      preview.readOnly = true;
      preview.setAttribute('aria-label', 'Nội dung xác nhận để sao chép');
      $('#rsvpStatus').after(preview);
    });
  } else {
    const preview = document.createElement('textarea');
    preview.className = 'message-preview';
    preview.value = message;
    preview.readOnly = true;
    preview.setAttribute('aria-label', 'Nội dung xác nhận để sao chép');
    $('#rsvpStatus').after(preview);
    $('#rsvpStatus').textContent = 'Zalo đã mở. Sao chép nội dung bên dưới và gửi trong khung chat nhé.';
  }
}

function setupRsvp() {
  $('#yesButton').addEventListener('click', () => showRsvpModal('yes'));
  $('#noButton').addEventListener('click', () => showRsvpModal('no'));
  $('#closeRsvp').addEventListener('click', closeRsvpModal);
  $('#rsvpModal').addEventListener('click', event => { if (event.target.id === 'rsvpModal') closeRsvpModal(); });
  $('#rsvpForm').addEventListener('submit', submitRsvp);
  $('#rsvpZalo').addEventListener('click', () => {
    const data = collectRsvp();
    if (!data.guestName) {
      $('#rsvpStatus').textContent = 'Bạn vui lòng điền tên khách mời nhé.';
      $('#rsvpName').focus();
      return;
    }
    if (!WEDDING_CONFIG.ZALO_URL.trim()) {
      $('#rsvpStatus').textContent = 'Gia đình chưa điền liên kết Zalo trong phần WEDDING_CONFIG của script.js.';
      return;
    }
    openZaloWithMessage(data);
  });
}

function setupPlotTwist() {
  const button = $('#twistButton');
  const content = $('#twistReveal');
  button.addEventListener('click', () => {
    const willOpen = content.hidden;
    content.hidden = !willOpen;
    button.setAttribute('aria-expanded', String(willOpen));
    button.innerHTML = willOpen ? 'Đóng bí mật nhỏ <span>↙</span>' : 'Mở bí mật nhỏ <span>↗</span>';
    if (willOpen) {
      const rect = button.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 90);
      content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

function init() {
  setupNames();
  setupGuestName();
  setupCountdown();
  setupPhotoFallbacks();
  setupVideo();
  setupSparks();
  setupScrollProgress();
  setupLightbox();
  setupRsvp();
  setupPlotTwist();
  setupRevealObserver();
  $('#openEnvelope').addEventListener('click', openEnvelope);
  musicToggle.addEventListener('click', toggleMusic);
  trackSelect.addEventListener('change', changeTrack);
  music.addEventListener('pause', () => musicToggle.classList.remove('is-playing'));
  music.addEventListener('playing', () => musicToggle.classList.add('is-playing'));
  $$('.album-photo').forEach((button, index) => button.style.setProperty('--delay', `${index * 65}ms`));
  $('#top').classList.add('is-visible');
}

document.addEventListener('DOMContentLoaded', init);

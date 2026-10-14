const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicToggle');
const coverScreen = document.getElementById('cover-screen');

// Hàm bấm mở thiệp
function openInvitation() {
  // 1. Phát nhạc & xoay biểu tượng đĩa
  music.play().then(() => {
    musicBtn.classList.add('spinning');
  }).catch((err) => {
    console.warn("Chính sách trình duyệt chặn phát nhạc tự động:", err);
  });

  // 2. Làm mờ bìa và ẩn hẳn sau khi hiệu ứng hoàn thành
  coverScreen.style.opacity = '0';
  setTimeout(() => {
    coverScreen.style.display = 'none';
  }, 800);
}

// Hàm kích hoạt nhạc và xoay đĩa
function startMusic() {
  music.play().then(() => {
    if (musicBtn) musicBtn.classList.add('spinning');
    // Đã phát thành công -> gỡ bỏ các sự kiện lắng nghe chạm
    removeInteractionEvents();
  }).catch((err) => {
    // Trình duyệt chặn autoplay lúc đầu, chờ người dùng chạm vào màn hình
    console.log("Đang chờ khách chạm vào màn hình để bật nhạc...");
  });
}

// Bật / tắt thủ công khi bấm nút đĩa than tròn
function toggleMusic() {
  if (music.paused) {
    music.play();
    if (musicBtn) musicBtn.classList.add('spinning');
  } else {
    music.pause();
    if (musicBtn) musicBtn.classList.remove('spinning');
  }
}

// 1. Cố gắng phát ngay khi vừa tải xong trang
window.addEventListener('DOMContentLoaded', () => {
  music.volume = 0.8; // Đặt âm lượng 80% cho êm dịu
  startMusic();
});

// 2. Dự phòng: Chỉ cần khách chạm nhẹ vào màn hình hoặc lướt trang là nhạc tự bật
const interactionEvents = ['click', 'touchstart', 'scroll'];

function handleFirstTouch() {
  startMusic();
}

interactionEvents.forEach(event => {
  window.addEventListener(event, handleFirstTouch, { once: true });
});

function removeInteractionEvents() {
  interactionEvents.forEach(event => {
    window.removeEventListener(event, handleFirstTouch);
  });
}
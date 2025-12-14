document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  const body = document.body;
  const musicToggleBtn = document.getElementById('musicToggle');
  const iconPlay = musicToggleBtn.querySelector('.icon-play');
  const iconPause = musicToggleBtn.querySelector('.icon-pause');
  const floatingIcons = document.querySelector('.floating-icons');
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;
  let audio = new Audio('music.mp3');
  audio.preload = 'auto';
  audio.loop = false;
  let isPlaying = false;
  let hasShownWish = false;
  let darkModeTimeout = null;
  let microphoneAccessible = false;
  let giftSystemStarted = false;
  let usedGiftIndexes = new Set();
  let availableGiftIndexes = [];

  const giftMessages = [
    "Chúc mừng sinh nhật tuổi 20! 🎂 Cậu đã chính thức bước vào độ tuổi đẹp nhất của cuộc đời!",
    "Tuổi 20 - tuổi của những ước mơ và hoài bão! 🌟 Chúc Châu luôn tỏa sáng!",
    "20 mùa hoa nở, cậu đã trưởng thành thật xinh đẹp! 💐 Chúc mừng sinh nhật!",
    "Tuổi 20 - độ tuổi đẹp nhất để yêu và được yêu! ❤️ Chúc cậu hạnh phúc!",
    "Chúc Châu tuổi 20 gặp nhiều may mắn và thành công! 🍀",
    "20 tuổi - hành trình mới bắt đầu! 🚀 Chúc cậu bay thật cao và xa!",
    "Tuổi 20 rực rỡ, tương lai tươi sáng! ✨ Chúc mừng sinh nhật Châu!",
    "Chúc cô gái 20 tuổi luôn xinh đẹp, tự tin và mạnh mẽ! 💪",
    "20 năm - một chặng đường đáng nhớ! 📖 Chúc cậu viết tiếp những trang mới thật hay!",
    "Tuổi 20 - tuổi của sự nhiệt huyết! 🔥 Chúc Châu luôn giữ ngọn lửa đam mê!",
    "Chúc mừng sinh nhật tuổi 20! 🎉 Mong cậu luôn vui vẻ và hạnh phúc!",
    "20 tuổi - độ tuổi hoàn hảo để khám phá thế giới! 🌍 Chúc cậu có nhiều trải nghiệm tuyệt vời!",
    "Chúc Châu tuổi 20 gặt hái nhiều thành công trong học tập và công việc! 📚",
    "20 mùa xuân qua, cậu ngày càng tỏa sáng! 🌸 Chúc mừng sinh nhật!",
    "Tuổi 20 - tuổi của sự tự do và trách nhiệm! 🗝️ Chúc cậu luôn cân bằng tốt!",
    "Chúc mừng cô gái 20 tuổi! 🥳 Mong cậu luôn giữ được nụ cười tươi!",
    "20 năm - quãng thời gian đáng trân trọng! 💖 Chúc cậu có thật nhiều kỷ niệm đẹp!",
    "Tuổi 20 rực rỡ, tâm hồn tươi trẻ! 🎈 Chúc Châu luôn tràn đầy năng lượng!",
    "Chúc cậu tuổi 20 có thật nhiều người bạn tốt và những mối quan hệ ý nghĩa! 👫",
    "20 tuổi - bắt đầu một chương mới thật tuyệt vời! 📖 Chúc Châu viết nên câu chuyện của riêng mình!"
  ];

  const giftImages = [
    "chau1.jpg", "chau2.jpg", "chau3.jpg", "chau4.jpg", "chau5.jpg",
    "chau6.jpg", "chau7.jpg", "chau8.jpg", "chau9.jpg", "chau10.jpg",
    "chau11.jpg", "chau12.jpg", "chau13.jpg", "chau14.jpg", "chau15.jpg",
    "chau16.jpg", "chau17.jpg", "chau18.jpg", "chau19.jpg", "chau20.jpg"
  ];

  function initializeGiftIndexes() {
    availableGiftIndexes = [];
    for (let i = 0; i < giftMessages.length; i++) {
      availableGiftIndexes.push(i);
    }
    availableGiftIndexes.sort(() => Math.random() - 0.5);
  }

  function startGiftSystem() {
    if (!giftSystemStarted) {
      giftSystemStarted = true;
      initializeGiftIndexes();
      initGiftSystem();
    }
  }

  function createGiftMessages() {
    const giftContainer = document.querySelector('.gift-messages-container') || document.createElement('div');
    if (!giftContainer.parentNode) {
      giftContainer.className = 'gift-messages-container';
      document.body.appendChild(giftContainer);
    }

    const giftCount = Math.min(Math.floor(Math.random() * 3) + 3, availableGiftIndexes.length);

    for (let i = 0; i < giftCount; i++) {
      setTimeout(() => {
        if (availableGiftIndexes.length > 0) {
          createSingleGift(giftContainer);
        }
      }, i * 800);
    }
  }

  function createSingleGift(container) {
    if (availableGiftIndexes.length === 0) {
      return;
    }

    const giftIndex = availableGiftIndexes.shift();
    const gift = document.createElement('div');
    gift.className = 'gift-message';
    gift.setAttribute('data-gift-index', giftIndex);

    const shortMessage = getRandomShortMessage();
    gift.textContent = shortMessage;
    gift.setAttribute('data-full-message', giftMessages[giftIndex]);
    gift.setAttribute('data-image-src', giftImages[giftIndex]);

    const position = getNonOverlappingPosition();
    gift.style.left = position.left + '%';
    gift.style.top = position.top + '%';

    container.appendChild(gift);

    setTimeout(() => {
      gift.classList.add('visible');

      const disappearTime = Math.random() * 4000 + 4000;
      setTimeout(() => {
        if (gift.parentNode && !gift.classList.contains('active')) {
          availableGiftIndexes.push(giftIndex);
          gift.style.opacity = '0';
          gift.style.transform = 'translateY(-100px) scale(0.5)';
          setTimeout(() => {
            if (gift.parentNode) {
              gift.remove();
            }
          }, 500);
        }
      }, disappearTime);
    }, 100);

    gift.addEventListener('click', handleGiftClick);
  }

  function getNonOverlappingPosition() {
    const existingGifts = document.querySelectorAll('.gift-message');
    let left, top, overlapping;
    let attempts = 0;

    do {
      overlapping = false;
      left = Math.random() * 70 + 15;
      top = Math.random() * 70 + 15;

      existingGifts.forEach(gift => {
        const giftLeft = parseFloat(gift.style.left);
        const giftTop = parseFloat(gift.style.top);
        const distance = Math.sqrt(Math.pow(left - giftLeft, 2) + Math.pow(top - giftTop, 2));

        if (distance < 15) {
          overlapping = true;
        }
      });

      attempts++;
    } while (overlapping && attempts < 20);

    return { left, top };
  }

  function getRandomShortMessage() {
    const shorts = [
        "Hey, quà đây! 🎁",
        "Mở thử xem ✨",
        "Cho Châu nè 💝",
        "Tuổi 20 vui nhé 🎉",
        "Click đi nào 🎀",
        "Bất ngờ nè 🔮",
        "Chúc mừng nha 💌",
        "Quà nè 🎊",
        "Tỏa sáng đi 🌟",
        "Cố lên nhé 💫",
        "Vui lên ❤️",
        "Cười lên nào 💖",
        "Hihi vui ghê 🥳",
        "Bay cao nào 🎈",
        "Ngọt ngào nè 🍰",
        "Trúng quà 🎯",
        "Đỉnh quá 🏆",
        "Tuyệt vời ⭐",
        "Màu sắc nè 🌈",
        "Pháo hoa 🎇"
      ];
    return shorts[Math.floor(Math.random() * shorts.length)];
  }

  function handleGiftClick(event) {
    const gift = event.currentTarget;
    const giftIndex = parseInt(gift.getAttribute('data-gift-index'));
    const fullMessage = gift.getAttribute('data-full-message');
    const imageSrc = gift.getAttribute('data-image-src');

    usedGiftIndexes.add(giftIndex);

    gift.classList.add('active');

    setTimeout(() => {
      showGiftPopup(fullMessage, imageSrc);
      gift.remove();
    }, 800);
  }

  function showGiftPopup(message, imageSrc) {
    const overlay = document.createElement('div');
    overlay.className = 'gift-overlay';
    document.body.appendChild(overlay);

    const popup = document.createElement('div');
    popup.className = 'gift-popup';
    popup.innerHTML = `
      <button class="gift-popup-close">×</button>
      <div class="gift-avatar">
        <img src="${imageSrc}" alt="Châu - Ảnh kỷ niệm" onerror="handleImageError(this)" />
      </div>
      <div class="gift-message-content">${message}</div>
      <div style="margin-top: 15px; font-size: 16px; opacity: 0.8;">
        Đã mở ${usedGiftIndexes.size}/20 món quà
      </div>
    `;

    document.body.appendChild(popup);

    setTimeout(() => {
      overlay.classList.add('show');
      popup.classList.add('show');
    }, 50);

    const closeBtn = popup.querySelector('.gift-popup-close');
    const closePopup = () => {
      popup.classList.remove('show');
      overlay.classList.remove('show');
      setTimeout(() => {
        popup.remove();
        overlay.remove();
      }, 500);
    };

    closeBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', closePopup);

    setTimeout(closePopup, 6000);
  }

  function handleImageError(img) {
    console.log(`Không thể tải ảnh: ${img.src}`);
    img.style.display = 'none';

    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.innerHTML = '🎁';
    placeholder.style.fontSize = '48px';
    placeholder.style.textAlign = 'center';
    placeholder.style.padding = '20px';
    img.parentNode.appendChild(placeholder);
  }

  function initGiftSystem() {
    setTimeout(createGiftMessages, 2000);

    setInterval(() => {
      const currentGifts = document.querySelectorAll('.gift-message').length;
      if (currentGifts < 5 && availableGiftIndexes.length > 0 && usedGiftIndexes.size < 20) {
        createGiftMessages();
      }
    }, 8000);
  }

  function createFloatingIcons() {
    const icons = ['🎂', '🎁', '🎀', '🎊', '🎉', '✨', '🌟', '💫', '❤️', '💝', '💖', '🥳'];
    for (let i = 0; i < 15; i++) {
      const icon = document.createElement('div');
      icon.className = 'floating-icon';
      icon.style.left = Math.random() * 100 + 'vw';
      icon.style.animationDelay = Math.random() * 10 + 's';
      icon.textContent = icons[Math.floor(Math.random() * icons.length)];
      floatingIcons.appendChild(icon);
    }
  }

  function createShootingStars() {
    const starCount = 3;

    for (let i = 0; i < starCount; i++) {
      setTimeout(() => {
        const starContainer = document.createElement('div');
        starContainer.className = 'shooting-star-container';
        starContainer.style.position = 'fixed';
        starContainer.style.zIndex = '1000';
        starContainer.style.pointerEvents = 'none';
        starContainer.style.opacity = '0';

        const startY = Math.random() * 25 + 5;
        starContainer.style.left = '100vw';
        starContainer.style.top = startY + 'vh';
        starContainer.style.transform = 'rotate(-8deg)';

        const starHead = document.createElement('div');
        starHead.className = 'star-head';
        starHead.innerHTML = '⭐';
        starHead.style.position = 'absolute';
        starHead.style.fontSize = '24px';
        starHead.style.filter = 'drop-shadow(0 0 10px white)';
        starHead.style.zIndex = '1001';
        starHead.style.transform = 'translate(-50%, -50%)';

        const starTrail = document.createElement('div');
        starTrail.className = 'star-trail';
        starTrail.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), rgba(255,255,255,0.3), transparent)';
        starTrail.style.width = '0px';
        starTrail.style.height = '6px';
        starTrail.style.borderRadius = '3px';
        starTrail.style.position = 'absolute';
        starTrail.style.filter = 'blur(1px)';

        starContainer.appendChild(starTrail);
        starContainer.appendChild(starHead);
        document.body.appendChild(starContainer);

        const animation = starContainer.animate([
          {
            transform: 'rotate(-8deg) translateX(100px)',
            opacity: 0
          },
          {
            transform: 'rotate(-8deg) translateX(0)',
            opacity: 1
          },
          {
            transform: 'rotate(-8deg) translateX(-100vw)',
            opacity: 0
          }
        ], {
          duration: 5000,
          easing: 'cubic-bezier(0.3, 0, 0.1, 1)'
        });

        const trailAnimation = starTrail.animate([
          {
            width: '0px'
          },
          {
            width: '400px'
          },
          {
            width: '200px'
          }
        ], {
          duration: 5000,
          easing: 'cubic-bezier(0.3, 0, 0.1, 1)'
        });

        animation.onfinish = () => {
          starContainer.remove();
        };

      }, i * 2000);
    }
  }

  function toggleMusic() {
    if (isPlaying) {
      audio.pause();
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
      isPlaying = false;
    } else {
      audio.play().catch(e => {
        console.log("Audio play failed:", e);
        showMessage("❌ Không thể phát nhạc. Vui lòng tương tác với trang trước.");
      });
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
      isPlaying = true;
    }
  }

  musicToggleBtn.addEventListener('click', toggleMusic);

  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    candleCountDisplay.textContent = activeCandles;
  }

  function updateCandleLights() {
    const activeCandles = candles.filter(candle => !candle.classList.contains("out"));

    if (activeCandles.length > 0) {
      enableDarkMode();
    } else {
      disableDarkModeWithDelay();
    }
  }

  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    createSparkle(left, top);

    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
    updateCandleLights();

    if (candles.length === 1) {
      enableDarkMode();
    }
  }

  function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.style.position = 'absolute';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    sparkle.style.width = '20px';
    sparkle.style.height = '20px';
    sparkle.style.background = 'radial-gradient(circle, #fff, #ffd700, transparent)';
    sparkle.style.borderRadius = '50%';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.animation = 'sparklePop 0.6s ease-out forwards';
    cake.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 600);
  }

  const sparkleStyle = document.createElement('style');
  sparkleStyle.textContent = `
    @keyframes sparklePop {
      0% {
        transform: scale(0) rotate(0deg);
        opacity: 1;
      }
      50% {
        transform: scale(1.5) rotate(180deg);
        opacity: 0.7;
      }
      100% {
        transform: scale(2) rotate(360deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(sparkleStyle);

  cake.addEventListener("click", function (event) {
    const rect = cake.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    addCandle(left, top);
  });

  function isBlowing() {
    if (!analyser) return false;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    let average = sum / bufferLength;

    return average > 60;
  }

  function enableDarkMode() {
    clearTimeout(darkModeTimeout);
    body.classList.add("dark");
  }

  function disableDarkModeWithDelay() {
    clearTimeout(darkModeTimeout);
    darkModeTimeout = setTimeout(() => {
      body.classList.remove("dark");
    }, 7000);
  }

  function blowOutCandles() {
    let blownOut = 0;

    if (candles.length > 0 && candles.some((candle) => !candle.classList.contains("out"))) {
      if (isBlowing()) {
        candles.forEach((candle) => {
          if (!candle.classList.contains("out") && Math.random() > 0.5) {
            candle.classList.add("out");
            blownOut++;
            createSmoke(candle);
          }
        });
      }

      if (blownOut > 0) {
        updateCandleCount();
        updateCandleLights();
      }

      if (candles.every((candle) => candle.classList.contains("out")) && !hasShownWish) {
        hasShownWish = true;
        disableDarkModeWithDelay();

        setTimeout(function () {
          triggerConfetti();
          endlessConfetti();
          createShootingStars();

          if (!isPlaying) {
            toggleMusic();
          }

          const instructions = document.querySelector('.instructions');
          if (instructions) {
            instructions.style.transition = 'opacity 1s ease';
            instructions.style.opacity = '0';

            setTimeout(() => {
              instructions.style.display = 'none';
            }, 1000);
          }

          const happyText = document.querySelector('.candle-count-display');
          if (happyText) {
            happyText.classList.add('show');

            const spans = happyText.querySelectorAll('span');
            spans.forEach((span, i) => {
              setTimeout(() => {
                span.classList.add('visible');
              }, i * 150);
            });
          }

          setTimeout(() => {
            const wishImage = document.querySelector('.wish-image');
            if (wishImage) {
              wishImage.classList.add('show');
            }
          }, 2500);

          setTimeout(startGiftSystem, 8000);

        }, 200);
      }
    }
  }

  function createSmoke(candle) {
    const smoke = document.createElement('div');
    const rect = candle.getBoundingClientRect();
    const cakeRect = cake.getBoundingClientRect();
    smoke.style.position = 'absolute';
    smoke.style.left = (rect.left - cakeRect.left + rect.width / 2) + 'px';
    smoke.style.top = (rect.top - cakeRect.top - 20) + 'px';
    smoke.style.width = '8px';
    smoke.style.height = '8px';
    smoke.style.background = 'rgba(200, 200, 200, 0.8)';
    smoke.style.borderRadius = '50%';
    smoke.style.pointerEvents = 'none';
    smoke.style.animation = 'smokeRise 2s ease-out forwards';
    cake.appendChild(smoke);

    setTimeout(() => smoke.remove(), 2000);
  }

  const smokeStyle = document.createElement('style');
  smokeStyle.textContent = `
    @keyframes smokeRise {
      0% {
        transform: translateY(0) scale(1);
        opacity: 0.8;
      }
      100% {
        transform: translateY(-100px) scale(3);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(smokeStyle);

  function setupClickToBlow() {
    let clickBlowMode = false;

    document.addEventListener('dblclick', function () {
      clickBlowMode = !clickBlowMode;
      if (clickBlowMode) {
        showMessage('💨 Chế độ thổi bằng click đã bật! Click vào nến để thổi.');
      } else {
        showMessage('🎂 Chế độ thổi bằng click đã tắt.');
      }
    });

    cake.addEventListener('click', function (event) {
      if (!clickBlowMode) return;
      const clickedCandle = event.target.closest('.candle');
      if (clickedCandle && !clickedCandle.classList.contains('out')) {
        clickedCandle.classList.add('out');
        createSmoke(clickedCandle);
        updateCandleCount();
        updateCandleLights();

        if (candles.every(candle => candle.classList.contains("out")) && !hasShownWish) {
          hasShownWish = true;
          disableDarkModeWithDelay();

          setTimeout(function () {
            triggerConfetti();
            endlessConfetti();
            createShootingStars();

            if (!isPlaying) {
              toggleMusic();
            }

            const instructions = document.querySelector('.instructions');
            if (instructions) {
              instructions.style.transition = 'opacity 1s ease';
              instructions.style.opacity = '0';

              setTimeout(() => {
                instructions.style.display = 'none';
              }, 1000);
            }

            const happyText = document.querySelector('.candle-count-display');
            if (happyText) {
              happyText.classList.add('show');

              const spans = happyText.querySelectorAll('span');
              spans.forEach((span, i) => {
                setTimeout(() => {
                  span.classList.add('visible');
                }, i * 150);
              });
            }

            setTimeout(() => {
              const wishImage = document.querySelector('.wish-image');
              if (wishImage) {
                wishImage.classList.add('show');
              }
            }, 2500);

            setTimeout(startGiftSystem, 8000);

          }, 200);
        }
      }
    });
  }

  function showMessage(text) {
    const message = document.createElement('div');
    message.style.position = 'fixed';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.background = 'rgba(0,0,0,0.8)';
    message.style.color = 'white';
    message.style.padding = '15px 25px';
    message.style.borderRadius = '25px';
    message.style.zIndex = '1000';
    message.style.fontSize = '18px';
    message.textContent = text;
    document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  createFloatingIcons();

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        microphoneAccessible = true;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(function (err) {
        console.log("Unable to access microphone: " + err);
        setupClickToBlow();
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
    setupClickToBlow();
  }
});

function triggerConfetti() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: {
          x: Math.random(),
          y: Math.random() * 0.6
        },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
      });
    }, i * 200);
  }
}

function endlessConfetti() {
  const confettiInterval = setInterval(function () {
    confetti({
      particleCount: 30,
      spread: 100,
      origin: {
        x: Math.random(),
        y: 0
      },
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']
    });
  }, 500);
  setTimeout(() => {
    clearInterval(confettiInterval);
  }, 15000);
}

document.addEventListener('click', function (event) {
  const wishImg = document.querySelector('.wish-image');
  if (!wishImg || !wishImg.classList.contains('show')) return;

  if (!wishImg.contains(event.target)) {
    wishImg.classList.remove('show');
  }
});
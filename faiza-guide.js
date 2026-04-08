function initFaizaGuide() {
  const guide = document.getElementById('faiza-guide');
  if (!guide) return;

  const idle = document.getElementById('faiza-idle');
  const talking = document.getElementById('faiza-talking');
  const bubble = document.getElementById('faiza-bubble');
  const audioPath = guide.dataset.faizaAudio;

  if (!idle || !talking || !audioPath) return;

  const voice = new Audio(audioPath);
  voice.preload = 'auto';
  // Home page behavior differs from country pages (position + autoplay rules).
  const isHomePage = window.location.pathname.endsWith('/index.html') || window.location.pathname === '/' || window.location.pathname === '';
  const hasPlayedHomeWelcome = sessionStorage.getItem('faiza-home-welcome-played') === '1';
  if (!isHomePage) guide.classList.add('faiza-country-position');

  let flapTimer = null;

  function setIdle() {
    talking.style.display = 'none';
    idle.style.display = 'block';
  }

  function startTalkingAnimation() {
    if (flapTimer) return;
    flapTimer = setInterval(() => {
      const isTalkingVisible = talking.style.display !== 'none';
      talking.style.display = isTalkingVisible ? 'none' : 'block';
      idle.style.display = isTalkingVisible ? 'block' : 'none';
    }, 250);
  }

  function stopTalkingAnimation() {
    if (flapTimer) {
      clearInterval(flapTimer);
      flapTimer = null;
    }
    setIdle();
  }

  function playVoice() {
    voice.currentTime = 0;
    startTalkingAnimation();
    // If autoplay is blocked, arm one-time user interactions to unlock audio.
    voice.play().catch(() => {
      stopTalkingAnimation();
      const unlock = () => {
        voice.play().finally(() => {
          window.removeEventListener('click', unlock);
          window.removeEventListener('touchstart', unlock);
          window.removeEventListener('keydown', unlock);
        });
      };
      window.addEventListener('click', unlock, { once: true });
      window.addEventListener('touchstart', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    });
  }

  if (bubble) {
    // Bubble doubles as replay control for the guide voice-over.
    bubble.addEventListener('click', playVoice);
    bubble.addEventListener('touchstart', playVoice, { passive: true });
  }

  voice.addEventListener('ended', stopTalkingAnimation);
  voice.addEventListener('pause', stopTalkingAnimation);
  voice.addEventListener('error', stopTalkingAnimation);
  voice.addEventListener('ended', () => {
    if (isHomePage) sessionStorage.setItem('faiza-home-welcome-played', '1');
  });

  setIdle();

  // Play the home welcome only once per browser tab session.
  if (isHomePage && hasPlayedHomeWelcome) return;

  // On country pages, sequence narration before environmental country audio.
  const countrySound = document.querySelector('.country-card audio');
  if (!isHomePage && countrySound) {
    const startCountryAfterGuide = () => {
      voice.removeEventListener('ended', startCountryAfterGuide);
      countrySound.currentTime = 0;
      countrySound.play().catch(() => {});
    };

    // Stop autoplay race so city audio does not start before Faiza.
    countrySound.autoplay = false;
    countrySound.pause();
    countrySound.currentTime = 0;

    voice.addEventListener('ended', startCountryAfterGuide);
    playVoice();
    return;
  }

  playVoice();
}

document.addEventListener('DOMContentLoaded', initFaizaGuide);

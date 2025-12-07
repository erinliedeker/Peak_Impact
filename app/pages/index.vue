<template>
  <div class="landing-content">
    <header class="hero-section">
      <div class="ambient-glow glow-blue"></div>
      <div class="ambient-glow glow-orange"></div>

      <div class="hero-grid">
        <div class="hero-text fade-in">
          <h1 class="main-title">
            Volunteering, <br />
            <span class="text-gradient">Reimagined.</span>
          </h1>
          
          <p class="subtitle">
            Your Impact. Our 
            <span class="typing-text-wrapper">{{ dynamicText }}</span><span class="cursor">|</span>
          </p>

          <p class="tagline">
              Connecting citizens to the local causes that matter. Built exclusively for Colorado Springs.
          </p>
        </div>

        <div class="hero-visual fade-in delay-2">
          <div class="image-wrapper floating">
            <img 
              class="landing-image" 
              src="~/assets/images/landing-image.png" 
              alt="Peak Impact - Connecting Volunteers"
            />
          </div>
        </div>
      </div>
    </header>

    <section class="mission-statement-section">
      <h2 class="mission-title">Our Mission</h2>
      <p class="mission-text">
        At Peak Impact, our mission is to connect passionate volunteers with impactful organizations in Colorado Springs. We strive to create a community where everyone can contribute their time and skills to make a positive difference in the lives of others.
      </p>
    </section>

    <section class="stats-ticker">
      <div class="stat-box">
        <span class="stat-number">12,400+</span>
        <span class="stat-label">Volunteer Hours Logged</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-box">
        <span class="stat-number">450+</span>
        <span class="stat-label">Local Events Completed</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-box">
        <span class="stat-number">89</span>
        <span class="stat-label">Partner Organizations</span>
      </div>
    </section>

    <section class="features-section">
      <h2 class="section-title"  style="color: var(--color-bg)">The Platform Difference</h2>
      <div class="features-grid">
        <div class="feature-card fade-in delay-3">
          <div class="f-icon bg-green"><Icon name="heroicons:map-pin" /></div>
          <h3 style="color: var(--color-border)">Local Discovery</h3>
          <p>Find micro-projects and organized group events happening right in your Colorado Springs neighborhood.</p>
        </div>
        <div class="feature-card fade-in delay-4">
          <div class="f-icon bg-blue"><Icon name="heroicons:qr-code" /></div>
          <h3 style="color: var(--color-border)">Easy Check-In</h3>
          <p>Verify your volunteer hours instantly with QR codes. No more paper forms or manual tracking.</p>
        </div>
        <div class="feature-card fade-in delay-5">
          <div class="f-icon bg-orange"><Icon name="heroicons:chart-bar" /></div>
          <h3 style="color: var(--color-border)">Track & Share</h3>
          <p>Gamify your service. Earn badges, track streaks, and generate verified reports for school or work.</p>
        </div>
      </div>
    </section>

    <footer class="simple-footer">
      <p>&copy; 2025 Peak Impact. Built for Colorado Springs.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

definePageMeta({
  layout: 'landing',
});

// --- Typing Effect Logic ---
const dynamicText = ref('Mission.');
const words = ['Mission.', 'Purpose.', 'Legacy.', 'Community.'];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

const typeEffect = () => {
  const currentWord = words[wordIndex];
  if (isDeleting) {
    dynamicText.value = currentWord.substring(0, charIndex - 1);
    charIndex--;
  } else {
    dynamicText.value = currentWord.substring(0, charIndex + 1);
    charIndex++;
  }

  const speed = isDeleting ? 100 : 150;
  let pauseDuration = 0;

  if (!isDeleting && charIndex === currentWord.length) {
    isDeleting = true;
    pauseDuration = 2000; 
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    pauseDuration = 500;
  }

  setTimeout(typeEffect, pauseDuration || speed);
};

onMounted(() => {
  setTimeout(typeEffect, 1000);
});
</script>

<style scoped>
/* --- VARIABLES & BASE --- */
.landing-content {
  --bg-dark: #1b273e;
  --bg-darker: #111827;
  --accent-orange: #f59e0b;
  --accent-green: #10b981;
  --accent-blue: #3b82f6;
  --text-white: #f8fafc;
  --text-gray: #94a3b8;
  
  background-color: var(--bg-dark);
  color: var(--text-white);
  min-height: 100vh;
  font-family: system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* --- 1. HERO SECTION --- */
.hero-section {
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 5% 80px;
  box-sizing: border-box;
}

/* Background Glows */
.ambient-glow { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.4; z-index: 0; }
.glow-blue { width: 500px; height: 500px; background: var(--accent-blue); top: -50px; left: -100px; animation: pulseGlow 8s infinite alternate; }
.glow-orange { width: 400px; height: 400px; background: var(--accent-orange); bottom: 10%; right: -50px; opacity: 0.2; animation: pulseGlow 10s infinite alternate-reverse; }

.hero-grid {
  display: grid; grid-template-columns: 1fr 1.2fr;
  max-width: 1300px; width: 100%; gap: 60px;
  position: relative; z-index: 10;
  align-items: center;
}

/* Hero Text */
.main-title { font-size: 4.5rem; line-height: 1.1; font-weight: 800; margin: 0 0 20px 0; color: var(--color-bg); }
.text-gradient {
  background: linear-gradient(135deg, var(--text-white) 30%, var(--text-gray) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.subtitle { font-size: 1.8rem; color: var(--text-white); margin-bottom: 20px; line-height: 1.6; min-height: 1.6em; }
.typing-text-wrapper { color: var(--accent-orange); font-weight: 600; }
.tagline { font-size: 1.1rem; color: var(--text-gray); max-width: 450px; }
.cursor { animation: blink 1s infinite; margin-left: 2px; }

/* Hero Visual */
.hero-visual { position: relative; display: flex; justify-content: flex-end; }
.image-wrapper { position: relative; }
.landing-image { width: 100%; max-width: 550px; height: auto; filter: drop-shadow(0 20px 50px rgba(0,0,0,0.5)); transition: transform 0.3s; }

/* --- NEW 1.5. MISSION STATEMENT SECTION --- */
.mission-statement-section {
    max-width: 900px;
    margin: 0 auto;
    padding: 60px 5%;
    text-align: center;
    border-radius: 20px;
    /* Glassmorphism style for contrast */
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    transform: translateY(20px); /* Lift it slightly */
}

.mission-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 15px;
    color: var(--accent-blue);
}

.mission-text {
    font-size: 1.25rem;
    color: var(--text-white);
    line-height: 1.6;
    max-width: 700px;
    margin: 0 auto;
}

/* --- 2. DYNAMIC STATS --- */
.stats-ticker {
  display: flex; justify-content: center; align-items: center;
  gap: 80px; padding: 40px 5%;
  background-color: var(--bg-darker);
  border-top: 1px solid rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.stat-box { text-align: center; }
.stat-number { display: block; font-size: 2.5rem; font-weight: 800; color: white; margin-bottom: 5px; }
.stat-label { color: var(--text-gray); text-transform: uppercase; letter-spacing: 1px; font-size: 0.85rem; }
.stat-divider { width: 1px; height: 50px; background: rgba(255,255,255,0.2); }


/* --- 3. FEATURE CARDS --- */
.features-section { padding: 100px 5%; max-width: 1300px; margin: 0 auto; text-align: center; }
.section-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 60px; }

.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
.feature-card {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  padding: 40px; border-radius: 20px; text-align: left; transition: transform 0.3s, background 0.3s;
}
.feature-card:hover { transform: translateY(-10px); background: rgba(255,255,255,0.08); }

.f-icon { width: 60px; height: 60px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 20px; color: white; }
.bg-green { background: var(--accent-green); }
.bg-blue { background: var(--accent-blue); }
.bg-orange { background: var(--accent-orange); }

.feature-card h3 { font-size: 1.5rem; margin-bottom: 10px; }
.feature-card p { color: var(--text-gray); line-height: 1.6; }

/* --- FOOTER --- */
.simple-footer { text-align: center; padding: 40px; color: #64748b; font-size: 0.9rem; border-top: 1px solid rgba(255,255,255,0.05); }

/* --- ANIMATIONS --- */
.floating { animation: float 6s ease-in-out infinite; }
@keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0); } }
@keyframes blink { 50% { opacity: 0; } }
@keyframes pulseGlow { 0% { opacity: 0.3; transform: scale(1); } 100% { opacity: 0.5; transform: scale(1.1); } }

.fade-in { opacity: 0; transform: translateY(20px); animation: fadeInUp 0.8s forwards; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
.delay-4 { animation-delay: 0.4s; }
.delay-5 { animation-delay: 0.5s; }
@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }


/* Responsive */
@media (max-width: 900px) {
  .hero-grid { grid-template-columns: 1fr; text-align: center; }
  .hero-text { order: 1; }
  .hero-visual { order: 0; justify-content: center; margin-bottom: 40px; }
  .main-title { font-size: 3rem; }
  .stats-ticker { flex-direction: column; gap: 30px; }
  .stat-divider { width: 50px; height: 1px; }
  .features-grid { grid-template-columns: 1fr; }
  .section-title { font-size: 2rem; }
  
  .mission-title { font-size: 1.8rem; }
  .mission-text { font-size: 1rem; }
}
</style>
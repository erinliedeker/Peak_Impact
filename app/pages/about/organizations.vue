<template>
    <div class="about-organizations-page">
      
      <section class="hero-section">
        <h1 class="main-title">
          Scale Your <span class="text-gradient">Impact.</span>
        </h1>
        <p class="hero-subtitle">
          Seamless volunteer management built for the non-profits, civic groups, and businesses driving change in Colorado Springs.
        </p>
      </section>

      <section class="overview-section">
        <div class="overview-card fade-in">
          <p class="mission-text">
            At <strong>Peak Impact</strong>, we understand the vital role that organizations play in driving positive change within our community. We are committed to supporting you by connecting you with <strong>dedicated, local volunteers</strong> who are eager to contribute their time and skills.
          </p>
        </div>
      </section>

      <section class="features-section">
        <h2 class="section-title">How We Empower Your Mission</h2>
        
        <div class="features-grid">
          
          <div class="feature-card fade-in delay-1">
            <div class="f-icon bg-blue"><Icon name="heroicons:sparkles" /></div>
            <h3>Targeted Discovery</h3>
            <p>Post opportunities directly to volunteers in specific neighborhoods or with specific skill sets right here in Colorado Springs.</p>
          </div>
          
          <div class="feature-card fade-in delay-2">
            <div class="f-icon bg-orange"><Icon name="heroicons:clipboard-document-check" /></div>
            <h3>Effortless Validation</h3>
            <p>Instantly track and verify volunteer hours using our in-app QR code check-in system. Say goodbye to manual timesheets.</p>
          </div>
          
          <div class="feature-card fade-in delay-3">
            <div class="f-icon bg-green"><Icon name="heroicons:presentation-chart-line" /></div>
            <h3>Impact Reporting</h3>
            <p>Generate clean, verified reports of volunteer contributions for grant applications, board meetings, and accountability documentation.</p>
          </div>

        </div>
      </section>

      <section class="cta-section">
        <p class="cta-text">Ready to find your next great volunteer?</p>
        <NuxtLink to="/signup" class="btn btn-primary cta-btn">Get Started for Free</NuxtLink>
      </section>

    </div>
</template>

<script setup>
  definePageMeta({
    layout: 'landing',
  });
</script>

<style scoped>
/* --- VARIABLES --- */
.about-organizations-page {
  --bg-dark: #1b273e;
  --bg-darker: #111827;
  --accent-orange: #f59e0b;
  --accent-green: #10b981;
  --accent-blue: #3b82f6;
  --text-white: #f8fafc;
  --text-gray: #94a3b8;
  
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  box-sizing: border-box;
  background-color: var(--bg-dark);
}

/* --- 1. HERO SECTION --- */
.hero-section {
  width: 100%;
  text-align: center;
  padding: 80px 5% 40px;
  max-width: 1200px;
}

.main-title {
  font-size: clamp(3rem, 7vw, 5rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 10px;
  color: var(--text-white);
}

.text-gradient {
  background: linear-gradient(90deg, var(--accent-green) 0%, var(--accent-blue) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-gray);
  max-width: 700px;
  margin: 0 auto;
}

/* --- 2. OVERVIEW/MISSION --- */
.overview-section {
  padding: 40px 5% 60px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.overview-card {
  max-width: 800px;
  padding: 30px;
  border-radius: 12px;
  /* Glassy look from home page */
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  text-align: center;
}

.mission-text {
  font-size: 1.3rem;
  line-height: 1.6;
  color: var(--text-white);
}

/* --- 3. FEATURE GRID SECTION --- */
.features-section {
  padding: 60px 5% 100px;
  max-width: 1300px;
  width: 100%;
  text-align: center;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 60px;
  color: var(--text-white);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.feature-card {
  background: var(--bg-darker);
  padding: 40px;
  border-radius: 16px;
  text-align: left;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid transparent;
}

.feature-card:hover { 
  transform: translateY(-5px); 
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4); 
  border-color: var(--accent-blue);
}

.f-icon { 
  width: 60px; height: 60px; 
  border-radius: 14px; 
  display: flex; align-items: center; 
  justify-content: center; 
  font-size: 1.8rem; 
  margin-bottom: 20px; 
  color: white; 
}
.bg-green { background: var(--accent-green); }
.bg-blue { background: var(--accent-blue); }
.bg-orange { background: var(--accent-orange); }

.feature-card h3 { 
  font-size: 1.5rem; 
  margin-bottom: 10px; 
  color: var(--text-white);
}
.feature-card p { 
  color: var(--text-gray); 
  line-height: 1.6; 
  font-size: 1rem;
}

/* --- 4. CTA SECTION --- */
.cta-section {
  width: 100%;
  background: var(--bg-darker);
  padding: 50px 5%;
  text-align: center;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.cta-text {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 25px;
  color: var(--text-white);
}
.cta-btn {
  /* Inherit shared button styles from layout, but override margin for centering */
  margin: 0 !important;
  font-size: 1.1rem;
  padding: 12px 30px;
}

/* --- ANIMATIONS (Simple fade-in) --- */
.fade-in { opacity: 0; transform: translateY(20px); animation: fadeInUp 0.8s forwards; }
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }

/* --- Responsive Adjustments --- */
@media (max-width: 900px) {
  .hero-section { padding-top: 50px; }
  .main-title { font-size: 2.5rem; }
  .hero-subtitle { font-size: 1rem; }
  .mission-text { font-size: 1.1rem; }
  .section-title { font-size: 2rem; }
  .features-grid { grid-template-columns: 1fr; }
  .feature-card { text-align: center; }
  .f-icon { margin: 0 auto 20px; }
  .cta-text { font-size: 1.5rem; }
}
</style>
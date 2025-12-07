<template>
    <div class="about-teams-page">
      
      <section class="hero-section">
        <h1 class="main-title">
          Volunteer as a <span class="text-gradient">Team.</span>
        </h1>
        <p class="hero-subtitle">
          Organize, motivate, and track your group's collective impact in Colorado Springs—perfect for schools, neighborhood groups, and Greek life.
        </p>
      </section>

      <section class="overview-section">
        <div class="overview-card fade-in">
          <p class="mission-text">
            <strong>Peak Impact</strong> provides the ultimate toolset for any organized group looking to make a difference. We simplify everything from event sign-ups to <strong>collective hour logging</strong>, allowing team leaders to effortlessly manage contributions and motivate members toward shared civic goals.
          </p>
        </div>
      </section>

      <section class="features-section">
        <h2 class="section-title">Teamwork, Turbocharged</h2>
        
        <div class="features-grid">
          
          <div class="feature-card fade-in delay-1">
            <div class="f-icon bg-purple"><Icon name="heroicons:user-group" /></div>
            <h3>Group Roster Management</h3>
            <p>Invite and manage your members with a unique team code. View real-time individual and group contribution metrics in one dashboard.</p>
          </div>
          
          <div class="feature-card fade-in delay-2">
            <div class="f-icon bg-green"><Icon name="heroicons:star" /></div>
            <h3>Gamified Competition</h3>
            <p>Run internal leaderboards for friendly competition or compete against other teams across the city for bragging rights and recognition.</p>
          </div>
          
          <div class="feature-card fade-in delay-3">
            <div class="f-icon bg-blue"><Icon name="heroicons:flag" /></div>
            <h3>Shared Goal Tracking</h3>
            <p>Set specific volunteer hour goals (e.g., 500 hours this semester) and track your team's progress collectively and visually.</p>
          </div>

        </div>
      </section>

      <section class="cta-section">
        <p class="cta-text">Unleash your group's collective power.</p>
        <NuxtLink to="/signup" class="btn btn-primary cta-btn">Create Your Team Account</NuxtLink>
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
.about-teams-page {
  --bg-dark: #1b273e;
  --bg-darker: #111827;
  --accent-orange: #f59e0b;
  --accent-green: #10b981;
  --accent-blue: #3b82f6;
  --accent-purple: #a855f7; /* New accent for Teams/Groups */
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
  /* Using Purple/Pink gradient for team focus */
  background: linear-gradient(90deg, var(--accent-blue) 0%, var(--accent-purple));
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

/* --- 2. OVERVIEW/VALUE --- */
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
  /* Hover accent using the team color (Purple) */
  border-color: var(--accent-purple);
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
.bg-purple { background: var(--accent-purple); } /* New background class */
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
  font-size: 1.1rem;
  padding: 12px 30px;
}

/* --- ANIMATIONS --- */
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
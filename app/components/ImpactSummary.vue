<template>
  <div class="impact-container">
    <h3 class="section-title">Your Impact</h3>
    
    <div class="stats-grid">
      <div class="stat-box">
        <span class="stat-val">{{ impactStore.impactPoints }}</span>
        <span class="stat-label">Impact Points</span>
      </div>
      <div class="stat-box">
        <span class="stat-val">{{ impactStore.totalHours }}</span>
        <span class="stat-label">Volunteer Hours</span>
      </div>
      <div class="stat-box">
        <span class="stat-val">#{{ impactStore.neighborhoodRank }}</span>
        <span class="stat-label">Neighborhood Rank</span>
      </div>
    </div>

    <h4 class="subsection-title">Earned Badges</h4>
    <div class="badges-row">
      <div class="badge-item" v-for="badge in impactStore.earnedBadges" :key="badge">
        <div class="badge-icon">🏆</div>
        <span class="badge-name">{{ badge }}</span>
      </div>
      
      <div class="badge-item locked">
        <div class="badge-icon">🔒</div>
        <span class="badge-name">Next: 50 Hours</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useImpactStore } from '../stores/impact';
const impactStore = useImpactStore();

// Ensure data is loaded
onMounted(() => {
  impactStore.fetchUserImpact();
});
</script>

<style scoped>
.impact-container {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 2rem;
}

.section-title {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: var(--color-text-main);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-box {
  background: var(--color-bg);
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
}

.stat-val {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-accent); /* Orange for numbers */
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-sub);
  text-transform: uppercase;
}

.subsection-title {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--color-text-main);
}

.badges-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 80px;
}

.badge-icon {
  width: 50px;
  height: 50px;
  background: #FEFCBF; /* Light Yellow */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 2px solid var(--color-accent);
}

.badge-name {
  font-size: 0.75rem;
  text-align: center;
  line-height: 1.2;
  color: var(--color-text-sub);
}

.badge-item.locked .badge-icon {
  background: var(--color-bg);
  border-color: var(--color-border);
  opacity: 0.5;
}
</style>
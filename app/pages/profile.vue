<template>
  <div class="profile-page">
    
    <div class="profile-grid">
      <div class="col-left">
        <UserProfileCard />
        
        <div class="settings-card">
          <h3>Settings</h3>
          <ul class="settings-list">
            <li>Notifications</li>
            <li>Password & Security</li>
            <li>Privacy</li>
            <li class="danger">Delete Account</li>
          </ul>
        </div>
      </div>

      <div class="col-right">
        <ImpactSummary />
        
        <div class="history-section">
          <h3>Recent Activity</h3>
          <div class="activity-list">
            <div class="activity-item">
              <span class="date">Oct 12</span>
              <div class="activity-content">
                <strong>Memorial Park Cleanup</strong>
                <p>Checked out. +4 Hours verified.</p>
              </div>
              <span class="points">+40 pts</span>
            </div>
            <div class="activity-item">
              <span class="date">Oct 05</span>
              <div class="activity-content">
                <strong>Followed "Keep COS Beautiful"</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-grid {
  display: grid;
  grid-template-columns: 350px 1fr; /* Fixed width sidebar, fluid content */
  gap: 2rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

.col-left, .col-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-card, .history-section {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 1.5rem;
}

.settings-list {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
}

.settings-list li {
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-main);
  cursor: pointer;
}

.settings-list li:last-child {
  border-bottom: none;
}

.settings-list li.danger {
  color: #E53E3E;
}

/* Activity List Styling */
.activity-item {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
}

.date {
  font-size: 0.85rem;
  color: var(--color-text-sub);
  width: 60px;
  font-weight: 600;
}

.activity-content {
  flex-grow: 1;
}

.activity-content strong {
  display: block;
  color: var(--color-text-main);
}

.activity-content p {
  font-size: 0.85rem;
  color: var(--color-secondary); /* Green text for success */
  margin: 0;
}

.points {
  font-weight: 800;
  color: var(--color-accent);
}
</style>
<template>
  <div class="network-container">
    
    <div class="main-feed">
      
      <div class="feed-header">
        <h1>Network</h1>
        
        <div class="tabs">
          <button 
            :class="{ active: activeTab === 'friends' }" 
            @click="activeTab = 'friends'">
            Friends
          </button>
          <button 
            :class="{ active: activeTab === 'groups' }" 
            @click="activeTab = 'groups'">
            Neighborhoods & Groups
          </button>
        </div>

        <div class="search-box">
          <Icon name="heroicons:magnifying-glass" size="1.2rem" class="text-gray-400" />
          <input 
            type="text" 
            :placeholder="activeTab === 'friends' ? 'Search your friends...' : 'Find a neighborhood or group...'" 
            v-model="searchQuery" 
          />
        </div>
      </div>

      <div v-if="activeTab === 'friends'" class="content-view">
        
        <div class="section-container" v-if="requests.length">
          <div class="section-header">
            <h3>Friend Requests <span class="counter-badge">{{ requests.length }}</span></h3>
          </div>
          
          <div class="requests-list">
            <div v-for="req in requests" :key="req.id" class="request-card">
              <div class="req-left">
                <div class="avatar-md">{{ req.initials }}</div>
                <div class="req-info">
                  <span class="req-name">{{ req.name }}</span>
                  <div class="req-meta">
                    <span>{{ req.mutual }} mutual friends</span> • 
                    <span class="impact-score">
                      <Icon name="heroicons:bolt-solid" size="0.9rem" /> {{ req.impact }} Impact
                    </span>
                  </div>
                </div>
              </div>
              <div class="req-actions">
                <button class="btn-icon check" title="Accept"><Icon name="heroicons:check" size="1.2rem" /></button>
                <button class="btn-icon close" title="Ignore"><Icon name="heroicons:x-mark" size="1.2rem" /></button>
              </div>
            </div>
          </div>
        </div>

        <div class="section-container" v-if="socialEvents.length">
          <div class="section-header">
            <h3>
              <Icon name="heroicons:calendar-days-solid" size="1.2rem" class="header-icon" /> 
              Friends are going to...
            </h3>
          </div>

          <div class="event-list">
            <NuxtLink 
              v-for="event in socialEvents" 
              :key="event.id" 
              :to="`/events/${event.id}`" 
              class="social-event-card"
            >
              <div class="date-badge">
                <span class="month">{{ event.month }}</span>
                <span class="day">{{ event.day }}</span>
              </div>
              
              <div class="event-details">
                <h4>{{ event.title }}</h4>
                <div class="attendee-row">
                  <div class="facepile">
                    <div 
                      v-for="(f, i) in event.friendsGoing" 
                      :key="i" 
                      class="tiny-avatar" 
                      :style="{ zIndex: 10 - i }"
                    >
                      {{ f }}
                    </div>
                  </div>
                  <span class="plus-text">+{{ event.totalGoing - event.friendsGoing.length }} others</span>
                </div>
              </div>

              <div class="card-arrow">
                <Icon name="heroicons:chevron-right" size="1.2rem" />
              </div>
            </NuxtLink>
          </div>
        </div>

        <div class="friends-grid">
          <div v-for="friend in filteredFriends" :key="friend.id" class="friend-card">
            <div class="card-header-bg"></div>
            <div class="card-content">
              <div class="avatar-lg">{{ friend.initials }}</div>
              <h3>{{ friend.name }}</h3>
              
              <div class="streak-pill" v-if="friend.streak > 0">
                <Icon name="heroicons:fire-solid" size="0.9rem" /> {{ friend.streak }} Week Streak
              </div>
              
              <div class="badge-row">
                <Icon 
                  v-for="badge in friend.badges" 
                  :key="badge" 
                  name="heroicons:trophy-solid" 
                  class="mini-badge-icon" 
                  :title="badge" 
                />
              </div>

              <NuxtLink :to="`/volunteers/${friend.id}`" class="btn-profile">
                View Profile
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'groups'" class="content-view">
        <div class="groups-grid">
          <NuxtLink 
            v-for="group in filteredGroups" 
            :key="group.id" 
            :to="`/groups/${group.id}`"
            class="group-card"
          >
            <div class="group-banner" :style="{ backgroundColor: group.color }"></div>
            <div class="group-info-block">
              <div class="group-icon">{{ group.initials }}</div>
              <div class="group-text">
                <h2>{{ group.name }}</h2>
                <p>{{ group.memberCount }} Neighbors · {{ group.activeEvents }} Active Events</p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

    </div>


    <aside class="side-widgets">
      
      <div class="widget">
				<div class="widget-header">
					<h3>
						<Icon name="heroicons:sparkles-solid" size="1.1rem" class="text-orange" /> 
						Recent Activity
					</h3>
				</div>
        <div class="activity-list">
          <div v-for="act in activities" :key="act.id" class="activity-item">
            <div class="avatar-xs">{{ act.initials }}</div>
            <div class="act-content">
              <p>
                <span class="name">{{ act.name }}</span> 
                {{ act.action }} 
                <NuxtLink :to="act.link" class="act-link">{{ act.target }}</NuxtLink>
              </p>
              <span class="time">{{ act.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="widget">
        <div class="widget-header">
          <h3>
            <Icon name="heroicons:chart-bar-solid" size="1.1rem" class="text-orange" />
            Your Circle
          </h3>
          <span class="label">Weekly</span>
        </div>
        <div class="leader-list">
          <div v-for="(friend, index) in sortedFriends" :key="friend.id" class="leader-row">
            <span class="rank" :class="{ 'top-rank': index < 3 }">
              <Icon v-if="index === 0" name="heroicons:trophy-solid" size="1rem" class="text-orange" />
              <span v-else>{{ index + 1 }}</span>
            </span>
            <div class="avatar-xs">{{ friend.initials }}</div>
            <div class="leader-name">{{ friend.name }}</div>
            <div class="leader-pts">{{ friend.points }}</div>
          </div>
        </div>
      </div>

      <div class="widget invite-widget">
				<div class="widget-header">
					<h3>
						<Icon name="heroicons:envelope-solid" size="1.1rem" class="text-orange" /> 
						Invite Friends
					</h3>
				</div>
        <p>Grow your impact circle.</p>
        <div class="invite-form">
          <input type="email" placeholder="name@email.com" />
          <button><Icon name="heroicons:paper-airplane-solid" size="1rem" /></button>
        </div>
      </div>

    </aside>

  </div>
</template>

<script setup>
const activeTab = ref('friends');
const searchQuery = ref('');

// --- Mock Data ---

const requests = ref([
  { id: 99, name: 'Alex Chen', initials: 'AC', mutual: 4, impact: 850 }
]);

const friends = ref([
  { id: 1, name: 'Sarah Jenkins', initials: 'SJ', streak: 12, points: 1250, badges: ['Cleaner'] },
  { id: 2, name: 'Mike Ross', initials: 'MR', streak: 0, points: 450, badges: [] },
  { id: 3, name: 'Jessica Pearson', initials: 'JP', streak: 45, points: 3400, badges: ['Legend', 'Sponsor'] },
]);

const groups = ref([
  { id: 101, name: 'Downtown District', initials: 'DD', memberCount: 342, activeEvents: 3, color: '#3b82f6' },
  { id: 102, name: 'Westside Gardeners', initials: 'WG', memberCount: 120, activeEvents: 1, color: '#10b981' },
]);

const activities = ref([
  { id: 1, name: 'Sarah', initials: 'SJ', action: 'joined', target: 'Downtown District', link: '/groups/101', time: '2h ago' },
  { id: 2, name: 'Mike', initials: 'MR', action: 'is going to', target: 'River Cleanup', link: '/events/202', time: '5h ago' },
  { id: 3, name: 'Jessica', initials: 'JP', action: 'earned', target: 'Super Star Badge', link: '/volunteers/3', time: '1d ago' },
]);

const socialEvents = ref([
  { 
    id: 101, 
    title: 'Saturday Creek Cleanup', 
    month: 'OCT', 
    day: '12', 
    friendsGoing: ['SJ', 'MR', 'JP'], 
    totalGoing: 45 
  }
]);

// --- Computed ---
const filteredFriends = computed(() => friends.value.filter(f => f.name.toLowerCase().includes(searchQuery.value.toLowerCase())));
const filteredGroups = computed(() => groups.value.filter(g => g.name.toLowerCase().includes(searchQuery.value.toLowerCase())));
const sortedFriends = computed(() => [...friends.value].sort((a, b) => b.points - a.points));
</script>

<style scoped>

/* --- UTILITIES & LAYOUT --- */
.network-container {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
}

.text-orange { color: var(--color-accent); }
.text-gray-400 { color: #9ca3af; }

.section-container { margin-bottom: 2rem; }
.section-header h3 { 
  font-size: 1.1rem; font-weight: 700; color: var(--color-text-main); margin-bottom: 1rem; 
  display: flex; align-items: center; gap: 8px; 
}
.header-icon { color: var(--color-text-sub); }

.counter-badge {
  background: var(--color-accent); /* Orange Badge */
  color: white; font-size: 0.75rem; padding: 2px 8px; border-radius: 12px;
}

/* --- HEADER & TABS --- */
.feed-header { margin-bottom: 2rem; }
.tabs { display: flex; gap: 2rem; margin: 1.5rem 0; border-bottom: 1px solid var(--color-border); }
.tabs button {
  background: none; border: none; padding: 1rem 0; font-size: 1rem; font-weight: 600; color: var(--color-text-sub); cursor: pointer; border-bottom: 2px solid transparent; transition: 0.2s;
}
.tabs button.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
.search-box { display: flex; align-items: center; background: white; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--color-border); gap: 0.5rem; }
.search-box input { border: none; outline: none; width: 100%; font-size: 0.95rem; }

/* --- FRIEND REQUESTS --- */
.requests-list { display: flex; flex-direction: column; gap: 0.75rem; }
.request-card {
  display: flex; justify-content: space-between; align-items: center;
  background: white; border: 1px solid var(--color-border); padding: 1rem; border-radius: 10px;
}
.req-left { display: flex; gap: 1rem; align-items: center; }
.req-name { font-weight: 700; color: var(--color-text-main); display: block; }
.req-meta { font-size: 0.85rem; color: var(--color-text-sub); display: flex; align-items: center; gap: 0.5rem; }
.impact-score { color: var(--color-accent); font-weight: 600; display: flex; align-items: center; gap: 4px; }
.req-actions { display: flex; gap: 0.5rem; }
.btn-icon { width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.btn-icon.check { background: #e6fffa; color: #2c7a7b; }
.btn-icon.close { background: #fff5f5; color: #c53030; }
.btn-icon:hover { transform: scale(1.1); }

/* --- SOCIAL EVENTS CARD --- */
.event-list { display: flex; flex-direction: column; gap: 0.75rem; }
.social-event-card {
  display: flex; align-items: center; gap: 1.5rem;
  background: white; border: 1px solid var(--color-border); padding: 1rem; border-radius: 12px;
  text-decoration: none; color: inherit; transition: border-color 0.2s, transform 0.2s;
}
.social-event-card:hover { border-color: var(--color-primary); transform: translateX(4px); }

.date-badge {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: var(--color-bg); padding: 0.5rem; border-radius: 8px; min-width: 60px;
}
.date-badge .month { font-size: 0.7rem; text-transform: uppercase; font-weight: 700; color: var(--color-text-sub); }
.date-badge .day { font-size: 1.4rem; font-weight: 800; color: var(--color-text-main); line-height: 1; }

.event-details h4 { margin: 0 0 0.5rem 0; font-size: 1.05rem; }
.attendee-row { display: flex; align-items: center; gap: 0.75rem; }
.facepile { display: flex; }
.tiny-avatar {
  width: 24px; height: 24px; border-radius: 50%; background: #ddd; border: 2px solid white;
  font-size: 0.6rem; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-left: -8px;
}
.tiny-avatar:first-child { margin-left: 0; }
.plus-text { font-size: 0.8rem; color: var(--color-text-sub); }
.card-arrow { margin-left: auto; color: var(--color-text-sub); }

/* --- FRIENDS GRID --- */
.friends-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.5rem; }
.friend-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  text-align: center;
  
  /* NEW: Flex column ensures the card stretches and aligns contents */
  display: flex;
  flex-direction: column;
  height: 100%; 
}
.card-header-bg { height: 50px; background: linear-gradient(to right, #e2e8f0, #f7fafc); }
.card-content {
  padding: 0 1rem 1.5rem 1rem;
  margin-top: -30px;
  display: flex;
  flex-direction: column;
  flex: 1; 
}
.avatar-lg {
  width: 64px; height: 64px; border-radius: 50%; background: var(--color-primary); color: white;
  border: 4px solid white; margin: 0 auto 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700;
}
.friend-card h3 { font-size: 1rem; margin-bottom: 0.25rem; }

.streak-pill { 
  font-size: 0.75rem; background: #fff7ed; color: var(--color-accent); /* Orange background/text */
  padding: 4px 10px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;
  font-weight: 700; margin-bottom: 0.75rem; border: 1px solid #ffedd5;
}

.badge-row {
  display: flex;
  justify-content: center;
  gap: 4px;
  min-height: 24px; 
  margin-bottom: 1rem;
}
.mini-badge-icon { color: #d69e2e; width: 20px; height: 20px; }

.btn-profile {
  margin-top: auto; 
  
  display: block;
  width: 100%;
  
  box-sizing: border-box; 
  
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.85rem;
  color: var(--color-text-main);
  font-weight: 600;
  transition: 0.2s;
}
.btn-profile:hover { background: var(--color-bg); }

/* --- GROUPS --- */
.groups-grid { display: grid; gap: 1rem; }
.group-card {
  display: flex; flex-direction: column; background: white; border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden; text-decoration: none; color: inherit;
}
.group-banner { height: 8px; width: 100%; }
.group-info-block { padding: 1.25rem; display: flex; gap: 1rem; align-items: center; }
.group-icon { width: 48px; height: 48px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; color: #555; }
.group-text h2 { margin: 0; font-size: 1.1rem; }
.group-text p { margin: 4px 0 0 0; color: var(--color-text-sub); font-size: 0.85rem; }

/* --- SIDEBAR WIDGETS --- */
.widget { background: white; border: 1px solid var(--color-border); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem; }
.widget h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; }

/* Activity */
.activity-list { display: flex; flex-direction: column; gap: 1rem; }
.activity-item { display: flex; gap: 0.75rem; font-size: 0.9rem; }
.act-content p { margin: 0; line-height: 1.4; color: var(--color-text-sub); }
.act-content .name { font-weight: 600; color: var(--color-text-main); }
.act-link { color: var(--color-primary); text-decoration: none; font-weight: 500; }
.act-link:hover { text-decoration: underline; }
.act-content .time { font-size: 0.75rem; color: #999; display: block; margin-top: 2px; }

/* Leaderboard */
.widget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.widget-header h3 { margin: 0; display: flex; align-items: center; gap: 8px;}
.widget-header .label { font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
.leader-list { display: flex; flex-direction: column; gap: 0.5rem; }
.leader-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid #f7f7f7; }
.leader-row:last-child { border-bottom: none; }
.rank { font-weight: 600; color: #aaa; width: 24px; text-align: center; display: flex; justify-content: center; }
.rank.top-rank { color: #d69e2e; }
.leader-name { flex: 1; font-weight: 600; font-size: 0.9rem; }
.leader-pts { font-weight: 700; color: var(--color-primary); font-size: 0.9rem; }

/* Invite */
.invite-form { display: flex; gap: 0.5rem; margin-top: 1rem; }
.invite-form input { flex: 1; border: 1px solid var(--color-border); padding: 8px; border-radius: 6px; font-size: 0.9rem; outline: none; }
.invite-form button { 
  background: var(--color-text-main); color: white; border: none; padding: 0 12px; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center;
}

/* Avatars */
.avatar-xs { width: 32px; height: 32px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; }
.avatar-md { width: 42px; height: 42px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: bold; }

/* Responsive */
@media (max-width: 900px) {
  .network-container { grid-template-columns: 1fr; }
  .side-widgets { order: -1; }
}
</style>
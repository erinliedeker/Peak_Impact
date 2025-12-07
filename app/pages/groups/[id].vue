<template>
  <div class="page-container">
    
    <div v-if="isLoading" class="state-screen">
      <Icon name="heroicons:arrow-path" class="spinner" size="32" />
      <p>Loading group basecamp...</p>
    </div>

    <div v-else-if="error || !groupData" class="state-screen">
      <Icon name="heroicons:user-group-slash" size="48" class="text-muted" />
      <h3>Group Not Found</h3>
      <button class="btn btn-secondary icon-btn" @click="$router.go(-1)">
        <Icon name="heroicons:arrow-left" /> Go Back
      </button>
    </div>

    <div v-else class="group-content">
      
      <header class="group-hero" :style="{ backgroundImage: `url(${groupData.bannerUrl})` }">
        <div class="hero-overlay">
          <div class="hero-content">
            <div class="group-identity">
              <div class="group-icon-lg" :style="{ backgroundColor: groupData.themeColor }">
                {{ groupData.initials }}
              </div>
              <div>
                 <h1 class="group-title">{{ groupData.name }}</h1>
                 <p class="group-subtitle">
                   <Icon name="heroicons:map-pin-solid" class="icon-xs" /> {{ groupData.location }}
                 </p>
              </div>
            </div>

            <div class="hero-actions">
               <button 
                 @click="toggleMembership" 
                 class="btn btn-large icon-btn"
                 :class="isMember ? 'btn-secondary glass-btn' : 'btn-primary shadow-btn'"
               >
                 <Icon :name="isMember ? 'heroicons:check-circle-solid' : 'heroicons:plus-circle-solid'" size="1.2rem" />
                 {{ isMember ? 'Joined' : 'Join Group' }}
               </button>
            </div>
          </div>
        </div>
      </header>

      <section class="stats-bar">
        <div class="stat-item">
          <Icon name="heroicons:clock-solid" class="stat-icon text-blue" />
          <div>
            <span class="stat-val">{{ groupData.stats.totalHours.toLocaleString() }}</span>
            <span class="stat-lbl">Total Volunteer Hours</span>
          </div>
        </div>
        <div class="stat-item">
          <Icon name="heroicons:calendar-days-solid" class="stat-icon text-orange" />
          <div>
            <span class="stat-val">{{ groupData.stats.eventsCompleted }}</span>
            <span class="stat-lbl">Events Completed</span>
          </div>
        </div>
         <div class="stat-item">
          <Icon name="heroicons:users-solid" class="stat-icon text-green" />
          <div>
            <span class="stat-val">{{ groupData.members.length }}</span>
            <span class="stat-lbl">Active Neighbors</span>
          </div>
        </div>
      </section>

      <div class="layout-grid">
        
        <div class="left-col">
          
          <section class="content-card about-card">
            <h3>About Us</h3>
            <p>{{ groupData.description }}</p>
            <div class="meta-tags">
              <span v-for="tag in groupData.tags" :key="tag" class="meta-tag">#{{ tag }}</span>
            </div>
          </section>

          <section class="content-card goal-card">
            <h3>
               <Icon name="heroicons:trophy-solid" class="text-accent" /> 
               This Month's Goal
            </h3>
            <p class="goal-text">Reach 500 collective volunteer hours.</p>
            <div class="progress-container">
               <div class="progress-bar">
                  <div class="progress-fill" style="width: 65%"></div>
               </div>
               <div class="progress-labels">
                  <span>325 hrs done</span>
                  <span>65%</span>
               </div>
            </div>
          </section>

          <section class="content-card members-card">
            <div class="card-header-row">
               <h3>{{ groupData.members.length }} Members</h3>
               <NuxtLink to="#" class="view-all-link">View all</NuxtLink>
            </div>
            
            <div class="facepile-row">
               <NuxtLink 
                  v-for="(member, index) in groupData.members.slice(0, 6)" 
                  :key="member.id"
                  :to="`/volunteers/${member.id}`"
                  class="facepile-avatar"
                  :style="{ zIndex: 10 - index, backgroundImage: `url(${member.avatarUrl})` }"
                  :title="member.name"
               >
               </NuxtLink>
               <div v-if="groupData.members.length > 6" class="facepile-remainder">
                  +{{ groupData.members.length - 6 }}
               </div>
            </div>
          </section>

        </div>

        <div class="right-col">
          
          <section class="content-card events-card highlight-border">
             <h3>
                <Icon name="heroicons:calendar-solid" class="text-primary" />
                Upcoming Group Events
             </h3>
             
             <div v-if="groupData.upcomingEvents.length === 0" class="empty-state-sm">
                <p>No upcoming events scheduled.</p>
             </div>

             <div class="event-list">
                <NuxtLink 
                   v-for="event in groupData.upcomingEvents" 
                   :key="event.id" 
                   :to="`/events/${event.id}`" 
                   class="mini-event-card"
                >
                   <div class="date-box">
                      <span class="month">{{ formatDate(event.date).month }}</span>
                      <span class="day">{{ formatDate(event.date).day }}</span>
                   </div>
                   <div class="event-info">
                      <h4>{{ event.title }}</h4>
                      <span class="event-meta">
                         <Icon name="heroicons:map-pin" class="icon-xs" /> {{ event.location }} • {{ event.goingCount }} going
                      </span>
                   </div>
                   <Icon name="heroicons:chevron-right" class="arrow-icon" />
                </NuxtLink>
             </div>
          </section>

          <section>
             <h3 class="feed-heading">Group Activity Feed</h3>
             <div class="feed-list">
                <article v-for="post in groupData.activityFeed" :key="post.id" class="content-card feed-card">
                   <div class="feed-header">
                      <img :src="post.authorAvatar" class="avatar-sm" />
                      <div class="feed-meta">
                         <strong>{{ post.authorName }}</strong>
                         <span class="text-muted">Is feeling {{ post.mood }} • {{ post.timeAgo }}</span>
                      </div>
                   </div>
                   <p class="feed-body">{{ post.content }}</p>
                   <div v-if="post.image" class="feed-image">
                      <img :src="post.image" />
                   </div>
                   <div class="feed-actions">
                      <button class="action-btn">
                        <Icon name="heroicons:hand-thumb-up" /> Like ({{ post.likes }})
                      </button>
                   </div>
                </article>
             </div>
          </section>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
// Add imports for Firestore getDoc similar to the volunteer profile if connecting to real DB

const route = useRoute();
const groupId = route.params.id as string;

const isLoading = ref(true);
const error = ref<string | null>(null);
const groupData = ref<any>(null); // Replace 'any' with a proper Group Interface later
const isMember = ref(false); // Track if current user is a member

// --- MOCK DATA GENERATOR ---
// In reality, fetch this from firestore based on groupId
const generateMockGroup = (id: string) => {
    const isDowntown = id === '101';
    return {
        id: id,
        name: isDowntown ? 'Downtown District Cleanup Crew' : 'Westside Community Gardeners',
        initials: isDowntown ? 'DD' : 'WG',
        location: isDowntown ? 'Downtown Metro Area' : 'Westside Neighborhood',
        description: 'We are a dedicated group of neighbors committed to keeping our shared spaces clean, safe, and vibrant. We organize monthly cleanups and social gatherings.',
        bannerUrl: isDowntown 
            ? 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80' 
            : 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
        themeColor: isDowntown ? '#3b82f6' : '#10b981',
        tags: ['Environment', 'Community', 'Social'],
        stats: {
            totalHours: isDowntown ? 4520 : 2100,
            eventsCompleted: isDowntown ? 54 : 28,
        },
        members: Array.from({ length: isDowntown ? 342 : 120 }, (_, i) => ({
            id: `mem_${i}`,
            name: `Member ${i}`,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=member${i}_${id}`
        })),
        upcomingEvents: [
            { id: 'e1', title: 'Big Spring Cleanup', date: '2023-11-15', location: 'Central Park', goingCount: 45 },
            { id: 'e2', title: 'Monthly Planning Meeting', date: '2023-11-28', location: 'Community Center', goingCount: 12 }
        ],
        activityFeed: [
            { 
                id: 'p1', authorName: 'Sarah Jenkins', authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SJ',
                timeAgo: '2h ago', mood: 'energized ⚡️',
                content: 'Awesome turnout for the impromptu litter pick today! We cleared 15 bags in just an hour.',
                image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
                likes: 24
            },
             { 
                id: 'p2', authorName: 'Group Automated Bot', authorAvatar: '',
                timeAgo: '1d ago', mood: 'proud 🏆',
                content: '🎉 Milestone Reached! The group has collectively passed 4,500 volunteer hours. Keep up the amazing work!',
                likes: 56
            }
        ]
    };
};

onMounted(async () => {
    // Simulate API call
    setTimeout(() => {
        groupData.value = generateMockGroup(groupId);
        isLoading.value = false;
        // Check if current user is in groupData.members array to set isMember.value
    }, 800);
});

function toggleMembership() {
    isMember.value = !isMember.value;
    // TODO: API Call to add/remove user from group members subcollection
    if(isMember.value) alert(`Welcome to ${groupData.value.name}!`);
}

// Helpers
function formatDate(dateString: string) {
  const d = new Date(dateString);
  return {
    month: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
    day: d.getDate()
  };
}
</script>

<style scoped>
/* --- Utilities --- */
.page-container {
  max-width: 1100px;
  margin: 0 auto;
  padding-bottom: 60px;
  color: var(--color-text-main);
}
.state-screen { text-align: center; padding: 80px 20px; color: var(--color-text-muted); }
.spinner { animation: spin 1s linear infinite; color: var(--color-primary); }
.text-muted { color: var(--color-text-muted); }
.text-primary { color: var(--color-primary); }
.text-accent { color: var(--color-accent); }
.text-blue { color: #3b82f6; } .text-orange { color: #f59e0b; } .text-green { color: #10b981; }
.icon-btn { display: inline-flex; align-items: center; gap: 8px; }
.icon-xs { width: 1em; height: 1em; vertical-align: text-bottom; }


/* --- 1. HERO BANNER --- */
.group-hero {
    height: 300px;
    background-size: cover;
    background-position: center;
    position: relative;
    border-radius: 0 0 20px 20px; /* Rounded corners only at bottom for modern look */
    overflow: hidden;
}
.hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.8) 10%, rgba(0,0,0,0.2));
    display: flex; align-items: flex-end;
    padding: 30px;
}
.hero-content {
    width: 100%; max-width: 1000px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 20px;
}
.group-identity { display: flex; align-items: center; gap: 20px; color: white; }
.group-icon-lg {
    width: 80px; height: 80px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; font-weight: 800; color: white;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2); border: 3px solid rgba(255,255,255,0.8);
}
.group-title { margin: 0; font-size: 2.2rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3); line-height: 1.1; }
.group-subtitle { margin: 5px 0 0; opacity: 0.9; display: flex; align-items: center; gap: 6px; }

.btn-large { padding: 12px 24px; font-size: 1.1rem; font-weight: 700; border-radius: 12px; border: none; cursor: pointer; transition: all 0.2s; }
.shadow-btn { box-shadow: 0 4px 15px rgba(var(--color-primary-rgb), 0.4); }
.shadow-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(var(--color-primary-rgb), 0.6); }
.glass-btn { background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); color: white; border: 1px solid rgba(255,255,255,0.4); }
.glass-btn:hover { background: rgba(255,255,255,0.3); }


/* --- 2. STATS BAR --- */
.stats-bar {
    display: flex; justify-content: space-around;
    background: white; padding: 20px;
    border-radius: 16px;
    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
    margin: -30px 20px 30px 20px; /* Overlap banner slightly */
    position: relative; z-index: 10;
    border: 1px solid var(--color-border);
}
.stat-item { display: flex; align-items: center; gap: 15px; }
.stat-icon { width: 42px; height: 42px; padding: 8px; background: var(--color-bg-light); border-radius: 12px; }
.stat-val { display: block; font-size: 1.5rem; font-weight: 800; color: var(--color-text-main); line-height: 1; }
.stat-lbl { font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600; }


/* --- 3. MAIN GRID & CARDS --- */
.layout-grid { display: grid; grid-template-columns: 340px 1fr; gap: 30px; padding: 0 20px; }
.content-card { background: white; border-radius: 12px; border: 1px solid var(--color-border); padding: 24px; margin-bottom: 24px; }
.content-card h3 { margin: 0 0 16px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px; }

/* Left Col Components */
.about-card p { color: var(--color-text-sub); line-height: 1.5; margin-bottom: 15px; }
.meta-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.meta-tag { background: var(--color-bg-light); color: var(--color-text-muted); padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: 500; }

.goal-text { margin-bottom: 10px; font-weight: 500; }
.progress-container { background: var(--color-bg-light); height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 8px; }
.progress-fill { height: 100%; background: linear-gradient(to right, var(--color-accent), #fcd34d); }
.progress-labels { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--color-text-muted); font-weight: 600; }

.card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.card-header-row h3 { margin-bottom: 0; }
.view-all-link { font-size: 0.9rem; color: var(--color-primary); text-decoration: none; font-weight: 600; }
.facepile-row { display: flex; padding-left: 10px; }
.facepile-avatar {
    width: 48px; height: 48px; border-radius: 50%;
    background-size: cover; border: 3px solid white;
    margin-left: -12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    transition: transform 0.2s;
}
.facepile-avatar:hover { transform: translateY(-4px); z-index: 20 !important; }
.facepile-remainder {
    width: 48px; height: 48px; border-radius: 50%;
    background: var(--color-bg-light); border: 3px solid white;
    margin-left: -12px; display: flex; align-items: center; justify-content: center;
    font-weight: 700; color: var(--color-text-muted); font-size: 0.9rem;
}


/* Right Col Components */
.highlight-border { border-top: 4px solid var(--color-primary); }
.empty-state-sm { text-align: center; padding: 20px; color: var(--color-text-muted); font-style: italic; }
.event-list { display: flex; flex-direction: column; gap: 12px; }
.mini-event-card {
    display: flex; align-items: center; gap: 15px; text-decoration: none; color: inherit;
    padding: 10px; border-radius: 8px; transition: background 0.2s; border: 1px solid transparent;
}
.mini-event-card:hover { background: var(--color-bg-light); border-color: var(--color-border); }
.date-box {
    background: var(--color-bg-light); border: 1px solid var(--color-border);
    padding: 6px 12px; border-radius: 8px; text-align: center; min-width: 55px;
}
.date-box .month { display: block; font-size: 0.75rem; font-weight: 700; color: var(--color-primary); }
.date-box .day { display: block; font-size: 1.3rem; font-weight: 800; line-height: 1; }
.event-info h4 { margin: 0 0 4px 0; }
.event-meta { font-size: 0.85rem; color: var(--color-text-muted); display: flex; align-items: center; gap: 4px; }
.arrow-icon { margin-left: auto; color: var(--color-border); }

.feed-heading { margin: 0 0 20px 0; padding-left: 10px; border-left: 4px solid var(--color-border); }
.feed-list { display: flex; flex-direction: column; gap: 20px; }
.feed-card { padding: 20px; }
.feed-header { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
.avatar-sm { width: 40px; height: 40px; border-radius: 50%; }
.feed-meta { display: flex; flex-direction: column; font-size: 0.9rem; }
.feed-body { margin-bottom: 15px; line-height: 1.5; }
.feed-image img { width: 100%; border-radius: 8px; margin-bottom: 15px; }
.feed-actions { border-top: 1px solid var(--color-border); padding-top: 12px; display: flex; }
.action-btn { background: none; border: none; cursor: pointer; color: var(--color-text-muted); display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 0.9rem; }
.action-btn:hover { color: var(--color-primary); }


/* Responsive */
@media (max-width: 900px) {
    .hero-content { justify-content: center; text-align: center; }
    .group-identity { flex-direction: column; gap: 10px; }
    .stats-bar { flex-wrap: wrap; gap: 20px; }
    .layout-grid { grid-template-columns: 1fr; }
    .left-col { order: 1; } .right-col { order: 0; } /* Put events/feed first on mobile */
}
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
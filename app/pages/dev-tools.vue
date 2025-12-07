<template>
  <div class="container">
    <h2>🚀 Database Seeding Tool (Dev Only)</h2>
    <p>Use this button to populate your Firestore database with mock neighborhood groups.</p>
    
    <button 
      @click="handleSeed" 
      :disabled="seeding"
      :class="{ 'btn-loading': seeding }"
    >
      <span v-if="seeding">Seeding... Check Console</span>
      <span v-else>Seed {{ mockGroupsCount }} Mock Groups to Firestore</span>
    </button>
    
    <p v-if="seedComplete" class="success-message">✅ Database has been successfully seeded!</p>
    <p v-if="seedError" class="error-message">🛑 Seeding failed: {{ seedError }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { seedMockGroupsToFirestore } from '~~/services/firestore/groups'; 
// Make sure the path to your service file is correct

const seeding = ref(false);
const seedComplete = ref(false);
const seedError = ref<string | null>(null);

// Assuming your mock data array is named MOCK_GROUPS and is exported in your service file
// You may need to export it from groups.ts to get the count, or hardcode it.
const mockGroupsCount = 4; // Adjust this number if needed

async function handleSeed() {
    seedError.value = null;
    seeding.value = true;
    seedComplete.value = false;
    
    try {
        await seedMockGroupsToFirestore();
        seedComplete.value = true;
    } catch (e) {
        seedError.value = 'Check the browser console and your Firestore security rules.';
        console.error("Seeding failed:", e);
    } finally {
        seeding.value = false;
    }
}
</script>

<style scoped>
.container { padding: 40px; max-width: 600px; margin: 0 auto; }
.success-message { color: #10b981; font-weight: bold; margin-top: 20px; }
.error-message { color: #f00; font-weight: bold; margin-top: 20px; }
.btn-loading { cursor: not-allowed; opacity: 0.6; }
</style>
<template>
  <div class="content-window">
    <InboxMessageList class="message-list"
      :conversations="displayedMessages" 
      @select="openMessage"
    />
    <InboxMessageWindow class="message-window"
      v-if="selectedMessage"
      :otherUserName="selectedMessage.otherUserName"
      :currentUserId="currentUserId"
      :initialMessages="selectedMessage.messages"
      @send="sendMessage"
      @update:messages="updateMessages"
    />
  </div>
</template>
<script setup>
import { ref } from 'vue'
import InboxMessageList from '@/components/inbox/MessageList.vue'
import InboxMessageWindow from '@/components/inbox/MessageWindow.vue'

const currentUserId = ref('me')

const users = [
  { id: 'u1', name: 'Alice Johnson', avatar: '/assets/avatar-alice.png' },
  { id: 'u2', name: 'Bob Smith', avatar: '/assets/avatar-bob.png' },
  { id: 'u3', name: 'Carol White', avatar: '/assets/avatar-carol.png' }
]

function makeMsg(id, senderId, text, millisAgo = 0) {
  return {
    id,
    senderId,
    text,
    time: new Date(Date.now() - millisAgo).toISOString()
  }
}

const displayedMessages = ref(
  users.map((u, i) => {
    const msgs = [
      makeMsg(`${u.id}-m1`, u.id, `Hi — this is ${u.name}`, 1000 * 60 * 60 * (i + 4)),
      makeMsg(`${u.id}-m2`, 'me', `Reply to ${u.name}`, 1000 * 60 * 30 * (i + 1))
    ]
    return {
      id: `conv-${u.id}`,
      otherUserId: u.id,
      otherUserName: u.name,
      user: { id: u.id, name: u.name, avatar: u.avatar }, // used by MessageList
      messages: msgs,
      lastMessage: {
        senderName: msgs[msgs.length - 1].senderId === 'me' ? 'You' : u.name,
        text: msgs[msgs.length - 1].text
      }
    }
  })
)

const selectedMessage = ref(null)

function openMessage(conversation) {
  selectedMessage.value = conversation
}

function sendMessage(text) {
  if (!selectedMessage.value) return
  selectedMessage.value.messages.push({
    id: 'm-' + Date.now(),
    senderId: currentUserId.value,
    text,
    timestamp: Date.now()
  })
}

function updateMessages(newMessages) {
  if (!selectedMessage.value) return
  selectedMessage.value.messages = newMessages
}
</script>

<style scoped>
.content-window {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.message-list {
  width: 35%;
  height: 100%;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  box-sizing: border-box;
}

.message-window {
  width: 65%;
  height: 100%;
  box-sizing: border-box;
}
</style>
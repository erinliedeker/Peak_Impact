<template>
    <div class="message-window">
        <header class="mw-header">
            <div class="mw-title">{{ otherUserName }}</div>
        </header>

        <main class="mw-body" ref="bodyRef" @click="focusInput">
            <div class="messages">
                <div
                    v-for="msg in messages"
                    :key="msg.id"
                    :class="['message', msg.senderId === currentUserId ? 'me' : 'them']"
                >
                    <div class="bubble">
                        <div class="text">{{ msg.text }}</div>
                        <div class="meta">{{ formatTime(msg.time) }}</div>
                    </div>
                </div>
            </div>
            <div ref="endRef" />
        </main>

        <footer class="mw-footer">
            <input
                ref="inputRef"
                v-model="draft"
                @keydown.enter.prevent="onEnter"
                type="text"
                placeholder="Type a message..."
                class="mw-input"
                maxlength="1000"
            />
            <button class="send-btn" @click="send" :disabled="!canSend">Send</button>
        </footer>
    </div>
</template>

<script>
import { defineComponent, ref, watch, nextTick } from 'vue'

export default defineComponent({
    name: 'MessageWindow',
    props: {
        otherUserName: { type: String, required: true },
        currentUserId: { type: [String, Number], required: true },
        initialMessages: { type: Array, default: () => [] }
    },
    emits: ['send', 'update:messages'],
    setup(props, { emit }) {
        const messages = ref([...props.initialMessages])
        const draft = ref('')
        const bodyRef = ref(null)
        const endRef = ref(null)
        const inputRef = ref(null)

        watch(
            () => props.initialMessages,
            (v) => {
                messages.value = [...v]
                scrollToBottom()
            },
            { deep: true }
        )

        function scrollToBottom() {
            nextTick(() => {
                if (endRef.value) endRef.value.scrollIntoView({ behavior: 'smooth', block: 'end' })
            })
        }

        function canSend() {
            return draft.value.trim().length > 0
        }

        function send() {
            const text = draft.value.trim()
            if (!text) return
            const msg = {
                id: Date.now().toString(),
                senderId: props.currentUserId,
                text,
                time: new Date().toISOString()
            }
            messages.value.push(msg)
            emit('send', msg)
            emit('update:messages', messages.value.slice())
            draft.value = ''
            scrollToBottom()
            nextTick(() => inputRef.value && inputRef.value.focus())
        }

        function onEnter(e) {
            // Allow Shift+Enter for newline if using textarea; input doesn't support newline,
            // but keep check for future changes.
            if (!e.shiftKey) send()
        }

        function focusInput() {
            nextTick(() => inputRef.value && inputRef.value.focus())
        }

        function formatTime(iso) {
            try {
                const d = new Date(iso)
                return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } catch {
                return ''
            }
        }

        // initial scroll
        nextTick(scrollToBottom)

        return {
            messages,
            draft,
            bodyRef,
            endRef,
            inputRef,
            send,
            onEnter,
            focusInput,
            formatTime,
            canSend
        }
    }
})
</script>

<style scoped>
.message-window {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: #fff;
}

/* Header */
.mw-header {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    background: linear-gradient(180deg, #fafafa, #fff);
}
.mw-title {
    font-weight: 600;
    font-size: 16px;
}

/* Body (messages) */
.mw-body {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
    background: #f7f8fb;
}
.messages {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.message {
    display: flex;
    width: 100%;
}
.message.me {
    justify-content: flex-end;
}
.message.them {
    justify-content: flex-start;
}

.bubble {
    max-width: 70%;
    padding: 8px 12px;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 1px 1px rgba(0,0,0,0.03);
    font-size: 14px;
}
.message.me .bubble {
    background: #dcf8c6;
}
.meta {
    margin-top: 6px;
    font-size: 11px;
    color: #666;
    text-align: right;
}

/* Footer (input) */
.mw-footer {
    display: flex;
    gap: 8px;
    padding: 8px;
    border-top: 1px solid #eee;
    align-items: center;
    background: #fff;
}
.mw-input {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 20px;
    outline: none;
    font-size: 14px;
}
.mw-input:focus {
    border-color: #c6e0ff;
    box-shadow: 0 0 0 3px rgba(12, 102, 255, 0.06);
}
.send-btn {
    background: #0b7ef6;
    color: #fff;
    border: none;
    padding: 8px 12px;
    border-radius: 16px;
    cursor: pointer;
    font-weight: 600;
}
.send-btn:disabled {
    opacity: 0.5;
    cursor: default;
}
</style>
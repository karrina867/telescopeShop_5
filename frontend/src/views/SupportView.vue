<script setup>
import { computed, nextTick, reactive, ref } from 'vue'

const dialogs = reactive([
  {
    id: 1,
    name: 'Артём Ковалёв',
    role: 'Астроном-гид',
    initials: 'АК',
    preview: 'Подскажу, как навести на Сатурн',
    time: '12:41',
    unread: 2,
    online: true,
    color: 'bg-cyan-800',
  },
  {
    id: 2,
    name: 'Сервис и юстировка',
    role: 'Оптическая мастерская',
    initials: 'СЮ',
    preview: 'Забираем телескоп в четверг',
    time: '11:05',
    unread: 0,
    online: true,
    color: 'bg-indigo-800',
  },
  {
    id: 3,
    name: 'Доставка',
    role: 'Логистика',
    initials: 'Д',
    preview: 'Курьер будет после 18:00',
    time: 'Вчера',
    unread: 1,
    online: false,
    color: 'bg-slate-700',
  },
  {
    id: 4,
    name: 'Клуб «Орион»',
    role: 'Выездные наблюдения',
    initials: 'О',
    preview: 'Выезд в субботу в 21:00',
    time: 'Вчера',
    unread: 0,
    online: false,
    color: 'bg-slate-700',
  },
])

const threads = reactive({
  1: [
    { from: 'them', text: 'Здравствуйте! Вижу, вы смотрите Luna 90 EQ. Помочь с выбором?', time: '12:30' },
    { from: 'me', text: 'Да, хочу понять, будет ли видно кольца Сатурна из города.', time: '12:34' },
    {
      from: 'them',
      text: 'Будет. В противостоянии Сатурн уверенно виден даже с балкона: кольца различимы на 90×. Покажу, как настроить увеличение.',
      time: '12:38',
    },
    { from: 'me', text: 'А если не получится с первого раза?', time: '12:40' },
    { from: 'them', text: 'Созвонимся по видео и настроим вместе. Это входит в покупку.', time: '12:41' },
  ],
  2: [
    { from: 'them', text: 'Добрый день! Ваша заявка на юстировку принята.', time: '10:50' },
    { from: 'me', text: 'Спасибо. Когда сможете забрать телескоп?', time: '10:58' },
    { from: 'them', text: 'Курьер приедет в четверг с 14:00 до 18:00. Вернём настроенным за два дня.', time: '11:05' },
  ],
  3: [
    { from: 'them', text: 'Заказ №4819 передан курьеру.', time: 'Вчера' },
    { from: 'them', text: 'Курьер будет после 18:00. Позвонит за час до приезда.', time: 'Вчера' },
  ],
  4: [
    { from: 'them', text: 'В субботу выезжаем на площадку у Заславля. Сбор в 21:00.', time: 'Вчера' },
    { from: 'me', text: 'Отлично, буду!', time: 'Вчера' },
  ],
})

const activeDialog = ref(1)
const draft = ref('')
const chatOpen = ref(false)
const messageList = ref(null)

const activeDialogData = computed(() => dialogs.find((dialog) => dialog.id === activeDialog.value))
const activeThread = computed(() => threads[activeDialog.value] ?? [])
const unreadTotal = computed(() => dialogs.reduce((sum, dialog) => sum + dialog.unread, 0))

function scrollToBottom() {
  nextTick(() => {
    if (messageList.value) {
      messageList.value.scrollTop = messageList.value.scrollHeight
    }
  })
}

function openDialog(id) {
  activeDialog.value = id
  chatOpen.value = true
  const dialog = dialogs.find((item) => item.id === id)
  if (dialog) {
    dialog.unread = 0
  }
  scrollToBottom()
}

function sendMessage() {
  const text = draft.value.trim()
  if (!text) {
    return
  }

  const thread = threads[activeDialog.value]
  const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  thread.push({ from: 'me', text, time })
  draft.value = ''

  const dialog = activeDialogData.value
  if (dialog) {
    dialog.preview = text
    dialog.time = time
  }

  scrollToBottom()

  window.setTimeout(() => {
    thread.push({
      from: 'them',
      text: 'Принял вопрос. Отвечу в течение 15 минут и подскажу следующий шаг.',
      time,
    })
    scrollToBottom()
  }, 900)
}

const contacts = [
  { icon: 'fa-phone', title: 'Телефон', value: '+375 (29) 698-24-76', href: 'tel:+375296982476', note: 'Ежедневно 10:00–20:00' },
  { icon: 'fa-envelope', title: 'Почта', value: 'shop@orbita.by', href: 'mailto:shop@orbita.by', note: 'Ответим в течение дня' },
  { icon: 'fa-comment-dots', title: 'Чат', value: 'Ответ за 15 минут', href: '#chat', note: 'В рабочее время' },
]

const faqs = [
  {
    question: 'Сложно ли настроить телескоп впервые?',
    answer: 'Нет. Мы собираем и юстируем телескоп перед выдачей, а затем показываем настройку на месте или по видеосвязи. Обычно первый вечер занимает 20–30 минут.',
  },
  {
    question: 'Что можно увидеть из города?',
    answer: 'Луну, Юпитер, Сатурн, Венеру, двойные звёзды и яркие туманности. Для далёких галактик лучше выехать за город — подскажем удобные площадки.',
  },
  {
    question: 'Можно ли вернуть телескоп, если он не подошёл?',
    answer: 'Да, в течение 14 дней при сохранении комплектации и упаковки. Оптику проверяем вместе с вами, чтобы исключить повреждения при транспортировке.',
  },
  {
    question: 'Есть ли рассрочка или доставка?',
    answer: 'Для моделей от 3 000 рублей доступна рассрочка на 6 месяцев без переплаты. Доставка по крупным городам занимает 1–3 дня, по остальным — до 5 дней.',
  },
  {
    question: 'Как записаться на выездное наблюдение?',
    answer: 'Напишите в чат «Клуб Орион» или позвоните. Выезды проходят по субботам при ясной погоде, участие бесплатное для покупателей «Орбиты».',
  },
]
</script>

<template>
  <div class="page-shell">
    <header class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <span class="eyebrow">Поддержка</span>
        <h1 class="page-title">Мы на связи, пока небо ясное</h1>
        <p class="page-lead">
          Астроном-гид, сервис и доставка — в одном окне. Отвечаем в рабочее время в течение
          15 минут.
        </p>
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-400">
        <span class="flex h-2 w-2 rounded-full bg-emerald-400"></span>
        Онлайн · {{ unreadTotal }} новых сообщения
      </div>
    </header>

    <div class="grid gap-4 lg:grid-cols-3">
      <article v-for="contact in contacts" :key="contact.title" class="card-hover flex items-start gap-4">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand">
          <i class="fa-solid" :class="contact.icon" aria-hidden="true"></i>
        </span>
        <div class="min-w-0">
          <p class="text-xs text-gray-500">{{ contact.title }}</p>
          <a :href="contact.href" class="block truncate text-sm font-semibold text-white transition-colors hover:text-brand">
            {{ contact.value }}
          </a>
          <p class="mt-1 text-[11px] text-gray-500">{{ contact.note }}</p>
        </div>
      </article>
    </div>

    <section id="chat" class="mt-8" aria-labelledby="chat-title">
      <h2 id="chat-title" class="sr-only">Чат с поддержкой</h2>

      <div class="grid overflow-hidden rounded-panel border border-white/10 bg-space-900/70 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside
          class="border-white/10 lg:block lg:border-r"
          :class="chatOpen ? 'hidden' : 'block'"
          aria-label="Список диалогов"
        >
          <div class="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
            <h3 class="text-sm font-bold text-white">Диалоги</h3>
            <span class="chip">{{ dialogs.length }}</span>
          </div>
          <ul class="max-h-[28rem] overflow-y-auto scrollbar-thin">
            <li v-for="dialog in dialogs" :key="dialog.id">
              <button
                type="button"
                class="flex w-full items-start gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                :class="dialog.id === activeDialog ? 'bg-brand/10' : 'hover:bg-white/5'"
                :aria-pressed="dialog.id === activeDialog"
                @click="openDialog(dialog.id)"
              >
                <span class="relative shrink-0">
                  <span class="grid h-10 w-10 place-items-center rounded-full text-[11px] font-bold text-white" :class="dialog.color">
                    {{ dialog.initials }}
                  </span>
                  <span
                    v-if="dialog.online"
                    class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-space-900 bg-emerald-400"
                    aria-label="онлайн"
                  ></span>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="flex items-center justify-between gap-2">
                    <span class="truncate text-xs font-semibold text-white">{{ dialog.name }}</span>
                    <span class="shrink-0 text-[10px] text-gray-500">{{ dialog.time }}</span>
                  </span>
                  <span class="mt-0.5 block truncate text-[11px] text-gray-500">{{ dialog.preview }}</span>
                </span>
                <span
                  v-if="dialog.unread"
                  class="mt-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-space-950"
                >
                  {{ dialog.unread }}
                </span>
              </button>
            </li>
          </ul>
        </aside>

        <div class="flex min-h-[28rem] flex-col" :class="chatOpen ? 'flex' : 'hidden lg:flex'">
          <div class="flex items-center gap-3 border-b border-white/10 bg-space-950/60 px-3 py-2.5 backdrop-blur sm:px-4">
            <button
              type="button"
              class="rounded-lg p-2 text-gray-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden"
              aria-label="Вернуться к списку диалогов"
              @click="chatOpen = false"
            >
              <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
            </button>
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white" :class="activeDialogData.color">
              {{ activeDialogData.initials }}
            </span>
            <div class="min-w-0">
              <p class="truncate text-xs font-semibold text-white">{{ activeDialogData.name }}</p>
              <p class="truncate text-[11px]" :class="activeDialogData.online ? 'text-emerald-400' : 'text-gray-500'">
                {{ activeDialogData.online ? 'онлайн' : 'был(а) недавно' }} · {{ activeDialogData.role }}
              </p>
            </div>
            <a
              href="tel:+375296982476"
              class="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xs text-gray-300 transition-colors hover:bg-brand hover:text-space-950"
              aria-label="Позвонить в поддержку"
            >
              <i class="fa-solid fa-phone" aria-hidden="true"></i>
            </a>
          </div>

          <div ref="messageList" class="flex flex-1 flex-col gap-3 overflow-y-auto scrollbar-thin bg-space-950/30 p-4" aria-live="polite">
            <div
              v-for="(message, index) in activeThread"
              :key="index"
              class="flex flex-col"
              :class="message.from === 'me' ? 'items-end' : 'items-start'"
            >
              <div :class="message.from === 'me' ? 'chat-bubble-out' : 'chat-bubble-in'">
                {{ message.text }}
              </div>
              <span class="mt-1 px-1 text-[10px] text-gray-500">{{ message.time }}</span>
            </div>
          </div>

          <form class="chat-composer" @submit.prevent="sendMessage">
            <label for="chat-message" class="sr-only">Сообщение</label>
            <input
              id="chat-message"
              v-model="draft"
              type="text"
              autocomplete="off"
              placeholder="Напишите сообщение…"
              class="field-input py-2.5"
              @keydown.enter.prevent="sendMessage"
            />
            <button
              type="submit"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-space-950 transition-all hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-40"
              :disabled="!draft.trim()"
              aria-label="Отправить сообщение"
            >
              <i class="fa-solid fa-paper-plane text-sm" aria-hidden="true"></i>
            </button>
          </form>
        </div>
      </div>
    </section>

    <section id="faq" class="mt-12" aria-labelledby="faq-title">
      <div class="grid gap-8 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <span class="eyebrow">Вопросы</span>
          <h2 id="faq-title" class="page-title">Коротко о главном</h2>
          <p class="mt-3 text-sm leading-relaxed text-gray-400">
            Если ответа нет — напишите в чат выше. Астроном-консультант отвечает в рабочее время
            в течение 15 минут.
          </p>
          <router-link :to="{ name: 'services' }" class="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand transition-colors hover:text-brand-hover">
            Условия доставки и гарантии
            <i class="fa-solid fa-arrow-right text-[10px]" aria-hidden="true"></i>
          </router-link>
        </div>

        <div class="space-y-3 lg:col-span-8">
          <details
            v-for="(faq, index) in faqs"
            :key="faq.question"
            class="group faq-item"
            :open="index === 0"
          >
            <summary class="faq-summary">
              <span>{{ faq.question }}</span>
              <i class="fa-solid fa-chevron-down shrink-0 text-xs text-gray-500 transition-transform duration-300 group-open:rotate-180" aria-hidden="true"></i>
            </summary>
            <p class="border-t border-white/5 px-4 py-3 text-sm leading-relaxed text-gray-400">{{ faq.answer }}</p>
          </details>
        </div>
      </div>
    </section>
  </div>
</template>

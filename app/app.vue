/**
 * @fileoverview 小战导航 (xiao-zhan-nav)
 * @author 小战云 By 小战 (XZCloudSrv)
 * @license MIT
 * @see {@link https://github.com/XZCloudSrv/xiao-zhan-nav}
 * 
 * Copyright (c) 2025 XZCloudSrv
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useLinksStore } from '../stores/links'
import type { LinkItem } from '../stores/links'
import TheBackground from '../components/TheBackground.vue'

// 初始化 store
const store = useLinksStore()

// 🌟 新增：天气状态
const weatherData = ref<any>(null)
const isLoadingWeather = ref(true)
const weatherError = ref<string | null>(null)

// 🌟 新增：搜索功能
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement>()
const filteredLinks = computed(() => {
  if (!searchQuery.value) return store.links
  return store.links.filter(link => 
    link.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    link.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 🌟 新增：时间显示
const currentTime = ref('')
const currentDate = ref('')
const updateDateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

// 🌟 新增：音乐播放器
const isPlaying = ref(false)
const audioRef = ref<HTMLAudioElement | null>(null)
const currentSong = ref({
  title: '南风北巷 - 邵帅',
  artist: '背景音乐',
  url: 'https://m701.music.126.net/20251218035356/000ea4f989e2eeb2238834a0c84bd6aa/jdymusic/obj/wo3DlMOGwrbDjj7DisKw/32914961642/775a/3ef4/64af/0374984bc2a2e49d7ae236e94c8955c8.mp3'
})

const playMusic = () => {
  if (!audioRef.value) {
    audioRef.value = new Audio(currentSong.value.url)
    audioRef.value.loop = true
    audioRef.value.volume = 0.3
  }
  
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play().catch(e => {
      console.error('播放失败:', e)
      alert('音乐播放失败，请检查网络或更换音乐链接')
    })
  }
  isPlaying.value = !isPlaying.value
}

const stopMusic = () => {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.currentTime = 0
  }
  isPlaying.value = false
}

// 🌟 新增：移动端检测
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

// 定义天气数据类型
interface WeatherResponse {
  success: boolean
  location?: {
    city: string
    region: string
    country: string
  }
  weather?: {
    current: {
      temperature: number
      weather_text: string
      wind_speed: number
      time: string
    }
    today?: {
      max_temp: number
      min_temp: number
      weather_text: string
    }
  }
  error?: string
  fallback?: {
    city: string
    temperature: number
    weather_text: string
    hint: string
  }
  timestamp?: string
}

// 获取天气数据
const fetchWeather = async () => {
  try {
    isLoadingWeather.value = true
    const { data, error } = await useFetch<WeatherResponse>('/api/weather')
    
    if (error.value || !data.value?.success) {
      weatherError.value = data.value?.error || '无法获取天气信息'
      weatherData.value = {
        location: { city: '天津' },
        weather: {
          current: { temperature: 18, weather_text: '晴朗' }
        },
        isFallback: true
      }
    } else {
      weatherData.value = data.value
    }
  } catch (err) {
    weatherError.value = '天气服务暂时不可用'
    weatherData.value = {
      location: { city: '天津' },
      weather: {
        current: { temperature: 18, weather_text: '晴朗' }
      },
      isFallback: true
    }
  } finally {
    isLoadingWeather.value = false
  }
}

// 使用简单的定时器实现
let weatherInterval: number | null = null

// 页面加载时获取天气
onMounted(() => {
  fetchWeather()
  updateDateTime()
  
  // 每30分钟刷新一次天气
  weatherInterval = window.setInterval(() => {
    if (!isLoadingWeather.value) {
      fetchWeather()
    }
  }, 30 * 60 * 1000)
  
  // 每分钟更新时间
  const timeInterval = setInterval(updateDateTime, 60000)
  
  // 清理定时器
  onUnmounted(() => {
    if (weatherInterval) clearInterval(weatherInterval)
    clearInterval(timeInterval)
    if (audioRef.value) {
      audioRef.value.pause()
      audioRef.value = null
    }
    window.removeEventListener('resize', checkMobile)
  })
})

// 原有的其他状态...
const showModal = ref(false)
const activeItem = ref<LinkItem | null>(null)

// 🌟 状态：控制暗黑/明亮模式 (默认暗黑)
const isDark = ref(true)

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme-preference', isDark.value ? 'dark' : 'light')
  }
}

// 如果页面加载时检查 localStorage 中的主题偏好
onMounted(() => {
  if (typeof localStorage !== 'undefined') {
    const savedTheme = localStorage.getItem('theme-preference')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    }
  }
})

// 打开弹窗
const handleOpen = (item: LinkItem) => {
  activeItem.value = item
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  setTimeout(() => activeItem.value = null, 300)
}

// 监听键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement
  
  if (e.key === 'Escape' && showModal.value) {
    closeModal()
  }
  
  // 快捷键：Ctrl+K 聚焦搜索框
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    searchInput.value?.focus()
  }
  
  // 快捷键：空格键播放/暂停音乐
  if (e.key === ' ' && !target.closest('input, textarea')) {
    e.preventDefault()
    playMusic()
  }
  
  // 快捷键：/ 键聚焦搜索
  if (e.key === '/' && !showModal.value) {
    e.preventDefault()
    searchInput.value?.focus()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div :class="{ 'dark': isDark }">
    <div 
      class="min-h-screen font-sans transition-colors duration-700 ease-in-out
             flex items-center justify-center p-4 md:p-6 relative z-0
             bg-gray-50 text-gray-800 
             dark:bg-[#0f0c29] dark:text-gray-100"
    >
      <TheBackground :is-dark="isDark" />

      <!-- 顶部信息栏 -->
      <div class="fixed top-0 left-0 right-0 z-50 px-4 py-3 backdrop-blur-md border-b
                  bg-white/80 border-white/30 
                  dark:bg-gray-900/80 dark:border-gray-700/30
                  flex justify-between items-center">
        
        <!-- 左侧：时间和主题切换 -->
        <div class="flex items-center gap-3">
          <!-- 时间显示 -->
          <div class="hidden sm:flex flex-col">
            <div class="text-base font-bold">{{ currentTime }}</div>
            <div class="text-xs opacity-70">{{ currentDate }}</div>
          </div>
          
          <!-- 移动端时间简化 -->
          <div class="sm:hidden text-base font-bold">{{ currentTime }}</div>
          
          <!-- 主题切换按钮 -->
          <button 
            @click="toggleTheme" 
            class="p-2 rounded-lg bg-white/20 backdrop-blur-md border border-white/30
                   hover:bg-white/30 dark:hover:bg-white/10 transition-all duration-300
                   text-gray-800 dark:text-yellow-300"
            :title="isDark ? '切换到亮色模式' : '切换到暗黑模式'"
          >
            <Icon :icon="isDark ? 'mdi:weather-night' : 'mdi:weather-sunny'" class="w-5 h-5" />
          </button>
        </div>
        
        <!-- 右侧：天气和音乐 -->
        <div class="flex items-center gap-3">
          <!-- 天气显示 -->
          <div v-if="weatherData && !isLoadingWeather">
            <div 
              @click="fetchWeather"
              class="flex items-center gap-2 p-2 rounded-lg cursor-pointer
                     hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
              :title="weatherData.isFallback ? '点击重试获取天气' : '点击刷新天气'"
            >
              <div class="text-lg">
                <template v-if="weatherData.weather?.current.weather_text.includes('晴')">
                  <Icon icon="mdi:weather-sunny" class="text-yellow-500" />
                </template>
                <template v-else-if="weatherData.weather?.current.weather_text.includes('云')">
                  <Icon icon="mdi:weather-cloudy" class="text-gray-400" />
                </template>
                <template v-else-if="weatherData.weather?.current.weather_text.includes('雨')">
                  <Icon icon="mdi:weather-rainy" class="text-blue-400" />
                </template>
                <template v-else-if="weatherData.weather?.current.weather_text.includes('雪')">
                  <Icon icon="mdi:weather-snowy" class="text-blue-200" />
                </template>
                <template v-else>
                  <Icon icon="mdi:weather-cloudy" class="text-gray-300" />
                </template>
              </div>
              <div class="hidden sm:flex items-baseline gap-1">
                <span class="text-lg font-bold">{{ weatherData.weather?.current.temperature }}</span>
                <span class="text-xs opacity-70">°C</span>
              </div>
              <div class="sm:hidden text-lg font-bold">{{ weatherData.weather?.current.temperature }}°</div>
            </div>
          </div>
          
          <!-- 加载中的天气 -->
          <div v-if="isLoadingWeather && !weatherData" class="p-2">
            <div class="flex items-center gap-2">
              <Icon icon="mdi:weather-cloudy" class="text-gray-300 animate-pulse" />
              <div class="h-4 w-8 bg-white/20 rounded animate-pulse hidden sm:block"></div>
            </div>
          </div>
          
          <!-- 音乐播放器 -->
          <div class="relative group">
            <button 
              @click="playMusic"
              class="p-2 rounded-lg bg-white/20 backdrop-blur-md border border-white/30
                     hover:bg-white/30 dark:hover:bg-white/10 transition-all duration-300"
              :title="isPlaying ? '暂停音乐' : '播放音乐'"
            >
              <Icon :icon="isPlaying ? 'mdi:pause' : 'mdi:music'" class="w-5 h-5" />
            </button>
            
            <!-- 音乐信息提示 -->
            <div class="absolute right-0 top-full mt-2 p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 
                        backdrop-blur-md border border-white/30 dark:border-gray-700/30 shadow-lg
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                        transition-all duration-300 z-50 min-w-48">
              <div class="flex items-start gap-3">
                <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Icon :icon="isPlaying ? 'mdi:music-note' : 'mdi:music-off'" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div class="font-medium">{{ currentSong.title }}</div>
                  <div class="text-sm opacity-70 mt-1">{{ currentSong.artist }}</div>
                  <div class="flex gap-2 mt-3">
                    <button 
                      @click="playMusic"
                      class="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
                    >
                      {{ isPlaying ? '暂停' : '播放' }}
                    </button>
                    <button 
                      v-if="isPlaying"
                      @click.stop="stopMusic"
                      class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      停止
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main 
        class="w-full max-w-2xl rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 lg:p-12 relative overflow-hidden shadow-2xl
               transition-all duration-500 border mt-16
               bg-white/30 border-white/40 
               dark:bg-white/10 dark:border-white/10 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
               backdrop-blur-2xl"
      >
        
        <header class="text-center mb-8 md:mb-10">
          <div class="relative inline-block group">
            <img src="http://q.qlogo.cn/headimg_dl?dst_uin=2305806356&spec=640&img_type=jpg" alt="Avatar" 
                 class="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 md:border-[5px] shadow-xl mx-auto mb-4 
                        border-white dark:border-white/20
                        group-hover:rotate-12 transition-transform duration-500 ease-spring">
            <span class="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-4 h-4 md:w-6 md:h-6 
                         rounded-full border-2 md:border-[3px] border-white dark:border-gray-800 bg-green-500"></span>
          </div>
          
          <h1 class="text-2xl md:text-3xl lg:text-4xl font-[700] tracking-tight mb-2 font-heading text-slate-900 dark:text-white">
            小战の个人导航
          </h1>
          <p class="text-sm md:text-base font-medium opacity-70 tracking-wide font-body">
            Design / Code / Life
          </p>
        </header>

        <!-- 搜索框 -->
        <div class="mb-6 md:mb-8 relative">
          <div class="relative">
            <Icon icon="mdi:magnify" class="absolute left-4 top-1/2 transform -translate-y-1/2 
                     text-gray-400 dark:text-gray-500" />
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="搜索链接... (快捷键: Ctrl+K 或 /)"
              class="w-full pl-12 pr-10 py-3 rounded-2xl border border-white/40 
                     bg-white/30 dark:bg-white/10 backdrop-blur-md 
                     focus:outline-none focus:ring-2 focus:ring-blue-500/30 
                     transition-all placeholder-gray-500 dark:placeholder-gray-400
                     text-sm md:text-base"
              ref="searchInput"
            />
            <button 
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 
                     text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            >
              <Icon icon="mdi:close" class="w-4 h-4" />
            </button>
          </div>
          <div v-if="searchQuery" class="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
            <span>找到 {{ filteredLinks.length }} 个结果</span>
            <span class="opacity-60 hidden sm:inline">按 Enter 聚焦第一个结果</span>
          </div>
        </div>

        <!-- 链接网格 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <button 
            v-for="link in filteredLinks" 
            :key="link.id"
            @click="handleOpen(link)"
            class="group flex items-center p-3 md:p-4 rounded-xl md:rounded-2xl w-full text-left relative overflow-hidden
                   transition-all duration-300 border
                   hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]
                   bg-white/50 border-white/40 hover:bg-white/80
                   dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
          >
            <div :class="`absolute inset-0 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r ${link.color}`"></div>
            
            <div class="p-2 md:p-3 rounded-lg md:rounded-xl mr-3 md:mr-4 transition-transform group-hover:scale-110 shadow-sm
                        bg-white dark:bg-white/10 text-slate-800 dark:text-white flex-shrink-0">
              <Icon :icon="link.icon" class="w-5 h-5 md:w-6 md:h-6" />
            </div>
            
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-base md:text-lg font-heading text-slate-800 dark:text-white truncate">
                {{ link.title }}
              </h3>
              <p class="text-xs font-medium opacity-60 truncate pr-2 text-slate-600 dark:text-gray-300">
                {{ link.description }}
              </p>
            </div>
            
            <Icon icon="mdi:chevron-right" class="w-4 h-4 md:w-5 md:h-5 opacity-40 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </button>
          
          <!-- 没有搜索结果时显示 -->
          <div 
            v-if="searchQuery && filteredLinks.length === 0"
            class="col-span-1 sm:col-span-2 text-center py-6 md:py-8 text-gray-500 dark:text-gray-400"
          >
            <Icon icon="mdi:file-search-outline" class="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 opacity-40" />
            <p class="text-base md:text-lg mb-2">没有找到匹配的链接</p>
            <p class="text-xs md:text-sm opacity-70">尝试其他关键词或清除搜索</p>
          </div>
        </div>

        <footer class="mt-8 md:mt-10 lg:mt-12 text-center">
          <div class="text-xs opacity-60 mb-2">
            © 2025 Xiao Zhan. <span class="hidden sm:inline">Built with Nuxt 3 & Vue 3.5</span>
          </div>
          <div class="text-xs opacity-40 hover:opacity-70 transition-opacity">
            <span class="hidden sm:inline">快捷键: </span>
            <span class="sm:hidden">快捷: </span>
            Ctrl+K 或 / 搜索 • 空格 播放音乐 • Esc 关闭弹窗
          </div>
        </footer>
      </main>

      <Teleport to="body">
        <Transition name="modal">
          <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 backdrop-blur-md transition-colors duration-300
                        bg-gray-200/60 dark:bg-black/60" 
                 @click="closeModal"></div>
            
            <div class="relative w-full max-w-sm rounded-2xl md:rounded-[2rem] p-6 md:p-8 shadow-2xl transform transition-all z-10
                        bg-white dark:bg-[#1a1a2e] text-slate-900 dark:text-white">
              
              <button @click="closeModal" class="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <Icon icon="mdi:close" class="w-5 h-5 md:w-6 md:h-6 opacity-60" />
              </button>
              
              <div class="flex flex-col items-center text-center">
                <div :class="`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg bg-gradient-to-br ${activeItem?.color} text-white`">
                  <Icon :icon="activeItem?.icon || ''" class="w-8 h-8 md:w-10 md:h-10" />
                </div>
                
                <h2 class="text-xl md:text-2xl font-bold mb-2 font-heading">前往 {{ activeItem?.title }}?</h2>
                <p class="text-xs md:text-sm opacity-60 mb-6 md:mb-8 font-body px-4">{{ activeItem?.description }}</p>
                
                <a :href="activeItem?.url" target="_blank" 
                   class="w-full py-3 md:py-3.5 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2
                          bg-slate-900 text-white dark:bg-white dark:text-black">
                  <span>立即访问</span>
                  <Icon icon="mdi:arrow-top-right" />
                </a>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
/* 定义字体别名，方便 CSS 使用 */
.font-heading {
  font-family: 'Outfit', 'Noto Sans SC', sans-serif;
}
.font-body {
  font-family: 'Inter', 'Noto Sans SC', sans-serif;
}

/* 弹窗动画 */
.modal-enter-active, .modal-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
.ease-spring {
  transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* 移动端优化 */
@media (max-width: 640px) {
  .main-container {
    margin-top: 4.5rem;
    padding: 1rem;
  }
  
  .link-button {
    padding: 0.75rem;
  }
  
  .avatar {
    width: 5rem;
    height: 5rem;
  }
}
</style>

<style>
/* 全局根元素字体设置 */
:root {
  font-family: 'Outfit', 'Inter', 'Noto Sans SC', sans-serif;
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .hover-effect {
    transition: none;
  }
  
  button, a {
    min-height: 44px;
    min-width: 44px;
  }
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

/* 加载动画 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

/* 输入框焦点效果 */
input:focus {
  background-color: rgba(255, 255, 255, 0.4) !important;
  border-color: rgba(59, 130, 246, 0.5) !important;
}

.dark input:focus {
  background-color: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(96, 165, 250, 0.5) !important;
}

/* 按钮激活效果 */
button:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}
</style>

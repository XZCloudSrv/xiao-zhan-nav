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
defineProps<{ isDark: boolean }>()
</script>

<template>
  <div class="fixed inset-0 overflow-hidden -z-10 transition-colors duration-700">
    <div :class="['absolute inset-0 transition-colors duration-700', isDark ? 'bg-[#0f0c29]' : 'bg-blue-50']"></div>

    <div :class="[
      'liquid-blob absolute w-96 h-96 rounded-full top-0 left-0 filter blur-3xl animate-blob opacity-70',
      isDark ? 'bg-purple-600 mix-blend-multiply' : 'bg-purple-300 mix-blend-multiply'
    ]"></div>

    <div :class="[
      'liquid-blob absolute w-96 h-96 rounded-full top-0 right-0 filter blur-3xl animate-blob animation-delay-2000 opacity-70',
      isDark ? 'bg-indigo-600 mix-blend-multiply' : 'bg-yellow-200 mix-blend-multiply'
    ]"></div>

    <div :class="[
      'liquid-blob absolute w-96 h-96 rounded-full -bottom-32 left-20 filter blur-3xl animate-blob animation-delay-4000 opacity-70',
      isDark ? 'bg-pink-600 mix-blend-multiply' : 'bg-pink-300 mix-blend-multiply'
    ]"></div>
  </div>
</template>

<style scoped>
.animate-blob {
  animation: blob 10s infinite;
}
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }
</style>

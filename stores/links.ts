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

// stores/links.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface LinkItem {
  id: number;
  title: string;
  url: string;
  icon: string;
  color: string;
  description: string;
}

export const useLinksStore = defineStore('links', () => {
  const links = ref<LinkItem[]>([
    { id: 1, title: 'GitHub', url: 'https://github.com/XZCloudSrv', icon: 'mdi:github', color: 'from-gray-700 to-black', description: '查看我的开源项目' },
    { id: 2, title: 'Bilibili', url: 'https://bilibili.com', icon: 'mdi:television-classic', color: 'from-pink-400 to-pink-600', description: '我的视频主页' },
    { id: 3, title: '博客', url: '#', icon: 'mdi:fountain-pen-tip', color: 'from-blue-400 to-blue-600', description: '技术文章与随笔' },
    { id: 4, title: '设计集', url: '#', icon: 'mdi:palette', color: 'from-purple-400 to-purple-600', description: '我的UI作品展示' },
    { id: 5, title: '联系我', url: 'https://qm.qq.com/q/pyqICbKrjU', icon: 'mdi:email-outline', color: 'from-green-400 to-green-600', description: '商务合作与交流' },
  ])

  return { links }
})

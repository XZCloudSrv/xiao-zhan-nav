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

// server/api/weather.get.ts
export default defineEventHandler(async (event) => {
  try {
    // 1. 获取客户端IP
    let ip = getRequestHeader(event, 'x-forwarded-for') || 
             getRequestHeader(event, 'x-real-ip') || 
             'unknown';
    
    // 处理多个IP的情况（如经过代理）
    if (ip && ip.includes(',')) {
      const parts = ip.split(',');
      ip = parts[0] ? parts[0].trim() : 'unknown';
    }

    console.log('检测到IP:', ip);

    // 2. 通过IP获取地理位置（使用 ip-api.com）
    const geoResponse = await fetch(`http://ip-api.com/json/${ip === 'unknown' ? '' : ip}?lang=zh-CN&fields=status,message,country,regionName,city`);
    const geoData = await geoResponse.json();

    if (geoData.status !== 'success') {
      throw new Error(`IP定位失败: ${geoData.message || '未知错误'}`);
    }

    const { city, regionName, country } = geoData;
    console.log('定位到位置:', { city, regionName, country });

    // 3. 使用Open-Meteo获取天气（需要城市名转坐标）
    // 先通过Open-Meteo的地理编码API获取坐标
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`;
    const geocodingResponse = await fetch(geocodingUrl);
    const geocodingData = await geocodingResponse.json();

    let latitude: number;
    let longitude: number;
    let name: string;

    if (!geocodingData.results || geocodingData.results.length === 0) {
      // 如果城市没找到，尝试用省份/地区名
      const fallbackUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(regionName)}&count=1&language=zh&format=json`;
      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();
      
      if (!fallbackData.results || fallbackData.results.length === 0) {
        throw new Error('无法找到该地点的坐标');
      }
      
      latitude = fallbackData.results[0].latitude;
      longitude = fallbackData.results[0].longitude;
      name = fallbackData.results[0].name;
    } else {
      latitude = geocodingData.results[0].latitude;
      longitude = geocodingData.results[0].longitude;
      name = geocodingData.results[0].name;
    }

    // 4. 获取天气数据
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&hourly=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    // 5. 处理天气代码转中文描述
    const weatherCodeMap: Record<number, string> = {
      0: '晴朗',
      1: '晴间多云',
      2: '多云',
      3: '阴天',
      45: '有雾',
      48: '冻雾',
      51: '细雨',
      53: '小雨',
      55: '中雨',
      56: '冻雨',
      57: '强冻雨',
      61: '小雨',
      63: '中雨',
      65: '大雨',
      66: '雨夹雪',
      67: '雨夹雪',
      71: '小雪',
      73: '中雪',
      75: '大雪',
      77: '冰雹',
      80: '阵雨',
      81: '强阵雨',
      82: '暴雨',
      85: '阵雪',
      86: '强阵雪',
      95: '雷暴',
      96: '雷雨',
      99: '强雷暴'
    };

    const currentWeather = weatherData.current;
    const dailyWeather = weatherData.daily;

    const currentWeatherCode = currentWeather.weather_code as number;
    const dailyWeatherCode = dailyWeather.weather_code[0] as number;

    return {
      success: true,
      location: {
        city: name,
        region: regionName,
        country
      },
      weather: {
        current: {
          temperature: Math.round(currentWeather.temperature_2m),
          weather_code: currentWeatherCode,
          weather_text: weatherCodeMap[currentWeatherCode] || '未知',
          wind_speed: Math.round(currentWeather.wind_speed_10m),
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        },
        today: {
          max_temp: Math.round(dailyWeather.temperature_2m_max[0]),
          min_temp: Math.round(dailyWeather.temperature_2m_min[0]),
          weather_code: dailyWeatherCode,
          weather_text: weatherCodeMap[dailyWeatherCode] || '未知'
        }
      },
      timestamp: new Date().toISOString()
    };

  } catch (error: any) {
    console.error('天气API错误:', error);
    
    // 返回友好的错误信息
    return {
      success: false,
      error: error.message || '获取天气信息失败',
      fallback: {
        city: '天津',
        temperature: 18,
        weather_text: '晴朗',
        hint: '已使用默认天气数据'
      }
    };
  }
});

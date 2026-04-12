# ⛅ SkyCast — Weather App (Vite Edition)

This project has been migrated from `react-scripts` (Create React App) to **Vite**
to permanently fix the `ajv`, `lodash`, and `assignWith` dependency errors.

## 🚀 Setup (3 commands)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
# OR
npm start
```

Open **http://localhost:3000** in your browser.

## 📦 Build for production

```bash
npm run build
npm run preview
```

---

## Why Vite instead of Create React App?

Create React App (`react-scripts`) has not been maintained since 2023 and
causes cascading dependency conflicts on modern Node.js versions:
- `ajv/dist/compile/codegen` not found
- `assignWith is not defined` (lodash v4/v5 conflict)
- `nth-check` security warnings

Vite has none of these issues and is **10x faster** to start.

---

## Features
- 🌦️ Hourly & 7-day weather forecast
- 📈 Temperature trend chart
- ☀️ UV Index with safe exposure time
- 🌬️ Air Quality (AQI + pollutants)
- 📉 AQI hourly chart
- 🌿 Pollen & allergy index
- 🌊 Ocean & beach conditions
- 🗓 30-day temperature heatmap
- 🌧 Animated weather radar (RainViewer)
- 🗺️ Interactive map — click to get weather anywhere
- 📋 Daily briefing with best outdoor hour
- 🌙 Dark / ☀️ Light mode
- 🌐 Multi-language (English, हिन्दी, বাংলা, मराठी, اردو)
- 🔔 Browser push notifications
- 📲 PWA — installable on phone
- 🔊 Ambient weather sounds
- ⏱ Live clock for searched city

## Free APIs used (No API key needed)
- Open-Meteo — weather, UV, air quality, pollen, marine, history
- RainViewer — weather radar
- Nominatim (OpenStreetMap) — geocoding
- Leaflet — interactive maps

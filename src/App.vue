<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'

const lat = ref<number | null>(null)
const lng = ref<number | null>(null)

const mapContainer = ref<HTMLDivElement | null>(null)
let map: Map | null = null

const ws = new WebSocket('wss://devoted-solace-production.up.railway.app')
let watcherId: number | null = null

onMounted(() => {
  map = new Map({
    target: mapContainer.value!,
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: fromLonLat([0, 0]),
      zoom: 10,
    }),
  })

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'REGISTER', userId: 'user_123' }))

    watcherId = navigator.geolocation.watchPosition((pos) => {
      lat.value = pos.coords.latitude
      lng.value = pos.coords.longitude

      ws.send(
        JSON.stringify({
          type: 'LOCATION',
          lat: lat.value,
          lng: lng.value,
        }),
      )
    })
  }
})

watch([lat, lng], ([newLat, newLng]) => {
  if (map && newLat !== null && newLng !== null) {
    const view = map.getView()
    view.setCenter(fromLonLat([newLng, newLat]))
    view.setZoom(15)
  }
})

onUnmounted(() => {
  if (watcherId !== null) navigator.geolocation.clearWatch(watcherId)
  ws.close()
})
</script>

<template>
  <main>
    <h1>hallo</h1>
    <p>Lat: {{ lat ?? 'waiting...' }}</p>
    <p>long: {{ lng ?? 'waiting...' }}</p>
    <div ref="mapContainer" class="map-container"></div>
  </main>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 400px;
}
</style>

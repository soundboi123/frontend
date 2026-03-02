<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const lat = ref<number | null>(null)
const lng = ref<number | null>(null)

const ws = new WebSocket('wss://devoted-solace-production.up.railway.app')
let watcherId: number | null = null

onMounted(() => {
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

onUnmounted(() => {
  if (watcherId !== null) navigator.geolocation.clearWatch(watcherId)
  ws.close()
})
</script>

<template>
  <main>
    <p>Lat: {{ lat ?? 'waiting...' }}</p>
    <p>long: {{ lng ?? 'waiting...' }}</p>
  </main>
</template>

<style scoped></style>

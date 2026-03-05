<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { Icon, Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import { defaults as defaultControls, Zoom } from 'ol/control'
interface Monument {
  id: string
  label: string
  coord: string // "Point(lng lat)"
  afstand_m: number
}
const lat = ref<number | null>(null)
const lng = ref<number | null>(null)
const mapContainer = ref<HTMLDivElement | null>(null)
const monuments = ref<Monument[]>([])
let map: Map | null = null

const markerFeature = new Feature({
  geometry: new Point(fromLonLat([0, 0])),
})
markerFeature.setStyle(
  new Style({
    image: new Icon({
      src: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg',
      scale: 1,
    }),
  }),
)
const markerLayer = new VectorLayer({
  source: new VectorSource({
    features: [markerFeature],
  }),
  zIndex: 5,
})
const monumentSource = new VectorSource()
const monumentLayer = new VectorLayer({
  source: monumentSource,
  zIndex: 5,
})
function monumentStyle(label: string) {
  return new Style({
    image: new CircleStyle({
      radius: 10,
      fill: new Fill({ color: '#e8c547' }),
      stroke: new Stroke({ color: '#000', width: 1.5 }),
    }),
    text: new Text({
      text: label.length > 20 ? label.slice(0, 18) + '…' : label,
      offsetY: -20,
      font: '12px sans-serif',
      fill: new Fill({ color: '#fff' }),
      stroke: new Stroke({ color: '#000', width: 3 }),
    }),
  })
}
function updateMonumentMarkers(data: Monument[]) {
  monumentSource.clear()

  data.forEach((monument) => {
    // Parsen van "Point(lng lat)"
    const [mLng, mLat] = monument.coord.replace('Point(', '').replace(')', '').split(' ')
    const mLng = parseFloat(parts[0] ?? '0')
    const mLat = parseFloat(parts[1] ?? '0')

    const feature = new Feature({
      geometry: new Point(fromLonLat([mLng, mLat])),
      monument, // bewaar data op feature voor latere interactie
    })
    feature.setStyle(monumentStyle(monument.label))
    monumentSource.addFeature(feature)
  })
}
const ws = new WebSocket('wss://devoted-solace-production.up.railway.app')
let watcherId: number | null = null
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)

  switch (msg.type) {
    case 'MONUMENTS':
      monuments.value = msg.monuments
      updateMonumentMarkers(msg.monuments)
      break
    case 'ERROR':
      console.error('Server fout:', msg.message)
      break
  }
}
onMounted(async () => {
  await nextTick()
  map = new Map({
    target: mapContainer.value!,
    controls: defaultControls({ attribution: false, zoom: false, rotate: false }).extend([
      new Zoom({
        className: 'custom-zoom',
      }),
    ]),
    layers: [
      new TileLayer({
        source: new OSM({
          attributions: [],
        }),
      }),
      monumentLayer,
      markerLayer,
    ],
    view: new View({
      center: fromLonLat([0, 0]),
      zoom: 15,
    }),
  })

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'REGISTER', userId: 'user_123' }))

    watcherId = navigator.geolocation.watchPosition(
      (pos) => {
        lat.value = pos.coords.latitude
        lng.value = pos.coords.longitude

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: 'LOCATION',
              lat: lat.value,
              lng: lng.value,
            }),
          )
        }
      },
      (err) => {
        console.error('geolocatie error:', err)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      },
    )
  }
})

watch([lat, lng], ([newLat, newLng]) => {
  if (map && newLat !== null && newLng !== null) {
    const coords = fromLonLat([newLng, newLat])
    markerFeature.getGeometry()?.setCoordinates(coords)
    map.getView().animate({
      center: coords,
      duration: 500,
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
    <div ref="mapContainer" class="map-container"></div>
    <div class="navbar">
      <button><i class="fa-solid fa-person-walking"></i></button>
      <button><i class="fa-solid fa-house"></i></button>
      <button><i class="fa-solid fa-ellipsis-vertical"></i></button>
    </div>
  </main>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
}
</style>

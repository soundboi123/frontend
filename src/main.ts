import { createApp } from 'vue'
import App from './App.vue'
import Map from 'ol/Map'
import { View } from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import { OSM } from 'ol/source'
import { fromLonLat } from 'ol/proj'
createApp(App).mount('#app')

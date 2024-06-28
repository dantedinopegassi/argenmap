import { Map, TileLayer } from "leaflet";
import "leaflet/dist/leaflet.css";
import config from "../config/__config__";
import data from "../config/data.json";

export function initializeMap() {
  const { lat, lng, zoom } = { ...config.initialMap };
  const map = new Map("map").setView([lat, lng], zoom);
  let layer : TileLayer | undefined= undefined;
  if (data.items[0].capas[0]) {
    layer = new TileLayer(data.items[0].capas[0].host);
  }
  

  return map;
}

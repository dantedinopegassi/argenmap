import "./styles/css/main.css";
import { initializeMap } from "./modules/initialize";
import { addLayer } from "./modules/layers";

const map = initializeMap();
addLayer(map);

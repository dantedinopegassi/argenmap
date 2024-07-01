import "./styles/css/main.css";
import { initializeMap } from "./modules/initialize";
import { addLayer } from "./modules/layers";
import { addPlugin } from "./modules/plugins";


const map = initializeMap();
addLayer(map);
addPlugin(map);

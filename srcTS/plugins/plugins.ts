import { control } from "leaflet";

interface Plugin {
    initialize: (map: L.Map) => void;
}

export const FullscreenPlugin: Plugin = {
    initialize: (map: L.Map) => {
        // control.fullscreen().addTo(map);
    }
}
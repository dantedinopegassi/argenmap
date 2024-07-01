// CON TYPESCRIPT

import Model from "./model";

const View = {
    renderMap(lat: number, lng: number, zoom: number) {
        Model.initializeMap(lat, lng, zoom);
    }
}

export default View
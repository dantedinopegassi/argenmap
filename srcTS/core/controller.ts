// CON TYPESCRIPT

// import config from "./__config__";
import View from "./view";
import Model from "./model";
import { FullscreenPlugin } from "./plugins";

const Controller = {
    init(): void {
        this.loadMap();
        this.loadPlugins();
    },

    // loadMap(): void {
    //     const { lat, lng, zoom } = config.initialMap;
    //     View.renderMap(lat, lng, zoom);
    // },

    // loadPlugins(): void {
    //     if (config.plugins.fullscreen) {
    //         Model.addPlugin(FullscreenPlugin.initialize);
    //     }
    // }

}

export default Controller;
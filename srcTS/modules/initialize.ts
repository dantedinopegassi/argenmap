import { Map, TileLayer } from "leaflet";
import "leaflet/dist/leaflet.css";
import config from "../config/__config__";
import data from "../config/data.json";

/*********************************************************************************|
| This function has its perks. First, this piece could be structured              |
| into three parts. Import and declare values/arguments, then initialize          |
| framework (map), and then do whatever has to be done.                           |
|                                                                                 |
| Second, France :)                                                               |
| JK, config.InitialMap stores an initial level of latitude,                      |
| longitude and zoom, which is parsed with the spread operator,                   |
| à la React.                                                                     |
|                                                                                 |
| Third, a layer property is declared. And since it should exist, it              |
| starts with a "null" value. "undefined" is discouraged. For                     |
| reference: https://dmitripavlutin.com/7-tips-to-handle-undefined-in-javascript/ |
|                                                                                 |
| Fourth, the JSON file could be empty or missing, and so there's                 |
| "?." to check nested properties. This is called _optional chaining_.            |
**********************************************************************************/

export function initializeMap() {
  let baseMap: Map | null = null;
  let layer: TileLayer | null = null;

  const { lat, lng, zoom } = { ...config.initialMap };

  baseMap = new Map("map").setView([lat, lng], zoom);
  
  if (data?.items?.[0]?.capas?.[0]) {
    layer = new TileLayer(data.items[0].capas[0].host);
  }

  //check for errors

  return baseMap;
}

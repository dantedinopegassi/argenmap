/***************************************************************************************|
| Todos estos parametros estan tal cual la documentacion de QGIS GetMap:                |
| https://docs.qgis.org/3.34/en/docs/server_manual/services/wms.html#getmap             |
|***************************************************************************************/



/***************************************************************************************|
| 1. Especificaciones                                                                   |
|***************************************************************************************/

interface ICapa {
  servicio: string;
  //request: string -> 'GetMap'
  version: string;
  nombre: string;
  titulo: string;
  //styles: string -> por defecto en geoserver
  srs: string;
  minx: string;
  maxx: string;
  miny: string;
  maxy: string;
  host: string;
  featureInfoFormat: string;
  key: string;
  attribution: string;
  legendURL: string;

  getLegendURL(): string;
  getHostWMS(): string;
}



/***************************************************************************************|
| 2. Implementaciones                                                                   |
|***************************************************************************************/

class Capa implements ICapa {
  constructor(
    public nombre: string,
    public titulo: string,
    public srs: string,
    public host: string,
    public servicio: string,
    public version: string,
    public featureInfoFormat: string,
    public key: string,
    public minx: string,
    public maxx: string,
    public miny: string,
    public maxy: string,
    public attribution: string,
    public legendURL: string
  ) {
    this.nombre = nombre;
    this.titulo = titulo;
    this.srs = srs;
    this.host = host;
    this.servicio = servicio;
    this.version = version;
    this.featureInfoFormat = featureInfoFormat;
    this.key = key;
    this.minx = minx;
    this.maxx = maxx;
    this.miny = miny;
    this.maxy = maxy;
    this.attribution = attribution;
    this.legendURL = legendURL;
  }

  getLegendURL() {
    if (this.host == null) {
      return "";
    }
    return (
      this.host +
      "/ows?service=" +
      this.servicio +
      "&version=" +
      this.version +
      "&request=GetLegendGraphic&" +
      "format=image/png&layer=" +
      this.nombre
    );
  }

  getHostWMS() {
    if (this.host == null) {
      return "";
    }
    let owsHost = this.host;
    /* isMapserver = this.host.includes('cgi-bin');
          
          if (!isMapserver) {   
              if (this.servicio === "wms") { owsHost += "/wms?"};
              //if (this.servicio === "mapserver") { owsHost };
          } */
    if (
      this.servicio === "wms" &&
      owsHost.includes("/geoserver") &&
      !owsHost.endsWith("/wms")
    ) {
      owsHost += "/wms";
    }
    if (this.servicio === "wmts") {
      owsHost += "/gwc/service/wmts";
    }

    return owsHost;
  }
}

class CapaMapserver extends Capa {
  getHostWMS() {
    if (this.host == null) {
      return "";
    }
    return this.host + "?";
  }
}

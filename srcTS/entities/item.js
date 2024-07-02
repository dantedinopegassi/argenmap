import { clearSpecialChars } from "../utils/functions/functions";

class ItemComposite {
  constructor(nombre, seccion, palabrasClave, descripcion) {
    this.nombre = nombre;
    this.seccion = clearSpecialChars(seccion);
    this.peso = null;
    this.palabrasClave =
      palabrasClave == null ||
      palabrasClave === "" ||
      palabrasClave == undefined
        ? []
        : palabrasClave;
    this.descripcion = descripcion;
    this.impresor = null;
    this.objDOM = null;
    this.querySearch = "";
    this._active = false;

    this.searchOrderIntoKeywords();
  }

  getQuerySearch = () => {
    return this.querySearch;
  };

  setQuerySearch = (q) => {
    this.querySearch = q;
  };

  getActive = () => {
    return this._active;
  };

  setActive = (active) => {
    this._active = active;
  };

  getPeso = () => {
    return this.peso;
  };

  setPeso = (peso) => {
    this.peso = peso;
  };

  searchOrderIntoKeywords = () => {
    //Recorrer palabrasClave para ver si viene el orden
    if (
      this.palabrasClave != undefined &&
      this.palabrasClave != "" &&
      this.palabrasClave != null
    ) {
      for (var key in this.palabrasClave) {
        if (this.palabrasClave[key].indexOf("orden:") == 0) {
          this.peso = this.palabrasClave[key].replace("orden:", "").trim() * 1;
          this.palabrasClave.splice(key, 1);
        }
      }
    }
  };

  setPalabrasClave = (palabrasClave) => {
    this.palabrasClave = palabrasClave;
  };

  setDescripcion = (descripcion) => {
    this.descripcion = descripcion;
  };

  setImpresor = (impresor) => {
    this.impresor = impresor;
  };

  imprimir = () => {
    return this.impresor.imprimir(this);
  };

  getLegendURL = () => {
    return "";
  };

  setObjDom = (dom) => {
    this.objDOM = dom;
  };

  getObjDom = () => {
    return $(this.objDOM);
  };

  isBaseLayer = () => {
    return false;
  };

  match = () => {
    if (this.querySearch == "" || this.capa == undefined) {
      return true;
    }
    if (
      this.capa.titulo.toLowerCase().indexOf(this.querySearch.toLowerCase()) >=
      0
    ) {
      return true;
    }
    for (var key in this.palabrasClave) {
      if (
        this.palabrasClave[key]
          .toLowerCase()
          .indexOf(this.querySearch.toLowerCase()) >= 0
      ) {
        return true;
      }
    }
    return false;
  };

  getAvailableTags = () => {
    return [];
  };
}

class ItemGroup extends ItemComposite {
  constructor(
    tab,
    nombre,
    seccion,
    peso,
    palabrasClave,
    descripcion,
    shortDesc
  ) {
    super(nombre, seccion, palabrasClave, descripcion);
    this.shortDesc = shortDesc;
    this.peso = peso;
    this.itemsComposite = {};  // por que se referencia a si mismo???
    this.tab = tab;
  }

  setItem = (itemComposite) => {
    this.itemsComposite[itemComposite.seccion] = itemComposite;
  };

  getId = () => {
    return ItemGroupPrefix + this.seccion;
  };

  getTab = () => {
    return this.tab;
  };

  getItemByName = (name) => {
    for (var key in this.itemsComposite) {
      if (this.itemsComposite[key].nombre == name) {
        return this.itemsComposite[key];
      }
    }

    return null;
  };

  ordenaItems = (a, b) => {
    var aOrden1 = a.peso;
    var bOrden1 = b.peso;
    var aOrden2 = a.titulo ? a.titulo.toLowerCase() : 0;
    var bOrden2 = b.titulo ? b.titulo.toLowerCase() : 0;
    if (aOrden1 < bOrden1) {
      return -1;
    } else if (aOrden1 > bOrden1) {
      return 1;
    } else if (aOrden2 < bOrden2) {
      return -1;
    } else if (aOrden2 > bOrden2) {
      return 1;
    }

    return 0;
  };

  getItemsSearched = () => {
    var itemsAux = new Array();
    for (var key in this.itemsComposite) {
      this.itemsComposite[key].setQuerySearch(
        this.tab.getId() == "" ? this.querySearch : this.tab.getSearchQuery()
      );
      if (this.itemsComposite[key].match() == true) {
        //Returns true on item match with querySearch string
        itemsAux.push(this.itemsComposite[key]);
      }
    }

    return itemsAux;
  };

  imprimir = () => {
    this.itemsStr = "";

    var itemsAux = this.getItemsSearched();
    itemsAux.sort(this.ordenaItems);

    for (var key in itemsAux) {
      this.itemsStr += itemsAux[key].imprimir();
    }
    return this.impresor.imprimir(this);
  };

  getCantidadCapasVisibles = () => {
    var iCapasVisibles = 0;
    for (var key in this.itemsComposite) {
      if (this.itemsComposite[key].getVisible() == true) {
        iCapasVisibles++;
      }
    }
    return iCapasVisibles;
  };

  muestraCantidadCapasVisibles = () => {
    var iCapasVisibles = this.getCantidadCapasVisibles();
    if (iCapasVisibles > 0) {
      $("#" + this.getId() + "-a").html(
        this.nombre +
          " <span class='active-layers-counter'>" +
          iCapasVisibles +
          "</span>"
      );
    } else {
      $("#" + this.getId() + "-a").html(this.nombre);
    }
  };

  hideAllLayers = () => {
    for (var key2 in this.itemsComposite) {
      var item = this.itemsComposite[key2];
      if (item.getVisible() == true) {
        item.showHide();
      }
    }
  };

  hideAllLayersExceptOne = (item) => {};

  getAvailableTags = () => {
    var availableTags = [];
    for (var key in this.itemsComposite) {
      availableTags = availableTags.concat(
        this.itemsComposite[key].getAvailableTags()
      );
    }
    return availableTags;
  };
}

class ItemGroupBaseMap extends ItemGroup {
  isBaseLayer = () => {
    return true;
  };

  hideAllLayers = () => {
    for (var key2 in this.itemsComposite) {
      var item = this.itemsComposite[key2];
      if (item.getVisible() == true) {
        item.showHide();
      }
    }
  };

  hideAllLayersExceptOne = (item) => {
    for (var key in this.itemsComposite) {
      if (
        this.itemsComposite[key].getVisible() == true &&
        item !== this.itemsComposite[key]
      ) {
        this.itemsComposite[key].showHide();
      }
    }
  };

  getAvailableTags = () => {
    return [];
  };
}

//Auxilary class for ItemGroupWMSSelector
class wmsSelector {
  constructor(
    id,
    name,
    title,
    source,
    service,
    version,
    featureInfoFormat,
    type
  ) {
    if (type == "wmslayer_mapserver") {
      this.capa = new CapaMapserver(
        name,
        title,
        null,
        source,
        service,
        version,
        null,
        null,
        null,
        null,
        null,
        null
      );
    } else {
      this.capa = new Capa(
        name,
        title,
        null,
        source,
        service,
        version,
        null,
        null,
        null,
        null,
        null,
        null
      );
    }
    this.id = id;
    this.featureInfoFormat = featureInfoFormat;
    this.type = type;
  }

  getId = () => {
    return this.id;
  };

  getTitle = () => {
    return this.capa.titulo;
  };
}

class ItemGroupWMSSelector extends ItemGroup {
  constructor(tab, name, section, keyWords, description) {
    super(tab, name, section, 0, keyWords, description, "");
    this.wmsSelectorList = {};
  }

  addWMS = (id, title, source, service, version, featureInfoFormat, type) => {
    this.wmsSelectorList[id] = new wmsSelector(
      id,
      title,
      source,
      service,
      version,
      featureInfoFormat,
      type
    );
  };
}

class Item extends ItemComposite {
  constructor(
    nombre,
    seccion,
    palabrasClave,
    descripcion,
    titulo,
    capa,
    callback,
    legendImg,
    legend,
    listType
  ) {
    super(nombre, seccion, palabrasClave, descripcion);
    this.titulo = titulo;
    this.capa = capa;
    this.capas = [capa];
    this.visible = false;
    this.legendImg = legendImg;
    this.legend = legend;
    this.callback = callback;
    this.listType = null;
  }

  getId = () => {
    var childId = "child-" + this.seccion;
    return childId;
  };

  getSVGFilenameForLegendImg = () => {
    if (this.titulo !== undefined) {
      return this.titulo.replace(":", "").replace("/", "") + ".svg";
    }
  };

  getVisible = () => {
    return this.visible;
  };

  setLegendImgPreformatted = (dir) => {
    this.legendImg = dir + this.getSVGFilenameForLegendImg();
  };

  setLegendImg = (img) => {
    this.legendImg = img;
  };

  setLegend = (img) => {
    this.legend = img;
  };

  getLegendImg = () => {
    return this.legendImg;
  };

  loadLayer = (capa, key) => {
    var tmp = Object.assign({}, capa); //Clonar el item para simular que solo tiene una unica capa
    tmp.nombre = capa.nombre;
    tmp.capa = capa.capas[key];
    switch (tmp.capa.servicio) {
      case "wms":
        loadWms(tmp.callback, tmp);
        break;
      case "wmts":
        loadWmts(tmp.callback, tmp);
        break;
      case "tms":
        loadMapaBase(tmp.capa.host, tmp.capa.nombre, tmp.capa.attribution);
        break;
      case "bing":
        loadMapaBaseBing(tmp.capa.key, tmp.capa.nombre, tmp.capa.attribution);
        break;
      case "geojson":
        loadGeojson(tmp.capa.host, tmp.nombre);
        break;
      default:
        break;
    }
  };

  showHide = () => {
    $("#" + this.getId()).toggleClass("active");

    if (
      this.seccion.includes("mapasbase0") &&
      !$("#" + this.getId()).hasClass("active")
    ) {
      $("#" + this.getId()).toggleClass("active");
    } //fixes main mapabase active bug by asking if its not activated.

    if (typeof this.callback == "string") {
      this.callback = eval(this.callback);
    }

    this.visible = !this.visible;
    this.capas[0].visible = this.visible;
    this.loadLayer(this, 0);

    //Recorrer todas las capas del item
    if (this.capas.length > 1) {
      const secondaryLayers = this.capas.slice(1, this.capas.length);
      for (var key in secondaryLayers) {
        if (this.capas[+key + 1].hasOwnProperty("visible")) {
          if (this.capas[+key + 1].visible !== this.visible) {
            this.capas[+key + 1].visible = this.visible;
          }
          this.loadLayer(this, +key + 1);
        } else {
          this.capas[+key + 1].visible = this.visible;
          if (this.visible) this.loadLayer(this, +key + 1);
        }
      }
    }
  };

  getLegendURL = () => {
    return this.capa.getLegendURL();
  };

  getAvailableTags = () => {
    var tagsAux = [this.capa.titulo];
    return tagsAux.concat(this.palabrasClave);
  };
}

class ItemsGetter {
  get = (gestorMenu) => {
    return gestorMenu.items;
  };
}

class ItemsGetterSearcher extends ItemsGetter {
  get = (gestorMenu) => {
    const impresorGroup = new ImpresorGrupoHTML();
    const impresorItem = new ImpresorItemHTML();

    //Instance an empty ItemGroup for no-tabs classes
    var groupAux = new ItemGroup(
      new Tab(""),
      "Resultado búsqueda",
      "searcher-",
      0,
      "",
      "",
      gestorMenu.getQuerySearch()
    );
    groupAux.setImpresor(impresorGroup);
    groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
    groupAux.setActive(true);

    //Iterate all items in gestorMenu
    var itemsToReturn = {};
    for (var key in gestorMenu.items) {
      var itemComposite = gestorMenu.items[key];
      if (gestorMenu.getQuerySearch() != "") {
        itemComposite.setQuerySearch(gestorMenu.getQuerySearch()); //Set query search for filtering items
        var itemsAux = itemComposite.getItemsSearched();
        for (var key2 in itemsAux) {
          groupAux.setItem(itemsAux[key2]);
        }
        itemsToReturn[groupAux.seccion] = groupAux;
      } else {
        itemsToReturn[itemComposite.seccion] = itemComposite;
      }
    }

    return itemsToReturn;
  };
}

class ItemsGetterSearcherWithTabs extends ItemsGetter {
  get = (gestorMenu) => {
    const impresorGroup = new ImpresorGrupoHTML();
    const impresorItem = new ImpresorItemHTML();

    //Instance an empty ItemGroup per tab (without items)
    var itemsGroups = {};
    for (var key in gestorMenu._tabs) {
      var groupAux = new ItemGroup(
        gestorMenu._tabs[key],
        "Resultado búsqueda",
        "searcher-" + gestorMenu._tabs[key].getId(),
        0,
        "",
        "",
        gestorMenu._tabs[key].getSearchQuery()
      );
      groupAux.setImpresor(impresorGroup);
      groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
      groupAux.setActive(true);
      itemsGroups[groupAux.seccion] = groupAux;
    }

    //Instance an empty ItemGroup for no-tabs classes
    var groupAux = new ItemGroup(
      new Tab(""),
      "Resultado búsqueda",
      "searcher-",
      0,
      "",
      "",
      gestorMenu.getQuerySearch()
    );
    groupAux.setImpresor(impresorGroup);
    groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
    groupAux.setActive(true);
    itemsGroups[groupAux.seccion] = groupAux;

    //Iterate all items in gestorMenu
    var itemsToReturn = {};
    for (var key in gestorMenu.items) {
      var itemComposite = gestorMenu.items[key];
      var tabAux = gestorMenu._tabs[itemComposite.getTab().getId()];
      if (tabAux != undefined && tabAux.getSearchQuery() != "") {
        itemComposite.setQuerySearch(tabAux.getSearchQuery()); //Set query search for filtering items
        var itemsAux = itemComposite.getItemsSearched();
        for (var key2 in itemsAux) {
          itemsGroups["searcher-" + tabAux.getId()].setItem(itemsAux[key2]);
        }
        itemsToReturn[itemsGroups["searcher-" + tabAux.getId()].seccion] =
          itemsGroups["searcher-" + tabAux.getId()];
      } else {
        itemsToReturn[itemComposite.seccion] = itemComposite;
      }
    }

    return itemsToReturn;
  };
}

export { ItemGroup};
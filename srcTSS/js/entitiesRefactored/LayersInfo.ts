class LayersInfo {
    constructor() {
      this.allowed_layers = null;
      this.customized_layers = null;
    }
  
    setAllowebLayers(allowed) {
      this.allowed_layers = allowed;
    }
  
    setCustomizedLayers(customized_layers) {
      this.customized_layers = customized_layers;
    }
  
    isAllowebLayer(layer_name) {
      if (this.allowed_layers == null) {
        return true;
      }
  
      for (var i = 0; i < this.allowed_layers.length; i++) {
        if (this.allowed_layers[i] == layer_name) return true;
      }
      return false;
    }
  
    get(_gestorMenu) {
      //You must redefine this method to get layers from other sources
      return null;
    }
  
    formatLayerTitle(layer_name, layer_title) {
      if (this.customized_layers == null) {
        return layer_title;
      }
      if (
        this.customized_layers[layer_name] &&
        this.customized_layers[layer_name]["new_title"]
      ) {
        return this.customized_layers[layer_name]["new_title"];
      }
      return layer_title;
    }
  
    formatLayerAbstract(layer_name, layer_abstract) {
      if (this.customized_layers == null) {
        return layer_abstract;
      }
      if (
        this.customized_layers[layer_name] &&
        this.customized_layers[layer_name]["new_abstract"]
      ) {
        return this.customized_layers[layer_name]["new_abstract"];
      }
      return layer_abstract;
    }
  }
  
  class LayersInfoWMS extends LayersInfo {
    constructor(
      host,
      service,
      version,
      tab,
      section,
      weight,
      name,
      short_abstract,
      feature_info_format,
      type,
      icons,
      customizedLayers,
      itemGroupPrinter
    ) {
      super();
      this.host = host;
      this.service = service;
      this.version = version;
      this.tab = tab;
      this.section = section;
      this.weight = weight;
      this.name = name;
      this.short_abstract = short_abstract;
      this.feature_info_format = feature_info_format;
      this.type = type;
      this.icons = icons || null;
      this.customizedLayers = customizedLayers == "" ? null : customizedLayers;
      this.itemGroupPrinter =
        itemGroupPrinter == "" ? new ImpresorGrupoHTML() : itemGroupPrinter;
  
      this._executed = false;
    }
  
    get(_gestorMenu) {
      if (this._executed == false) {
        this._executed = true; //Indicates that getCapabilities executed
  
        //If lazyInit and have custimized layers, print layer after wms loaded (for searcher)
        if (
          _gestorMenu.getLazyInitialization() == true &&
          this.customizedLayers != null
        ) {
          const impresorItem = new ImpresorItemHTML();
          var itemGroup = _gestorMenu.getItemGroupById(
            "lista-" + this.section
          );
          if (itemGroup != null) {
            for (var key in this.customizedLayers) {
              let title = this.customizedLayers[key]["new_title"] || null,
                legend = this.customizedLayers[key]["legend"] || null,
                keywords = this.customizedLayers[key]["new_keywords"] || null,
                abstract = this.customizedLayers[key]["new_abstract"] || null;
  
              if (this.type == "wmslayer_mapserver") {
                var capa = new CapaMapserver(
                  key,
                  title,
                  null,
                  this.host,
                  this.service,
                  this.version,
                  this.feature_info_format,
                  null,
                  null,
                  null,
                  null
                );
              } else {
                var capa = new Capa(
                  key,
                  title,
                  this.srs,
                  this.host,
                  this.service,
                  this.version,
                  this.feature_info_format,
                  keywords,
                  this.minx,
                  this.maxx,
                  this.miny,
                  this.maxy,
                  this.attribution,
                  legend
                );
                //var capa = new Capa(iName, iTitle, iSrs, thisObj.host, thisObj.service, thisObj.version, thisObj.feature_info_format, keywords, iMinX, iMaxX, iMinY, iMaxY, null, ilegendURL);
              }
              //Generate keyword array
              var keywordsAux = [];
              if (keywords != null && keywords != "") {
                keywordsAux = keywords.split(",");
                for (var keykeywordsAux in keywordsAux) {
                  keywordsAux[keykeywordsAux] =
                    keywordsAux[keykeywordsAux].trim();
                }
              }
  
              var item = new Item(
                capa.nombre,
                this.section + clearString(capa.nombre),
                keywordsAux,
                abstract,
                capa.titulo,
                capa,
                this.getCallback(),
                null
              );
  
              gestorMenu.setAllLayersAreDeclaredInJson(true);
              gestorMenu.setAvailableLayer(capa.nombre);
              item.setImpresor(impresorItem);
              if (itemGroup.getItemByName(this.section + capa.nombre) == null) {
                itemGroup.setItem(item);
              }
            }
          }
          _gestorMenu.removeLazyInitLayerInfoCounter(
            "lista-" + this.section
          );
          if (
            _gestorMenu.finishLazyInitLayerInfo("lista-" + this.section)
          ) {
            //Si ya cargó todas las capas solicitadas
            _gestorMenu.printOnlySection(this.section);
          }
        } else {
          this._parseRequest(_gestorMenu);
        }
      }
      bindZoomLayer();
      bindLayerOptions();
    }
  
    get_without_print(_gestorMenu) {
      this._parseRequest_without_print(_gestorMenu);
    }
  
    generateGroups(_gestorMenu) {
      const impresorGroup = this.itemGroupPrinter;
      const impresorItem = new ImpresorItemHTML();
  
      var thisObj = this;
  
      //Instance an empty ItemGroup (without items)
      var groupAux = new ItemGroup(
        thisObj.tab,
        thisObj.name,
        thisObj.section,
        thisObj.weight,
        "",
        "",
        thisObj.short_abstract
      );
      groupAux.setImpresor(impresorGroup);
      groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
      _gestorMenu.addItemGroup(groupAux);
    }
  
    /**
     * Parses geoserver capabilities and creates a menu.
     * @param {Object} _gestorMenu - The menu manager.
     */
    _parseRequest(_gestorMenu) {
      const impresorGroup = this.itemGroupPrinter;
      const impresorItem = new ImpresorItemHTML();
  
      const thisObj = this;
  
      // Determine the listType, defaulting to null if not provided
      let ilistType = this.tab.listType || null;
  
      // Construct the URL for fetching capabilities
      const serviceParams = `?service=${thisObj.service}&version=${thisObj.version}&request=GetCapabilities`;
      const host = thisObj.getHostOWS() + serviceParams;
  
      fetch(host)
        .then(response => response.text())
        .then(responseText => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(responseText, "text/xml");
  
          // Extract metadata from capabilities XML
          const capability = xmlDoc.querySelector("Capability");
          const keyword = xmlDoc.querySelector("Keyword").textContent;
          const abstract = xmlDoc.querySelectorAll("Abstract").textContent;
  
          // Extract layer information from capabilities XML
          const capaLyrList = capability.querySelector("Layer");
          const capaInfoList = capaLyrList.querySelectorAll("Layer");
  
          // Process each layer and create menu items
          const items = Array.from(capaInfoList)
            .filter(layer => {
              const iName = layer.querySelector("Name").textContent;
              return thisObj.isAllowebLayer(iName);
            })
            .map((layer, index) => {
              try {
                const iName = layer.querySelector("Name").textContent;
                const iTitle = layer.querySelector("Title").textContent;
                const iAbstract = layer.querySelectorAll("Abstract").textContent ?? "";
  
                // Extract keywords
                const keywordsHTMLList = layer.querySelectorAll("KeywordList keyword");
                const keywords = Array.from(keywordsHTMLList).map(keyword => keyword.textContent);
  
                // Extract bounding box information
                const iBoundingBox = layer.querySelector("BoundingBox");
                const iSrs = iBoundingBox ? (iBoundingBox.getAttribute("srs") || iBoundingBox.getAttribute("crs")) : null;
                const iMaxY = iBoundingBox ? iBoundingBox.getAttribute("maxy") : null;
                const iMinY = iBoundingBox ? iBoundingBox.getAttribute("miny") : null;
                const iMinX = iBoundingBox ? iBoundingBox.getAttribute("minx") : null;
                const iMaxX = iBoundingBox ? iBoundingBox.getAttribute("maxx") : null;
  
                // Extract legend URL
                const ilegendURL = thisObj.icons ? thisObj.icons[iName] : null;
  
                // Create appropriate capa object based on type
                const capa = thisObj.type === "wmslayer_mapserver"
                  ? new CapaMapserver(iName, iTitle, iSrs, thisObj.host, thisObj.service, thisObj.version, thisObj.feature_info_format, iMinX, iMaxX, iMinY, iMaxY)
                  : new Capa(iName, iTitle, iSrs, thisObj.host, thisObj.service, thisObj.version, thisObj.feature_info_format, keywords, iMinX, iMaxX, iMinY, iMaxY, null, ilegendURL);
  
                // Create menu item
                const item = new Item(capa.nombre, thisObj.section + index, keywords, iAbstract, capa.titulo, capa, thisObj.getCallback(), ilistType);
                item.setLegendImgPreformatted(_gestorMenu.getLegendImgPath());
                item.setImpresor(impresorItem);
                gestorMenu.setAvailableLayer(iName);
                return item;
              } catch (err) {
                console.error(`Error processing layer '${layer.querySelector("Name").textContent}':`, err);
                return null; // Return null for failed items
              }
            })
            .filter(item => item !== null);
  
          let groupAux;
          try {
            // Create item group
            groupAux = new ItemGroup(thisObj.tab, thisObj.name, thisObj.section, thisObj.weight, keyword, abstract, thisObj.short_abstract);
            groupAux.setImpresor(impresorGroup);
            groupAux.setObjDom(_gestorMenu.getItemsGroupDOM());
            items.forEach(item => groupAux.setItem(item));
          } catch (err) {
            console.error('Error creating item group', err);
            if (err.name == "ReferenceError") {
              groupAux = new ItemGroup(thisObj.tab, thisObj.name, thisObj.section, thisObj.weight, "", "", thisObj.short_abstract);
              groupAux.setImpresor(impresorGroup);
              groupAux.setObjDom(_gestorMenu.getItemsGroupDOM());
              items.forEach(item => groupAux.setItem(item));
            }
          }
  
          // Add item group to menu manager
          _gestorMenu.addItemGroup(groupAux);
  
          // Handle menu printing based on initialization mode
          if (_gestorMenu.getLazyInitialization() === true) {
            _gestorMenu.removeLazyInitLayerInfoCounter("lista-" + thisObj.section);
            if (_gestorMenu.finishLazyInitLayerInfo("lista-" + thisObj.section)) {
              // If all requested layers have been loaded
              _gestorMenu.printOnlySection(thisObj.section);
              gestorMenu.allLayersAreLoaded = true;
            }
          } else {
            _gestorMenu.addLayerInfoCounter();
            if (_gestorMenu.finishLayerInfo()) {
              // If all requested layers have been loaded
              _gestorMenu.printMenu();
              gestorMenu.allLayersAreLoaded = true;
            }
          }
          gestorMenu.printMenu();
        })
        .catch(error => {
          console.error("Error loading capabilities:", error);
        });
    }
  
    _parseRequest_without_print(_gestorMenu) {
      const impresorGroup = this.itemGroupPrinter;
      const impresorItem = new ImpresorItemHTML();
      const nuevo_impresor = new Menu_UI();
  
      var thisObj = this;
  
      var ilistType = null;
      if (this.tab.listType) {
        ilistType = this.tab.listType;
      }
  
      if (!$("#temp-menu").hasClass("temp")) {
        $("body").append(
          '<div id="temp-menu" class="temp" style="display:none"></div>'
        );
      }
  
      // Load geoserver Capabilities, if success Create menu and append to DOM
      $("#temp-menu").load(
        thisObj.getHostOWS() +
        "?service=" +
        thisObj.service +
        "&version=" +
        thisObj.version +
        "&request=GetCapabilities",
        function () {
          var capability = $("#temp-menu").find("capability");
          var keywordHtml = $("#temp-menu").find("Keyword");
          var keyword = "";
          if (keywordHtml.length > 0) {
            keyword = keywordHtml[0].innerText; // reads 1st keyword for filtering sections if needed
          }
          var abstractHtml = $("#temp-menu").find("Abstract");
          var abstract = "";
          if (abstractHtml.length > 0) {
            abstract = abstractHtml[0].innerText; // reads wms 1st abstract
          }
          var capas_layer = $("layer", capability);
          var capas_info = $("layer", capas_layer);
  
          var items = new Array();
  
          // create an object with all layer info for each layer
          capas_info.each(function (index, b) {
            var i = $(this);
            var iName = $("name", i).html();
            if (thisObj.isAllowebLayer(iName)) {
              var iTitle = $("title", i).html();
              iTitle = thisObj.formatLayerTitle(iName, iTitle);
              var iAbstract = $("abstract", i).html();
              iAbstract = thisObj.formatLayerAbstract(iName, iAbstract);
              var keywordsHTMLList = $("keywordlist", i).find("keyword");
              var keywords = [];
              $.each(keywordsHTMLList, function (i, el) {
                keywords.push(el.innerText);
              });
              var iBoundingBox = $("boundingbox", i);
              var iSrs = null;
              var iMaxY = null;
              var iMinY = null;
              var iMinX = null;
              var iMaxX = null;
              var ilegendURLaux = $("Style", i).html();
              let divi = document.createElement("div");
              let aux = null;
              divi.innerHTML = ilegendURLaux;
              /* if (divi.getElementsByTagName("onlineresource")) { // makes an error in some services
                        aux = divi.getElementsByTagName("onlineresource")[0].getAttribute("xlink:href");
                      } */
              var ilegendURL = aux;
  
              if (iBoundingBox.length > 0) {
                if (iBoundingBox[0].attributes.srs) {
                  var iSrs = iBoundingBox[0].attributes.srs.nodeValue;
                } else {
                  var iSrs = iBoundingBox[0].attributes.crs.nodeValue;
                }
                var iMaxY = iBoundingBox[0].attributes.maxy.nodeValue;
                var iMinY = iBoundingBox[0].attributes.miny.nodeValue;
                var iMinX = iBoundingBox[0].attributes.minx.nodeValue;
                var iMaxX = iBoundingBox[0].attributes.maxx.nodeValue;
              }
  
              if (thisObj.type == "wmslayer_mapserver") {
                var capa = new CapaMapserver(
                  iName,
                  iTitle,
                  iSrs,
                  thisObj.host,
                  thisObj.service,
                  thisObj.version,
                  thisObj.feature_info_format,
                  iMinX,
                  iMaxX,
                  iMinY,
                  iMaxY
                );
              } else {
                var capa = new Capa(
                  iName,
                  iTitle,
                  iSrs,
                  thisObj.host,
                  thisObj.service,
                  thisObj.version,
                  thisObj.feature_info_format,
                  keywords,
                  iMinX,
                  iMaxX,
                  iMinY,
                  iMaxY,
                  null,
                  ilegendURL
                );
                gestorMenu.layersDataForWfs[capa.nombre] = {
                  name: capa.nombre,
                  section: capa.titulo,
                  host: capa.host,
                };
              }
              var item = new Item(
                capa.nombre,
                thisObj.section + index,
                keywords,
                iAbstract,
                capa.titulo,
                capa,
                thisObj.getCallback(),
                ilistType
              );
              item.setLegendImgPreformatted(_gestorMenu.getLegendImgPath());
              item.setImpresor(impresorItem);
              items.push(item);
              gestorMenu.setAvailableLayer(iName);
            }
          });
  
          var groupAux;
          try {
            var groupAux = new ItemGroup(
              thisObj.tab,
              thisObj.name,
              thisObj.section,
              thisObj.weight,
              keyword,
              abstract,
              thisObj.short_abstract
            );
            groupAux.setImpresor(impresorGroup);
            groupAux.setObjDom(_gestorMenu.getItemsGroupDOM());
            for (var i = 0; i < items.length; i++) {
              groupAux.setItem(items[i]);
            }
          } catch (err) {
            if (err.name == "ReferenceError") {
              var groupAux = new ItemGroup(
                thisObj.tab,
                thisObj.name,
                thisObj.section,
                thisObj.weight,
                "",
                "",
                thisObj.short_abstract
              );
              groupAux.setImpresor(impresorGroup);
              groupAux.setObjDom(_gestorMenu.getItemsGroupDOM());
              for (var i = 0; i < items.length; i++) {
                groupAux.setItem(items[i]);
              }
            }
          }
  
          _gestorMenu.addItemGroup(groupAux);
  
          if (_gestorMenu.getLazyInitialization() == true) {
            _gestorMenu.removeLazyInitLayerInfoCounter(
              "lista-" + thisObj.section
            );
            if (
              _gestorMenu.finishLazyInitLayerInfo(
                "lista-" + thisObj.section
              )
            ) {
              //Si ya cargó todas las capas solicitadas
              _gestorMenu.printOnlySection(thisObj.section);
  
              //
              gestorMenu.allLayersAreLoaded = true;
            }
          } else {
            _gestorMenu.addLayerInfoCounter();
            if (_gestorMenu.finishLayerInfo()) {
              //Si ya cargó todas las capas solicitadas
              _gestorMenu.printMenu();
  
              gestorMenu.allLayersAreLoaded = true;
            }
          }
  
          nuevo_impresor.addLayers_combobox(groupAux);
          document.getElementById("temp-menu").innerHTML = "";
          return;
        }
      );
    }
  
    getHostOWS() {
      //Define GetCapabilities host endpoint
      /* var host = this.host + '/ows';
          if (this.type == 'wmslayer_mapserver') {
              host = this.host;
          } */
      let host = this.host;
      if (
        this.service === "wms" &&
        host.includes("/geoserver") &&
        !host.endsWith("/wms")
      ) {
        host += "/wms";
      }
      return host;
    }
  
    getCallback() {
      //Define wich function handle onClick event
      var onClickHandler = "loadWmsTpl";
      return onClickHandler;
    }
  }
  
  class LayersInfoWMTS extends LayersInfoWMS {
    constructor(
      host,
      service,
      version,
      tab,
      section,
      weight,
      name,
      short_abstract,
      feature_info_format,
      type,
      customizedLayers,
      itemGroupPrinter
    ) {
      super();
      this.host = host;
      this.service = service;
      this.version = version;
      this.tab = tab;
      this.section = section;
      this.weight = weight;
      this.name = name;
      this.short_abstract = short_abstract;
      this.feature_info_format = feature_info_format;
      this.type = type;
      this.customizedLayers = customizedLayers == "" ? null : customizedLayers;
      this.itemGroupPrinter =
        itemGroupPrinter == "" ? new ImpresorGrupoHTML() : itemGroupPrinter;
      this._executed = false;
    }
  
    get(_gestorMenu) {
      if (this._executed == false) {
        this._executed = true; //Indicates that getCapabilities executed
  
        //If lazyInit and have custimized layers, print layer after wms loaded (for searcher)
        if (
          _gestorMenu.getLazyInitialization() == true &&
          this.customizedLayers != null
        ) {
          const impresorItem = new ImpresorItemHTML();
          var itemGroup = _gestorMenu.getItemGroupById(
            "lista-" + this.section
          );
          if (itemGroup != null) {
            for (var key in this.customizedLayers) {
              let title = this.customizedLayers[key]["new_title"] || this.title,
                legend = this.customizedLayers[key]["legend"] || null,
                keywords = this.customizedLayers[key]["new_keywords"],
                abstract = this.customizedLayers[key]["new_abstract"];
  
              if (this.type == "wmslayer_mapserver") {
                var capa = new CapaMapserver(
                  key,
                  title,
                  null,
                  this.host,
                  this.service,
                  this.version,
                  this.feature_info_format,
                  null,
                  null,
                  null,
                  null
                );
              } else {
                var capa = new Capa(
                  key,
                  title,
                  this.srs,
                  this.host,
                  this.service,
                  this.version,
                  this.feature_info_format,
                  null,
                  this.minx,
                  this.maxx,
                  this.miny,
                  this.maxy,
                  this.attribution,
                  legend
                );
              }
  
              //Generate keyword array
              var keywordsAux = [];
              if (keywords != null && keywords != "") {
                keywordsAux = keywords.split(",");
                for (var keykeywordsAux in keywordsAux) {
                  keywordsAux[keykeywordsAux] =
                    keywordsAux[keykeywordsAux].trim();
                }
              }
  
              var item = new Item(
                capa.nombre,
                this.section + clearString(capa.nombre),
                keywordsAux,
                abstract,
                capa.titulo,
                capa,
                this.getCallback(),
                null
              );
  
              gestorMenu.setAllLayersAreDeclaredInJson(true);
              gestorMenu.setAvailableLayer(capa.nombre);
              gestorMenu.setAvailableWmtsLayer(capa.nombre);
  
              item.setImpresor(impresorItem);
              if (itemGroup.getItemByName(this.section + capa.nombre) == null) {
                itemGroup.setItem(item);
              }
            }
          }
          _gestorMenu.removeLazyInitLayerInfoCounter(
            "lista-" + this.section
          );
          if (
            _gestorMenu.finishLazyInitLayerInfo("lista-" + this.section)
          ) {
            //Si ya cargó todas las capas solicitadas
            _gestorMenu.printOnlySection(this.section);
          }
        } else {
          this._parseRequest(_gestorMenu);
        }
      }
  
      bindZoomLayer();
      bindLayerOptions();
    }
  
    generateGroups(_gestorMenu) {
      const impresorGroup = this.itemGroupPrinter;
      const impresorItem = new ImpresorItemHTML();
  
      var thisObj = this;
  
      var groupAux = new ItemGroup(
        thisObj.tab,
        thisObj.name,
        thisObj.section,
        thisObj.weight,
        "",
        "",
        thisObj.short_abstract
      );
      groupAux.setImpresor(impresorGroup);
      groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
      _gestorMenu.addItemGroup(groupAux);
    }
  
    _parseRequest(_gestorMenu) {
      const impresorGroup = this.itemGroupPrinter;
      const impresorItem = new ImpresorItemHTML();
  
      var thisObj = this;
  
      if (!$("#temp-menu").hasClass("temp")) {
        $("body").append(
          '<div id="temp-menu" class="temp" style="display:none"></div>'
        );
      }
  
      // Load geoserver Capabilities, if success Create menu and append to DOM
      let serviceParams = `?service=${thisObj.service}&version=${thisObj.version}&request=GetCapabilities`;
      let host = thisObj.getHost() + serviceParams;
      $("#temp-menu").load(
        host,
        function () {
          var content = $("#temp-menu").find("contents");
          var keywordHtml = $("#temp-menu").find("Keyword");
          var keyword = "";
          if (keywordHtml.length > 0) {
            keyword = keywordHtml[0].innerText; // reads 1st keyword for filtering sections if needed
          }
          var abstractHtml = $("#temp-menu").find("Abstract");
          var abstract = "";
          if (abstractHtml.length > 0) {
            abstract = abstractHtml[0].innerText; // reads wms 1st abstract
          }
          var capas_layer = $("layer", content);
          var items = new Array();
  
          capas_layer.each(function (index, b) {
            var i = $(this);
  
            var iName = $("ows\\:identifier", i).html();
            if (thisObj.isAllowebLayer(iName)) {
              var iTitle = $("ows\\:title", i).html();
              iTitle = thisObj.formatLayerTitle(iName, iTitle);
              var iAbstract = $("ows\\:abstract", i).html();
              iAbstract = thisObj.formatLayerAbstract(iName, iAbstract);
              var keywordsHTMLList = $("keywordlist", i).find("keyword");
              var keywords = [];
              $.each(keywordsHTMLList, function (i, el) {
                keywords.push(el.innerText);
              });
              let iBoundingBox = $("ows\\:wgs84boundingbox", i),
                iSrs = null,
                lowerCorner =
                  iBoundingBox[0].firstElementChild.innerText.split(" "),
                upperCorner =
                  iBoundingBox[0].lastElementChild.innerText.split(" "),
                iMaxY = lowerCorner[1],
                iMaxX = lowerCorner[0],
                iMinY = upperCorner[1],
                iMinX = upperCorner[0];
  
              if (thisObj.type == "wmslayer_mapserver") {
                var capa = new CapaMapserver(
                  iName,
                  iTitle,
                  iSrs,
                  thisObj.host,
                  thisObj.service,
                  thisObj.version,
                  thisObj.feature_info_format,
                  iMinX,
                  iMaxX,
                  iMinY,
                  iMaxY
                );
              } else {
                var capa = new Capa(
                  iName,
                  iTitle,
                  iSrs,
                  thisObj.host,
                  thisObj.service,
                  thisObj.version,
                  thisObj.feature_info_format,
                  keywords,
                  iMinX,
                  iMaxX,
                  iMinY,
                  iMaxY
                );
              }
              var item = new Item(
                capa.nombre,
                thisObj.section + index,
                keywords,
                iAbstract,
                capa.titulo,
                capa,
                thisObj.getCallback(),
                null
              );
              item.setLegendImgPreformatted(_gestorMenu.getLegendImgPath());
              item.setImpresor(impresorItem);
              items.push(item);
              gestorMenu.setAvailableLayer(iName);
              gestorMenu.setAvailableWmtsLayer(iName);
            }
          });
  
          var groupAux;
          try {
            var groupAux = new ItemGroup(
              thisObj.tab,
              thisObj.name,
              thisObj.section,
              thisObj.weight,
              keyword,
              abstract,
              thisObj.short_abstract
            );
            groupAux.setImpresor(impresorGroup);
            groupAux.setObjDom(_gestorMenu.getItemsGroupDOM());
            for (var i = 0; i < items.length; i++) {
              groupAux.setItem(items[i]);
            }
          } catch (err) {
            if (err.name == "ReferenceError") {
              var groupAux = new ItemGroup(
                thisObj.tab,
                thisObj.name,
                thisObj.section,
                thisObj.weight,
                "",
                "",
                thisObj.short_abstract
              );
              groupAux.setImpresor(impresorGroup);
              groupAux.setObjDom(_gestorMenu.getItemsGroupDOM());
              for (var i = 0; i < items.length; i++) {
                groupAux.setItem(items[i]);
              }
            }
          }
  
          _gestorMenu.addItemGroup(groupAux);
  
          if (_gestorMenu.getLazyInitialization() == true) {
            _gestorMenu.removeLazyInitLayerInfoCounter(
              "lista-" + thisObj.section
            );
            if (
              _gestorMenu.finishLazyInitLayerInfo(
                "lista-" + thisObj.section
              )
            ) {
              //Si ya cargó todas las capas solicitadas
              _gestorMenu.printOnlySection(thisObj.section);
  
              //
              gestorMenu.allLayersAreLoaded = true;
            }
          } else {
            _gestorMenu.addLayerInfoCounter();
            if (_gestorMenu.finishLayerInfo()) {
              //Si ya cargó todas las capas solicitadas
              _gestorMenu.printMenu();
  
              //
              gestorMenu.allLayersAreLoaded = true;
            }
          }
  
          return;
        }
      );
    }
  
    getHost() {
      /* //Define GetCapabilities host endpoint
          var host = this.host + '/gwc/service/wmts'; */
      let host = this.host;
      if (host.includes("/geoserver") && !host.endsWith("/wmts")) {
        host += "/gwc/service/wmts";
      }
      return host;
    }
  
    getCallback() {
      //Define wich function handle onClick event
      var onClickHandler = "loadWmsTpl";
      return onClickHandler;
    }
  }
  
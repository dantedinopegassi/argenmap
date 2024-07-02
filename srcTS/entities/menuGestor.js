class GestorMenu {
    constructor() {
      this.items = {};
      this.plugins = {};
      this.pluginsCount = 0;
      this.pluginsLoading = 0;
      this.menuDOM = "";
      this.loadingDOM = "";
      this.layersInfo = new Array();
      this.legendImgPath = "";
      this.itemsGroupDOM = "";
      this.printCallback = null;
      this.querySearch = "";
      this.showSearcher = false;
      this.basemapSelected = null;
      this.baseMapDependencies = {};
  
      this.allLayersAreLoaded = false;
      this.availableWmtsLayers = [];
      this.availableLayers = [];
      this.availableBaseLayers = [];
      this.activeLayers = [];
      this.layersDataForWfs = {};
      this.allLayersAreDeclaredInJson = false;
  
      this._existsIndexes = new Array(); //Identificador para evitar repetir ID de los items cuando provinen de distintas fuentes
      this._getLayersInfoCounter = 0;
      this._getLazyInitLayersInfoCounter = {};
      this._tabs = {};
      this._selectedTab = null;
      this._lazyInitialization = false;
      this._itemsGetter = new ItemsGetter();
      this._layersJoin = null;
      this._folders = {};
    }
  
    setBaseMapDependencies(baseLayers) {
      const baseMapDependencies = {};
      baseLayers.forEach((bLayer) => {
        baseMapDependencies[bLayer.nombre] = bLayer.hasOwnProperty("isOpenWith")
          ? bLayer.isOpenWith
          : null;
      });
      this.baseMapDependencies = baseMapDependencies;
    }
  
    setAvailableLayer(layer_id) {
      this.availableLayers.push(layer_id);
    }
  
    setAvailableWmtsLayer(layer_id) {
      this.availableWmtsLayers.push(layer_id);
    }
  
    setAvailableBaseLayer(layer_id) {
      this.availableBaseLayers.push(layer_id);
    }
  
    setAllLayersAreDeclaredInJson(value) {
      this.allLayersAreDeclaredInJson = value;
    }
  
    getAvailableLayers() {
      return this.availableLayers;
    }
  
    setLayersDataForWfs() {
      for (const itemKey in this.items) {
        if (itemKey !== "mapasbase") {
          const item = this.items[itemKey];
          Object.values(item.itemsComposite).forEach((compositeItem) => {
            compositeItem.capas.forEach((capa) => {
              this.layersDataForWfs[capa.nombre] = {
                name: capa.nombre,
                section: item.seccion,
                host: capa.host,
              };
            });
          });
        }
      }
    }
  
    getActiveLayersWithoutBasemap() {
      // Filter active layers to exclude base layers
      const activeLayers = this.activeLayers.filter((layer) => {
        return !this.availableBaseLayers.includes(layer);
      });
      return Object.keys(this.layersDataForWfs).length === 0
        ? []
        : activeLayers.map((activeLayer) => {
            if (
              this.layersDataForWfs.hasOwnProperty(activeLayer) &&
              this.layersDataForWfs[activeLayer]
            ) {
              return this.layersDataForWfs[activeLayer];
            }
          });
    }
  
    addActiveLayer(layer_id) {
      const idx = this.activeLayers.findIndex((layer) => layer === layer_id);
      if (idx === -1) this.activeLayers.push(layer_id);
    }
  
    removeActiveLayer(layer_id) {
      const idx = this.activeLayers.findIndex((layer) => layer === layer_id);
      if (idx > -1) this.activeLayers.splice(idx, 1);
    }
  
    layerIsActive(layer_id) {
      return this.activeLayers.findIndex((layer) => layer === layer_id) > -1;
    }
  
    layerIsWmts(layer_id) {
      return (
        this.availableWmtsLayers.findIndex((layer) => layer === layer_id) > -1
      );
    }
  
    layerIsValid(layer_id) {
      const idx1 =
        this.availableLayers.findIndex((layer) => layer === layer_id) > -1;
      const idx2 =
        this.availableBaseLayers.findIndex((layer) => layer === layer_id) > -1;
      return idx1 || idx2;
    }
  
    getActiveLayers() {
      return this.activeLayers;
    }
  
    getLayerIdByName(layerName) {
      for (const section in this.items) {
        if (this.items[section].hasOwnProperty("itemsComposite")) {
          if (this.items[section].getItemByName(layerName))
            return this.items[section].getItemByName(layerName).getId();
        }
      }
    }
  
    getLayerNameById(layerId) {
      for (var key in this.items) {
        var itemComposite = this.items[key];
        for (var key2 in itemComposite.itemsComposite) {
          var item = itemComposite.itemsComposite[key2];
          if (item.getId() === layerId) {
            return item.nombre;
          }
        }
      }
    }
  
    baseMapIsInUrl(layers) {
      for (const layer of layers) {
        if (this.availableBaseLayers.findIndex((lyr) => lyr === layer) > -1) {
          return true;
        }
      }
      return false;
    }
  
    loadInitialLayers(urlInteraction) {
      $("#" + this.basemapSelected).toggleClass("active");
  
      if (this.allLayersAreDeclaredInJson) {
        urlInteraction.layers.forEach((layer) => {
          if (this.layerIsValid(layer)) {
            this.muestraCapa(this.getLayerIdByName(layer));
          }
        });
        urlInteraction.layers = this.getActiveLayers();
        this.activeLayersHasBeenUpdated = () => {
          urlInteraction.layers = this.getActiveLayers();
        };
        this.setLayersDataForWfs();
        return;
      }
  
      const initialInterval = setInterval(() => {
        if (this.allLayersAreLoaded) {
          window.clearInterval(initialInterval);
  
          let validLayersLoaded = 0;
          let validLayers = [];
          let rejectedLayers = [];
          urlInteraction.layers.forEach((layer) => {
            if (this.layerIsValid(layer)) {
              validLayers.push(layer);
            } else {
              rejectedLayers.push(layer);
            }
          });
  
          validLayers.forEach((layer) => {
            const interval = setInterval(() => {
              if (this.layerIsActive(layer)) {
                window.clearInterval(interval);
                validLayersLoaded++;
              } else {
                window.clearInterval(interval);
                validLayersLoaded++;
                this.muestraCapa(this.getLayerIdByName(layer));
              }
            }, 200);
          });
  
          const lastInterval = setInterval(() => {
            if (validLayersLoaded === validLayers.length) {
              urlInteraction.layers = this.getActiveLayers();
              this.activeLayersHasBeenUpdated = () => {
                urlInteraction.layers = this.getActiveLayers();
              };
              this.setLayersDataForWfs();
              window.clearInterval(lastInterval);
  
              this.printMenu();
  
              //last chances to load layers
              if (rejectedLayers.length > 0) {
                let tryNumber = 0;
                const intervalId = setInterval(() => {
                  if (rejectedLayers.length === 0 || tryNumber === 15) {
                    window.clearInterval(intervalId);
                    console.log("Rejected layers: ", rejectedLayers);
                  } else {
                    tryNumber++;
                    const validLayers = [];
                    for (let i = 0; i < rejectedLayers.length; i++) {
                      if (this.layerIsValid(rejectedLayers[i])) {
                        validLayers.unshift(i);
                        this.muestraCapa(
                          this.getLayerIdByName(rejectedLayers[i])
                        );
                      }
                    }
                    validLayers.forEach((vL) => {
                      rejectedLayers.splice(vL, 1);
                    });
                  }
                  this.printMenu();
                }, 1000);
              }
            }
          }, 100);
        }
      }, 500);
    }
  
    cleanAllLayers() {
      //Desactiva TODOS los layers activos.
      let layers = this.activeLayers.filter((layer) => {
        return !this.availableBaseLayers.includes(layer);
      });
      this.toggleLayers(layers);
      hideAddedLayers();
      hideAddedLayersCounter();
    }
  
    toggleLayers(layers) {
      layers.forEach((layer) => {
        if (this.layerIsValid(layer))
          this.muestraCapa(this.getLayerIdByName(layer));
      });
    }
  
    setMenuDOM(menuDOM) {
      this.menuDOM = menuDOM;
    }
  
    getMenuDOM() {
      return $(this.menuDOM);
    }
  
    setLoadingDOM(loadingDOM) {
      this.loadingDOM = loadingDOM;
    }
  
    getLoadingDOM() {
      return $(this.loadingDOM);
    }
  
    setLegendImgPath(legendImgPath) {
      this.legendImgPath = legendImgPath;
    }
  
    getLegendImgPath() {
      return this.legendImgPath;
    }
  
    getItemsGroupDOM() {
      return this.menuDOM;
    }
  
    setPrintCallback(printCallback) {
      this.printCallback = printCallback;
    }
  
    getLazyInitialization() {
      return this._lazyInitialization;
    }
  
    setLazyInitialization(lazyInit) {
      this._lazyInitialization = lazyInit;
    }
  
    addLayerInfoCounter() {
      this._getLayersInfoCounter++;
    }
  
    setShowSearcher(show_searcher) {
      this.showSearcher = show_searcher;
    }
  
    getShowSearcher() {
      return this.showSearcher;
    }
  
    getQuerySearch() {
      return this.querySearch;
    }
  
    setQuerySearch(q) {
      this.querySearch = q;
      this.setSelectedTabSearchQuery(q);
  
      //Select wich ItemsGetter strategy need
      if (q == "") {
        this._itemsGetter = new ItemsGetter();
      } else if (this._hasMoreTabsThanOne() == true) {
        this._itemsGetter = new ItemsGetterSearcherWithTabs();
      } else {
        this._itemsGetter = new ItemsGetterSearcher();
      }
    }
  
    setLayersJoin(layersJoin) {
      this._layersJoin = layersJoin;
    }
  
    addLazyInitLayerInfoCounter(sectionId) {
      if (this._getLazyInitLayersInfoCounter[sectionId] == undefined) {
        this._getLazyInitLayersInfoCounter[sectionId] = 1;
      } else {
        this._getLazyInitLayersInfoCounter[sectionId]++;
      }
    }
  
    setFolders(folders) {
      this._folders = folders;
    }
  
    /* 
      getBasemapSelected() {
          return this.basemapSelected;
      } 
      */
    getActiveBasemap() {
      let activeBasemap;
      Object.keys(baseLayers).forEach((bl) => {
        if (gestorMenu.getActiveLayers().includes(bl)) {
          activeBasemap = bl;
        }
      });
      return activeBasemap;
    }
  
    setBasemapSelected(basemapSelected) {
      this.basemapSelected = basemapSelected;
    }
  
    setLastBaseMapSelected(lastBaseMapSelected) {
      this.lastBaseMapSelected = lastBaseMapSelected;
    }
  
    removeLazyInitLayerInfoCounter(sectionId) {
      this._getLazyInitLayersInfoCounter[sectionId]--;
    }
  
    finishLayerInfo() {
      return this._getLayersInfoCounter == this.layersInfo.length;
    }
  
    finishLazyInitLayerInfo(sectionId) {
      return this._getLazyInitLayersInfoCounter[sectionId] == 0;
    }
  
    addLayersInfo(layersInfo) {
      this.layersInfo.push(layersInfo);
    }
  
    addTab(tab) {
      if (tab.getExtendedId() != EmptyTab) this._tabs[tab.getId()] = tab;
    }
  
    setSelectedTab(tabId) {
      this._selectedTab = this._tabs[tabId];
    }
  
    setSelectedTabSearchQuery(q) {
      if (this._selectedTab != null) {
        this._selectedTab.setSearchQuery(q);
        this._selectedTab.itemsGetter = this._itemsGetter;
      }
    }
  
    getItemGroupById(id) {
      for (var key in this.items) {
        if (this.items[key].getId() == id) {
          return this.items[key];
        }
      }
  
      return null;
    }
  
    addItemGroup(itemGroup) {
      var itemAux;
      if (!this.items[itemGroup.seccion] || itemGroup.isBaseLayer()) {
        //itemGroup.isBaseLayer() avoid to repeat base layer into selector
        itemAux = itemGroup;
        this._existsIndexes[itemGroup.seccion] = 0;
      } else {
        itemAux = this.items[itemGroup.seccion];
        this._existsIndexes[itemGroup.seccion] =
          Object.keys(itemAux.itemsComposite).length + 1; //Si ya existe el itemGroup pero se agregan datos de otras fuentes, esto evita que se repitan los ID
      }
      for (var key in itemGroup.itemsComposite) {
        if (this._existsIndexes[itemGroup.seccion] > 0) {
          //Para modificar item.seccion para no duplicar el contenido
          itemGroup.itemsComposite[key].seccion +=
            this._existsIndexes[itemGroup.seccion];
        }
        itemAux.setItem(itemGroup.itemsComposite[key]);
      }
      this.items[itemGroup.seccion] = itemAux;
    }
  
    addPlugin(pluginName, url, callback) {
      var pluginAux;
      if (!this.pluginExists(pluginName)) {
        if (typeof callback === "function") {
          // Create plugin with callback if need to
          pluginAux = new Plugin(pluginName, url, callback);
          this.plugins[pluginAux.name] = pluginAux;
          this.pluginsCount++;
          this.pluginsLoading++;
          $.getScript(url, function (data, textStatus, jqxhr) {
            if (textStatus == "success") {
              pluginAux.setStatus("ready");
              gestorMenu.pluginsLoading--;
              pluginAux.triggerLoad();
              pluginAux.callback();
            }
          }).fail(function (jqxhr, settings, exception) {
            pluginAux.setStatus("fail");
            console.log("Error: " + jqxhr.status);
            gestorMenu.pluginsCount--;
            gestorMenu.pluginsLoading--;
          });
        } else {
          // Create a plugin with no callback
          pluginAux = new Plugin(pluginName, url, null);
          this.plugins[pluginAux.name] = pluginAux;
          this.pluginsCount++;
          this.pluginsLoading++;
          $.getScript(url, function (data, textStatus, jqxhr) {
            if (textStatus == "success") {
              pluginAux.setStatus("ready");
              gestorMenu.pluginsLoading--;
              pluginAux.triggerLoad();
            }
          }).fail(function (jqxhr, settings, exception) {
            pluginAux.setStatus("fail");
            console.log("Error: " + jqxhr.status);
            gestorMenu.pluginsCount--;
            gestorMenu.pluginsLoading--;
          });
        }
      } else {
        return false;
      }
    }
  
    deletePlugin(pluginName) {
      if (this.pluginExists(pluginName)) {
        delete this.plugins[pluginName];
        return true;
      }
      return false;
    }
  
    pluginExists(pluginName) {
      return this.plugins[pluginName] ? true : false;
    }
  
    ordenaPorPeso(a, b) {
      var aName = a.peso;
      var bName = b.peso;
      return aName < bName ? -1 : aName > bName ? 1 : 0;
    }
  
    // imprime el menu de capas
    executeLayersInfo() {
      if (this.getLazyInitialization() == true) {
        for (var key in this.layersInfo) {
          this.layersInfo[key].generateGroups(this);
        }
        this.printMenu();
  
        var thisObj = this;
  
        //Capture show.bs.collapse menu event
        $(function () {
          $(".collapse").on("show.bs.collapse", function (e) {
            if ($(this).is(e.target)) {
              var showingId = this.id;
              if ($("#" + showingId + " > div").html() == "") {
                $("#" + showingId + " > div").html(
                  '<div class="loading"><img src="src/styles/images/loading.svg" style="width:35px"></div>'
                );
              }
              for (var key in thisObj.layersInfo) {
                if (thisObj.layersInfo[key].section == showingId) {
                  thisObj.addLazyInitLayerInfoCounter(showingId);
                  thisObj.layersInfo[key].get(thisObj);
                }
              }
            }
          });
        });
      } else {
        for (var key in this.layersInfo) {
          this.layersInfo[key].get(this);
        }
      }
    }
  
    _countTabs() {
      //return this._tabs.length;
      return Object.keys(this._tabs).length;
    }
  
    _hasMoreTabsThanOne() {
      return this._countTabs() > 1;
    }
  
    _formatTabName(tab) {
      return tab.replace(EmptyTab, "");
    }
  
    processLayersJoin() {
      if (this._layersJoin != null) {
        //Buscar el item al cual incluirle capas
        for (var keyJoin in this._layersJoin) {
          var item = this.items[this._layersJoin[keyJoin].seccion];
          if (item) {
            for (var keyItem in item.itemsComposite) {
              if (
                item.itemsComposite[keyItem].capa.host ==
                  this._layersJoin[keyJoin].host &&
                item.itemsComposite[keyItem].capa.nombre ==
                  this._layersJoin[keyJoin].layer
              ) {
                //Busca las capas a incluir
                for (var keyJoinInt in this._layersJoin[keyJoin].joins) {
                  var itemInt =
                    this.items[
                      this._layersJoin[keyJoin].joins[keyJoinInt].seccion
                    ];
                  if (itemInt) {
                    for (var keyItemInt in itemInt.itemsComposite) {
                      if (
                        itemInt.itemsComposite[keyItemInt].capa.host ==
                          this._layersJoin[keyJoin].joins[keyJoinInt].host &&
                        itemInt.itemsComposite[keyItemInt].capa.nombre ==
                          this._layersJoin[keyJoin].joins[keyJoinInt].layer
                      ) {
                        item.itemsComposite[keyItem].capas = item.itemsComposite[
                          keyItem
                        ].capas.concat(itemInt.itemsComposite[keyItemInt].capas);
                        delete itemInt.itemsComposite[keyItemInt];
                        if (item.itemsComposite[keyItem].visible) {
                          if (!isNaN(keyItemInt)) {
                            item.itemsComposite[keyItem].capas[
                              keyItemInt
                            ].visible = true;
                            item.itemsComposite[keyItem].loadLayer(
                              item.itemsComposite[keyItem],
                              keyItemInt
                            );
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  
    //llama a imprimir el menu de capas
    print() {
      this.executeLayersInfo();
    }
  
    _printSearcher() {
      if (this.getShowSearcher()) {
        const formContent = `
          <form id='searchForm' class='searchFormBtn sticky' onSubmit='mainMenuSearch(event)'>
            <div class='center-flex'>
              <div class='has-feedback has-clear formBtns center-flex'>
                <input type='text' class='form-control ui-input-text' id='q' name='q' value='${this.getQuerySearch()}' placeholder='Buscar capa'>
                <button onClick='reloadMenu()' class='ui-btn ui-btn-primary btn-reset-layers form-control-clear glyphicon glyphicon-remove-circle form-control-feedback hidden'></button>
              </div>
              <button class='ui-btn ui-btn-primary btn-search' type='submit'><span class='glyphicon glyphicon-search' aria-hidden='true'></span></button>
              <button class='ui-btn ui-btn-primary btn-search' id='cleanTrash' type='button' onClick='gestorMenu.cleanAllLayers()' title='Desactivar Capas'><span class='glyphicon glyphicon-trash'></span></button>
            </div>
          </form>`;
  
        return formContent;
      }
    }
  
    getAvailableTags() {
      var availableTags = [];
      for (var key in this.items) {
        var itemComposite = this.items[key];
        if (
          this._hasMoreTabsThanOne() == false ||
          itemComposite.getTab().getId() == this._selectedTab.getId()
        ) {
          //If not use tabs get all tags or just get available tags from item in selected tab
          availableTags = availableTags.concat(itemComposite.getAvailableTags());
        }
      }
      let uniqueTags = [...new Set(availableTags)]; //Remove Duplicates from Tags array
      return uniqueTags;
    }
  
    _printWithTabs() {
      var aSections = {};
  
      //Set initial html printing for all tabs
      for (var key in this._tabs) {
        if (this._selectedTab == null) {
          this.setSelectedTab(this._tabs[key].id);
          var sClassAux = "active";
        } else if (this._selectedTab.getId() == this._tabs[key].id) {
          var sClassAux = "active";
        }
        aSections[this._tabs[key].getExtendedId()] = [];
        aSections[this._tabs[key].getExtendedId()].push(
          "<div role='tabpanel' class='tab-pane " +
            sClassAux +
            "' id='" +
            this._tabs[key].getExtendedId() +
            "'>"
        );
        aSections[this._tabs[key].getExtendedId()].push(
          this._tabs[key].getInitialPrint()
        );
        sClassAux = "";
      }
  
      this.getMenuDOM().html(sInitialHTML);
  
      var itemsAux = new Array();
      var itemsIterator = this._itemsGetter.get(this);
      for (var key in itemsIterator) {
        itemsAux.push(itemsIterator[key]);
      }
      itemsAux.sort(this.ordenaPorPeso);
  
      //Set items html printing for all tabs
      for (var key in itemsAux) {
        var itemComposite = itemsAux[key];
        if (itemComposite.getTab().getExtendedId() != EmptyTab) {
          itemComposite
            .getTab()
            .setSearchQuery(
              this._tabs[itemComposite.getTab().getId()].getSearchQuery()
            ); //Set query search for filtering items
          aSections[itemComposite.getTab().getExtendedId()].push(
            itemComposite.imprimir()
          );
        } else {
          if ($("#" + itemComposite.seccion).length != 0) {
            itemComposite.getObjDom().html("");
          }
          itemComposite.setQuerySearch(this.getQuerySearch()); //Set query search for filtering items
          itemComposite.getObjDom().append(itemComposite.imprimir());
        }
      }
  
      //Set end html printing for all tabs
      for (var key in this._tabs) {
        aSections[this._tabs[key].getExtendedId()].push(
          this._tabs[key].getEndPrint()
        );
      }
  
      var sInitialHTML = "<ul id='menuTabs' class='nav nav-tabs' role='tablist'>";
      for (var key in this._tabs) {
        if (this._selectedTab == null) {
          this.setSelectedTab(this._tabs[key].id);
          var sClassAux = "active";
        } else if (this._selectedTab.getId() == this._tabs[key].id) {
          var sClassAux = "active";
        }
        sInitialHTML +=
          "<li role='presentation' class='" +
          sClassAux +
          "'><a href='#" +
          this._tabs[key].getExtendedId() +
          "' aria-controls='" +
          this._tabs[key].getExtendedId() +
          "' role='tab' data-toggle='tab'>" +
          this._tabs[key].getContent() +
          "</a></li>";
        sClassAux = "";
      }
      sInitialHTML += "</ul>";
      sInitialHTML += "<div id='tabContent' class='tab-content'>";
  
      for (var key in aSections) {
        sInitialHTML += aSections[key].join("") + "</div>";
      }
  
      sInitialHTML += "</div>";
  
      this.getMenuDOM().html(sInitialHTML);
  
      let sidebar = document.getElementById("sidebar");
      const searcher = document.createElement("div");
      searcher.innerHTML = this._printSearcher();
      sidebar.insertBefore(searcher, sidebar.firstChild);
    }
  
    generateSubFolders(itemsToFolders, folders) {
      var itemsToPrint = new Array();
  
      for (var itemIndex in itemsToFolders) {
        //real items loop
        var itemComposite = itemsToFolders[itemIndex];
        var encontro = false;
        for (var folderIndex in folders) {
          //folders loop
          var folder = folders[folderIndex];
          if (folder.items) {
            if (folder.items.indexOf(itemComposite.seccion) != -1) {
              encontro = true;
              if (!itemsToPrint[folderIndex]) {
                itemsToPrint[folderIndex] = new ItemGroup(
                  itemComposite.tab,
                  folder.nombre,
                  itemComposite.seccion + "f" + folderIndex,
                  itemComposite.peso,
                  itemComposite.palabrasClave,
                  folder.resumen,
                  folder.resumen
                );
                itemsToPrint[folderIndex].setImpresor(new ImpresorGrupoHTML());
                itemsToPrint[folderIndex].itemsComposite = {};
                itemsToPrint[folderIndex].setObjDom(itemComposite.objDOM);
              }
              itemsToPrint[folderIndex].itemsComposite[itemComposite.seccion] =
                itemComposite;
            }
          }
          if (folder.folders) {
            ret = this.generateSubFolders(itemsToFolders, folder.folders);
            if (ret != null && ret.length > 0) {
              itemComposite = ret[0];
              encontro = true;
              if (!itemsToPrint[folderIndex]) {
                itemsToPrint[folderIndex] = new ItemGroup(
                  itemComposite.tab,
                  folder.nombre,
                  itemComposite.seccion + "f" + folderIndex,
                  itemComposite.peso,
                  itemComposite.palabrasClave,
                  folder.resumen,
                  folder.resumen
                );
                itemsToPrint[folderIndex].setImpresor(new ImpresorGrupoHTML());
                itemsToPrint[folderIndex].itemsComposite = {};
                itemsToPrint[folderIndex].setObjDom(itemComposite.objDOM);
              }
              for (var j = 0; j < ret.length; j++) {
                itemsToPrint[folderIndex].itemsComposite[itemComposite.seccion] =
                  ret[j];
              }
            }
          }
        }
      }
  
      return itemsToPrint;
    }
  
    isItemInSubFolders(itemComposite, folders) {
      for (var folderIndex in folders) {
        //folders loop
        var folder = folders[folderIndex];
        if (folder.items) {
          if (folder.items.indexOf(itemComposite.seccion) != -1) {
            return true;
          }
        }
        if (folder.folders) {
          return this.isItemInSubFolders(itemComposite, folder.folders);
        }
      }
  
      return false;
    }
  
    generateFolders(itemsToFolders) {
      var itemsToPrint = new Array();
      var i = 100;
  
      for (var itemIndex in itemsToFolders) {
        //real items loop
        var itemComposite = itemsToFolders[itemIndex];
        var encontro = false;
        for (var folderIndex in this._folders) {
          //folders loop
          var folder = this._folders[folderIndex];
          if (folder.items) {
            if (folder.items.indexOf(itemComposite.seccion) != -1) {
              encontro = true;
              if (!itemsToPrint[folderIndex]) {
                itemsToPrint[folderIndex] = new ItemGroup(
                  itemComposite.tab,
                  folder.nombre,
                  itemComposite.seccion + "f" + folderIndex,
                  itemComposite.peso,
                  itemComposite.palabrasClave,
                  folder.resumen,
                  folder.resumen
                );
                itemsToPrint[folderIndex].setImpresor(new ImpresorGrupoHTML());
                itemsToPrint[folderIndex].itemsComposite = {};
                itemsToPrint[folderIndex].setObjDom(itemComposite.objDOM);
              }
              itemsToPrint[folderIndex].itemsComposite[itemComposite.seccion] =
                itemComposite;
            }
          }
          if (encontro == false && folder.folders) {
            encontro = this.isItemInSubFolders(itemComposite, folder.folders);
          }
        }
        if (!encontro) {
          itemsToPrint[i++] = itemComposite;
        }
      }
  
      for (var folderIndex in this._folders) {
        //folders loop
        var folder = this._folders[folderIndex];
        if (folder.folders) {
          var ret = this.generateSubFolders(itemsToFolders, folder.folders);
          if (ret != null && ret.length > 0) {
            itemComposite = ret[0];
            if (!itemsToPrint[folderIndex]) {
              itemsToPrint[folderIndex] = new ItemGroup(
                itemComposite.tab,
                folder.nombre,
                itemComposite.seccion + "f" + folderIndex,
                itemComposite.peso,
                itemComposite.palabrasClave,
                folder.resumen,
                folder.resumen
              );
              itemsToPrint[folderIndex].setImpresor(new ImpresorGrupoHTML());
              itemsToPrint[folderIndex].itemsComposite = {};
              itemsToPrint[folderIndex].setObjDom(itemComposite.objDOM);
            }
            for (var j = 0; j < ret.length; j++) {
              itemsToPrint[folderIndex].itemsComposite[itemComposite.seccion] =
                ret[j];
            }
          }
        }
      }
  
      itemsToPrint.sort(this.ordenaPorPeso);
      for (var key in itemsToPrint) {
        itemsToPrint[key].getObjDom().append(itemsToPrint[key].imprimir());
      }
    }
  
    printMenu() {
      this.processLayersJoin();
  
      if (this._hasMoreTabsThanOne()) {
        this._printWithTabs();
      } else {
        this.getMenuDOM().html(this._printSearcher());
  
        var itemsAux = new Array();
        var itemsIterator = this._itemsGetter.get(this);
        for (var key in itemsIterator) {
          itemsAux.push(itemsIterator[key]);
        }
        itemsAux.sort(this.ordenaPorPeso);
  
        var itemsAuxToFolders = new Array(); //Array with items and folders
        for (var key in itemsAux) {
          var itemComposite = itemsAux[key];
          itemComposite.setQuerySearch(this.getQuerySearch()); //Set query search for filtering items
  
          if ($("#" + itemComposite.seccion).length != 0) {
            itemComposite.getObjDom().html("");
          }
  
          itemsAuxToFolders.push(itemComposite);
        }
        //Generate logical folders
        this.generateFolders(itemsAuxToFolders);
      }
  
      this.getLoadingDOM().hide();
  
      //To print all items in background
      for (var key in this.layersInfo) {
        if (this.layersInfo[key].tab.listType != "combobox") {
          this.addLazyInitLayerInfoCounter(
            ItemGroupPrefix + this.layersInfo[key].section
          );
          this.layersInfo[key].get(this);
        }
      }
  
      //Call callback after print (if exists)
      if (this.printCallback != null) {
        this.printCallback();
      }
  
      //Show visible layers count in class (to save state after refresh menu)
      for (var key in this.items) {
        this.items[key].muestraCantidadCapasVisibles();
        showTotalNumberofLayers();
      }
  
      //Tabs
      $('a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
        var target = $(e.target).attr("href"); // activated tab object
        var activeTabId = target.replace("#main-menu-tab-", ""); // activated tab id
        gestorMenu.setSelectedTab(activeTabId);
        if (gestorMenu._selectedTab.isSearcheable == true) {
          $("#searchForm").show();
          $("#q").val(gestorMenu._selectedTab.getSearchQuery());
          if (gestorMenu._selectedTab.getSearchQuery() == "") {
            $("#q").trigger("propertychange");
          }
          $("#q").trigger("propertychange");
        } else {
          //$("#searchForm").hide();
        }
      });
      if (
        this._hasMoreTabsThanOne() == true &&
        this._selectedTab.isSearcheable == false
      ) {
        //Check if first active tab is searcheable
        //$("#searchForm").hide();
      }
  
      //Searcher
      $('.has-clear input[type="text"]')
        .on("input propertychange", function () {
          var $this = $(this);
          var visible = Boolean($this.val());
          $this.siblings(".form-control-clear").toggleClass("hidden", !visible);
        })
        .trigger("propertychange");
      $(".form-control-clear").click(function () {
        $(this)
          .siblings('input[type="text"]')
          .val("")
          .trigger("propertychange")
          .focus();
        $("#searchForm").submit();
      });
      $("#searchclear").click(function () {
        $("#q").val("");
        $("#searchForm").submit();
      });
  
      //Jquery autocomplete (begin)
      var accentMap = {
        á: "a",
        é: "e",
        í: "i",
        ó: "o",
        ú: "u",
        ñ: "n",
      };
      var normalize = function (term) {
        var ret = "";
        for (var i = 0; i < term.length; i++) {
          ret += accentMap[term.charAt(i)] || term.charAt(i);
        }
        return ret;
      };
  
      $("#q").autocomplete({
        source: function (request, response) {
          var matcher = new RegExp(
            $.ui.autocomplete.escapeRegex(request.term),
            "i"
          );
          response(
            $.grep(gestorMenu.getAvailableTags(), function (value) {
              value = value.label || value.value || value;
              return matcher.test(value) || matcher.test(normalize(value));
            })
          );
        },
        select: function (event, ui) {
          $("#q").val(ui.item.label);
          $("#searchForm").submit();
        },
      });
      //Jquery autocomplete (end)
    }
  
    //Prints only one section (works on lazy initialization only)
    printOnlySection(sectionId) {
      var itemGroup = this.items[sectionId];
      if (itemGroup.tab.listType == "combobox") {
        //Si es combobox
        itemGroup.imprimir();
        $("#wms-combo-list").html(itemGroup.itemsStr);
      } else {
        //Si no es es combobox
        itemGroup.imprimir();
        $("#" + sectionId + " > div").html(itemGroup.itemsStr);
      }
    }
  
    muestraCapa(itemSeccion) {
      if (!mapa.hasOwnProperty("activeLayerHasChanged")) {
        const intervalId = setInterval(() => {
          if (mapa.hasOwnProperty("activeLayerHasChanged")) {
            window.clearInterval(intervalId);
            gestorMenu.muestraCapa(itemSeccion);
          }
        }, 500);
        return;
      }
  
      const wmtsLayers = [];
  
      //Hide all if itemComposite selected is Base Map
      var isBaseLayer = false;
      let baseLayerName = "";
  
      for (var key in this.items) {
        var itemComposite = this.items[key];
        for (var key2 in itemComposite.itemsComposite) {
          var item = itemComposite.itemsComposite[key2];
          if (item.getId() == itemSeccion) {
            isBaseLayer = itemComposite.isBaseLayer();
            baseLayerName = item.nombre;
            break;
          }
        }
      }
  
      if (isBaseLayer && this.lastBaseMapSelected !== baseLayerName) {
        if (this.baseMapDependencies[this.lastBaseMapSelected])
          this.baseMapDependencies[this.lastBaseMapSelected].forEach((layer) => {
            if (this.activeLayers.find((lyr) => lyr === layer))
              this.muestraCapa(this.getLayerIdByName(layer));
          });
      }
  
      //Show or hide selected item
      for (var key in this.items) {
        var itemComposite = this.items[key];
        if (isBaseLayer && itemComposite.isBaseLayer()) {
          this.availableBaseLayers.forEach((baseLayer) => {
            this.removeActiveLayer(baseLayer);
          });
          itemComposite.hideAllLayers();
        }
  
        for (var key2 in itemComposite.itemsComposite) {
          var item = itemComposite.itemsComposite[key2];
  
          const layerIsActive = this.layerIsActive(item.nombre);
          const layerIsWmts = this.layerIsWmts(item.nombre);
  
          if (isBaseLayer && layerIsActive && layerIsWmts) {
            wmtsLayers.push(item);
          } else {
            let id = item.getId();
            if (id === itemSeccion) {
              if ($("#" + itemSeccion).hasClass("active")) {
                this.removeActiveLayer(item.nombre);
                if (!isBaseLayer) mapa.activeLayerHasChanged(item.nombre, false);
                if (geoProcessingManager) {
                  geoProcessingManager.updateLayerSelect(item.nombre, false);
                }
              } else {
                this.addActiveLayer(item.nombre);
                if (!isBaseLayer) mapa.activeLayerHasChanged(item.nombre, true);
                if (geoProcessingManager) {
                  geoProcessingManager.updateLayerSelect(item.nombre, true);
                }
              }
  
              item.showHide();
              itemComposite.muestraCantidadCapasVisibles();
              showTotalNumberofLayers();
              break;
            }
          }
        }
      }
  
      if (isBaseLayer && this.lastBaseMapSelected !== baseLayerName) {
        this.setLastBaseMapSelected(baseLayerName);
  
        setValidZoomLevel(baseLayerName);
  
        if (this.baseMapDependencies[baseLayerName])
          this.baseMapDependencies[baseLayerName].forEach((layer) => {
            if (!this.activeLayers.find((lyr) => lyr === layer))
              this.muestraCapa(this.getLayerIdByName(layer));
          });
  
        wmtsLayers.forEach((wmtsLayer) => {
          wmtsLayer.showHide();
          wmtsLayer.showHide();
        });
  
        for (let i = 0; i < this.availableBaseLayers.length; i++) {
          const id = "child-mapasbase" + i;
          if (itemSeccion !== id && $("#" + id).hasClass("active")) {
            $("#" + id).removeClass("active");
          }
        }
      }
  
      if (this.activeLayersHasBeenUpdated) this.activeLayersHasBeenUpdated();
    }
  
    showWMSLayerCombobox(itemSeccion) {
      let nuevo_impresor = new Menu_UI();
      nuevo_impresor.addLoadingAnimation("NEW-wms-combo-list");
      //Realiza el GET de las capas
  
      let tempMenu = document.getElementById("temp-menu");
      tempMenu ? tempMenu.remove() : 0;
  
      var itemSeccionAux = itemSeccion.replace(ItemGroupPrefix, "");
      for (var key in this.layersInfo) {
        if (this.layersInfo[key].section == itemSeccionAux) {
          this.addLazyInitLayerInfoCounter(itemSeccion);
          //nueva opcion crea un objeto para cada btn
          this.layersInfo[key].get_without_print(this);
          //this.layersInfo[key].get(this)
        }
      }
      // bindLayerOptionsIdera();
    }
  
    getLayerData(layerName, sectionName) {
      let sectionLayers,
        sections,
        layersArr = [],
        layerData = {};
  
      sectionName
        ? ((sectionLayers = gestorMenu.items[sectionName].itemsComposite),
          layersArr.push(...Object.values(sectionLayers)))
        : ((sections = gestorMenu.items),
          Object.values(sections).forEach((section) => {
            section.seccion !== "mapasbase"
              ? layersArr.push(...Object.values(section.itemsComposite))
              : "";
          }));
  
      layersArr.forEach((layer) => {
        let lyr = layer.capa;
        lyr.nombre === layerName
          ? (layerData = {
              name: lyr.nombre,
              title: lyr.titulo,
              url: lyr.host.substring(0, lyr.host.lastIndexOf("/")),
              keywords: lyr.keywords ?? [],
              icon: lyr.legendURL,
              bbox: {
                sw: {
                  lng: lyr.minx,
                  lat: lyr.miny,
                },
                ne: {
                  lng: lyr.maxx,
                  lat: lyr.maxy,
                },
              },
            })
          : "";
      });
      return layerData ?? {};
    }
  }
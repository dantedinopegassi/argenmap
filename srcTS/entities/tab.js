class Tab {
    constructor(tab) {
      this.id = "";
      this.content = "";
      this.isSearcheable = false;
      this.searchQuery = "";
      this.listType = "accordion";
      this.itemsGetter = new ItemsGetter();
      if (tab != undefined && tab != "") {
        this.id = tab.id;
        if (tab.searcheable != undefined) {
          this.isSearcheable = tab.searcheable;
        }
        if (tab.content != undefined) {
          this.content = tab.content;
        }
        if (tab.list_type != undefined) {
          this.listType = tab.list_type;
        }
      }
    }
  
    getId() {
      return this.id;
    }
  
    getExtendedId() {
      return EmptyTab + this.id;
    }
  
    getContent() {
      return this.content != undefined && this.content != ""
        ? this.content
        : this.getId();
    }
  
    getSearchQuery() {
      return this.searchQuery;
    }
  
    setSearchQuery(q) {
      this.searchQuery = q;
    }
  
    getInitialPrint() {
      if (this.listType == "combobox") {
        return (
          '<select id="wms-combobox-selector-' +
          this.id +
          '" onChange="gestorMenu.showWMSLayerCombobox(this.value)" class="wms-combobox-selector"><option value="">Seleccione un servicio</option>'
        );
      }
      return "";
    }
  
    getEndPrint() {
      if (this.listType == "combobox") {
        return '</select><div id="wms-combo-list"></div><div id="NEW-wms-combo-list"></div>';
      }
      return "";
    }
  }
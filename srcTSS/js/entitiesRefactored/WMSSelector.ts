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
  
    getId() {
      return this.id;
    }
  
    getTitle() {
      return this.capa.titulo;
    }
  }
  class ItemGroupWMSSelector extends ItemGroup {
    constructor(tab, name, section, keyWords, description) {
      super(tab, name, section, 0, keyWords, description, "");
      this.wmsSelectorList = {};
    }
  
    addWMS(id, title, source, service, version, featureInfoFormat, type) {
      this.wmsSelectorList[id] = new wmsSelector(
        id,
        title,
        source,
        service,
        version,
        featureInfoFormat,
        type
      );
    }
  }
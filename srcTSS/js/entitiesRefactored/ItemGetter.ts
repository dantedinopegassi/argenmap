class ItemsGetter {
    get(gestorMenu) {
      return gestorMenu.items;
    }
  }
  
  class ItemsGetterSearcher extends ItemsGetter {
    get(gestorMenu) {
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
    }
  }
  
  class ItemsGetterSearcherWithTabs extends ItemsGetter {
    get(gestorMenu) {
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
    }
  }
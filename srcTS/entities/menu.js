class Menu_UI {
    constructor() {
      this.layer_active_options = null;
      this.available_options = ["download", "filter", "trash"];
    }
  
    addSection(name) {
      let groupnamev = clearSpecialChars(name);
      let itemnew = document.createElement("div");
      itemnew.innerHTML = `
          <div id="lista-${groupnamev}" class="menu5 panel-default">
          <div class="panel-heading">
              <h4 class="panel-title">
                  <a id="${groupnamev}-a" data-toggle="collapse" data-parent="#accordion1" href="#${groupnamev}-content" class="item-group-title">${name}</a>
              </h4>
          </div>
          <div id='${groupnamev}-content' class="panel-collapse collapse">
              <div class="panel-body" id ="${groupnamev}-panel-body"></div>
          </div>
          </div>`;
  
      let searchForm = document.getElementById("searchForm");
      searchForm.after(itemnew);
    }
  
    addParentSection(parent, child) {
      let parentNamev = clearSpecialChars(parent);
      let childName = clearSpecialChars(child);
  
      let parentItemnew = document.createElement("div");
      parentItemnew.innerHTML = `
        <div id="lista-${parentNamev}" class="menu5 panel-default">
        <div class="panel-heading">
            <h4 class="panel-title">
                <i class="fa-solid fa-folder-tree"></i>
                <a id="${parentNamev}-a" data-toggle="collapse" data-parent="#accordion1" href="#${parentNamev}-content" class="item-group-title">${parent}</a>
            </h4>
        </div>
        <div id='${parentNamev}-content' class="panel-collapse collapse" style="width: 90%; margin-left: auto;">
            <div class="panel-body" id ="${parentNamev}-panel-body"></div>
        </div>
        </div>`;
  
      let subItemnew = document.createElement("div");
      subItemnew.innerHTML = `
        <div id="lista-${childName}" class="menu5 panel-default">
        <div class="panel-heading">
        <h4 class="panel-title">
        <i class="fa-regular fa-folder-open"></i>
        <a id="${childName}-a" data-toggle="collapse" data-parent="#accordion1" href="#${childName}-content" class="item-group-title">${"hijo"}</a>
        </h4>
        </div>
        <div id='${childName}-content' class="panel-collapse collapse" style="width: 90%; margin-left: auto;">
        <div class="panel-body" id ="${childName}-panel-body"></div>
        </div>
        </div>`;
  
      let searchForm = document.getElementById("searchForm"),
        isParent = document.getElementById(`lista-${parentNamev}`);
      if (!isParent) {
        searchForm.after(parentItemnew);
      }
      let location = document.getElementById(`${parentNamev}-panel-body`);
      location.appendChild(subItemnew);
    }
  
    addLayerOption({
      color = "#474b4e",
      classList = "far fa-question-circle",
      title = "Layer option",
      onclick = callback,
    }) {
      const layerOption = document.createElement("li");
      layerOption.innerHTML = `<a style="color:${color};" href="#"><i class="${classList}" aria-hidden="true" style="width:20px;"></i>${title}</a>`;
      layerOption.onclick = function () {
        callback;
      };
      return layerOption;
    }
  
    addFileLayer(groupname, layerType, textName, id, fileName, isActive) {
      let groupnamev = clearSpecialChars(groupname);
      if (!fileLayerGroup.includes(groupnamev)) {
        fileLayerGroup.push(groupnamev);
      }
      let main = document.getElementById("lista-" + groupnamev);
  
      let div = ` 
          <div style="display:flex; flex-direction:row;">
          <div style="cursor: pointer; width: 70%" onclick="clickGeometryLayer('${id}')"><span style="user-select: none;">${id}</span></div>
          <div class="icon-layer-geo" onclick="mapa.downloadMultiLayerGeoJSON('${id}')"><i class="fas fa-download" title="descargar"></i></div>
          <div class="icon-layer-geo" onclick="deleteLayerGeometry('${id}')"><i class="far fa-trash-alt" title="eliminar"></i></div>
          </div>
          `;
      //si no existe contenedor
      let id_options_container = "opt-c-" + id;
      if (!main) {
        this.addSection(groupnamev);
      }
      let content = document.getElementById(groupnamev + "-panel-body");
      let layer_container = document.createElement("div");
      layer_container.id = "fl-" + id;
      layer_container.className = "file-layer-container";
  
      let layer_item = document.createElement("div");
      layer_item.id = "flc-" + id;
      if (isActive) {
        layer_item.className = "file-layer active";
      } else if (!isActive) {
        layer_item.className = "file-layer";
      }
  
      let img_icon = document.createElement("div");
      img_icon.className = "file-img";
      img_icon.innerHTML = `<img loading="lazy" src="src/js/components/openfiles/icon_file.svg">`;
      img_icon.onclick = function () {
        clickGeometryLayer(id);
      };
  
      let layer_name = document.createElement("div");
      layer_name.className = "file-layername";
      layer_name.innerHTML = "<a>" + textName + "</a>";
      layer_name.title = fileName;
      layer_name.onclick = function () {
        clickGeometryLayer(id);
      };
  
      let options = document.createElement("div");
      options.style = "width:10$;padding-right:5px;cursor:pointer;";
      options.className = "btn-group";
      options.role = "group";
      options.id = id_options_container;
  
      let fdiv = document.createElement("div");
      fdiv.style = "border: 0px;";
      fdiv.className = "dropdown-toggle";
      fdiv.setAttribute("data-toggle", "dropdown");
      fdiv.setAttribute("aria-haspopup", "true");
      fdiv.setAttribute("aria-expanded", "false");
      fdiv.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16"> <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/> </svg>';
      // fdiv.innerHTML = '<span class="caret"></span>'
  
      let mainul = document.createElement("ul");
      mainul.className = "dropdown-menu";
      mainul.style = "right:0px !important;left:auto !important;";
      mainul.id = "opt-c-" + id;
  
      let delete_opt = document.createElement("li");
      delete_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i  class="fa fa-trash" aria-hidden="true" style="width:20px;"></i>Eliminar Capa</a>`;
      delete_opt.onclick = function () {
        let menu = new Menu_UI();
        menu.modalEliminar(id, groupnamev, layerType);
        //deleteLayerGeometry(layer)
      };
  
      let download_opt = document.createElement("li");
      download_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i class="fa fa-download" aria-hidden="true" style="width:20px;"></i>Descargar</a>`;
      download_opt.onclick = function () {
        const index_file = getIndexFileLayerbyID(id);
        // let d_file_name = addedLayers[index_file].name // unused
        const layer = addedLayers[index_file];
        if (!layer.download) {
          mapa.downloadMultiLayerGeoJSON(id, layer.name, true);
          return;
        }
        layer.download();
        return;
      };
  
      let edit_data_opt = document.createElement("li");
      edit_data_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i class="fa fa-table" aria-hidden="true" style="width:20px;"></i>Ver Datos</a>`;
      edit_data_opt.onclick = function () {
        const index_file = getIndexFileLayerbyID(id);
        const data = addedLayers[index_file];
        let dTable = new Datatable(data.layer);
        createTabulator(dTable, data.file_name, { editable: true });
        return;
      };
  
      let edit_name_opt = document.createElement("li");
      edit_name_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i class="fa fa-edit" aria-hidden="true" style="width:20px;"></i>Editar Nombre</a>`;
      edit_name_opt.onclick = function () {
        menu_ui.editFileLayerName(id);
      };
  
      let zoom_layer_opt = document.createElement("li");
      zoom_layer_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i class="fa fa-search-plus" aria-hidden="true" style="width:20px;"></i>Zoom a capa</a>`;
      zoom_layer_opt.onclick = function () {
        addedLayers.forEach((lyr) => {
          if (lyr.id === id) {
            mapa.centerLayer(lyr.layer);
          }
        });
      };
  
      /* let query_opt = document.createElement("li")
              query_opt.innerHTML =`<a style="color:#474b4e;" href="#"><i class="far fa-question-circle" aria-hidden="true" style="width:20px;"></i>Ver datos</a>`
              query_opt.onclick = function(){
                  console.log('add a popup here!')
                  addedLayers.forEach( lyr => {
                      if( lyr.id === id ) {
                          //addedLayers[0].id
                          lyr.bindPopup(lyr.layer.features[0].properties);
                          mapa.editableLayers.polygon[0].bindPopup
                      }
                  });
              } */
  
      /* let style_opt = document.createElement("li")
              style_opt.innerHTML =`<a style="color:#474b4e;" href="#"><i class="fas fa-paint-brush" aria-hidden="true" style="width:20px;"></i>Editar estilo</a>`
              style_opt.onclick = function(){
                  console.log('edit style!');
              } */
  
      /* let chart_opt = document.createElement("li")
              chart_opt.innerHTML =`<a style="color:#474b4e;" href="#"><i class="fas fa-chart-pie" aria-hidden="true" style="width:20px;"></i>Editar estilo</a>`
              chart_opt.onclick = function(){
                  console.log('add a popup here!');
              } */
  
      /* let copy_opt = document.createElement("li")
              copy_opt.innerHTML =`<a style="color:#474b4e;" href="#"><i class="fas fa-copy" aria-hidden="true" style="width:20px;"></i>Editar estilo</a>`
              copy_opt.onclick = function(){
                  console.log('add a popup here!');
              } */
  
      mainul.append(zoom_layer_opt);
      mainul.append(edit_name_opt);
      mainul.append(edit_data_opt);
      mainul.append(download_opt);
      //mainul.append(query_opt)
      //mainul.append(copy_opt)
      //mainul.append(style_opt)
      //mainul.append(chart_opt)
      mainul.append(delete_opt);
  
      options.append(fdiv);
      options.append(mainul);
  
      layer_item.append(img_icon);
      layer_item.append(layer_name);
      layer_item.append(options);
      layer_container.append(layer_item);
      content.appendChild(layer_container);
      showTotalNumberofLayers();
      addCounterForSection(groupnamev, layerType);
    }
  
    addLayerOptions(layer) {
      //display options true
      app.layers[layer].display_options = true;
      this.layer_active_options = layer;
  
      let id = "layer-options-" + layer;
      let el = document.getElementById(id);
  
      el.setAttribute("class", "layer-options-active");
      let options_container = document.createElement("div");
      options_container.className = "options-container";
  
      let options_tabs = document.createElement("div");
      options_tabs.className = "options-tabs";
      options_tabs.innerHTML = `
              <div class="option-tab-icon-active" title="descargar capa"><i class="fa fa-download" aria-hidden="true"></i></div>
              <div class="option-tab-icon" title="filtros"><i class="fa fa-filter" aria-hidden="true"></i></div>
              <div class="option-tab-icon" title="borrar capa"><i class="fa fa-trash" aria-hidden="true"></i></div>
              `;
  
      let options_panel = document.createElement("div");
      options_panel.className = "options-panel";
      options_panel.innerHTML = `
              <div class="panel-download"></div>
              <div class="panel-filter"></div>
              <div class="panel-trash"></div>
              `;
      options_container.append(options_tabs);
      options_container.append(options_panel);
      el.append(options_container);
    }
  
    closeLayerOptions(layer) {
      let el = document.getElementById("layer-options-" + layer);
      app.layers[layer].display_options = false;
      if (el) {
        el.setAttribute("class", "display-none");
        el.innerHTML = "";
      }
    }
  
    addLoadingAnimation(id_dom) {
      let contenedor = document.getElementById(id_dom);
      contenedor.innerHTML = "";
      contenedor.innerHTML =
        '<div class="loading"><img src="src/styles/images/loading.svg"></div>';
    }
  
    async addLayers_combobox(items) {
      let contenedor = document.getElementById("NEW-wms-combo-list");
      let list = document.createElement("div");
      list.classList = "panel-body";
      let layers = items.itemsComposite;
      for (const property in layers) {
        let id_dom = "child-" + layers[property].seccion;
        let title = layers[property].capa.titulo;
        let url_img = layers[property].capa.legendURL;
        let descripcion = layers[property].capa.descripcion;
        let li_layer = this.add_btn_Layer_combobox(
          id_dom,
          title,
          url_img,
          descripcion,
          false
        );
        list.append(li_layer);
      }
      contenedor.innerHTML = "";
      contenedor.append(list);
    }
  
    add_btn_Layer_combobox(id_dom, title, url_img, descripcion, options) {
      // reemplazar =title
      let min_url_img =
        url_img +
        _LEGEND_PARAMS +
        _LEGEND_OPTIONS +
        "forceTitles:off;forceLabels:off;";
      let max_url_img =
        url_img + _LEGEND_PARAMS + _LEGEND_OPTIONS + "forceLabels:on;";
      let li = document.createElement("li");
      li.id = id_dom;
      li.className = "capa list-group-item";
      li.style = "padding: 10px 1px 10px 1px;";
  
      if (options) {
        //pendiente crear objeto
        options_layer =
          "<div class='display-none' id=layer-options-" + title + "></div>";
      }
  
      let capa_info = document.createElement("div");
      capa_info.className = "capa-info";
  
      let container_expand_legend_grafic = document.createElement("div");
      container_expand_legend_grafic.className = "expand-legend-graphic hidden";
      container_expand_legend_grafic.style = "overflow:hidden;";
      container_expand_legend_grafic.setAttribute("load", false);
  
      let capa_legend_div = document.createElement("div");
      capa_legend_div.className = "legend-layer";
  
      let img_legend = document.createElement("img");
      img_legend.className = "legend-img";
      img_legend.style = "width:22px;height:22px";
      img_legend.loading = "lazy";
      img_legend.src = min_url_img;
      img_legend.setAttribute("onerror", "showImageOnError(this)");
      capa_legend_div.append(img_legend);
  
      let resize_img_icon = document.createElement("div");
      resize_img_icon.className = "resize-legend-combobox";
      resize_img_icon.style = "align-self: center;font-size: 14px";
      resize_img_icon.innerHTML =
        '<i class="fas fa-angle-down" aria-hidden="true"></i>';
      resize_img_icon.onclick = () => {
        if (container_expand_legend_grafic.getAttribute("load") === "true") {
          container_expand_legend_grafic.innerHTML = "";
          container_expand_legend_grafic.classList.toggle("hidden");
          container_expand_legend_grafic.setAttribute("load", false);
          resize_img_icon.innerHTML =
            '<i class="fas fa-angle-down" aria-hidden="true"></i>';
        } else {
          container_expand_legend_grafic.innerHTML =
            "<img class='legend-img-max' loading='lazy'  src='" +
            max_url_img +
            "' onerror='showImageOnError(this);'></img>";
          container_expand_legend_grafic.setAttribute("load", true);
          container_expand_legend_grafic.classList.toggle("hidden");
          resize_img_icon.innerHTML =
            '<i class="fas fa-angle-up" aria-hidden="true"></i>';
        }
      };
  
      img_legend.addEventListener("load", (event) => {
        if (img_legend.naturalHeight > 22) {
          capa_legend_div.removeChild(img_legend);
          capa_legend_div.append(resize_img_icon);
          capa_legend_div.title = "abrir leyenda";
          img_legend.src = "";
        }
      });
  
      capa_legend_div.onclick = () => {
        /*
              if(li.className === "capa list-group-item active"){
                  li.className = "capa list-group-item"
              }else{li.className = "capa list-group-item active"}
              gestorMenu.muestraCapa(id_dom)*/
      };
  
      let capa_title_div = document.createElement("div");
      capa_title_div.className = "name-layer";
      capa_title_div.style = "align-self: center;";
      capa_title_div.onclick = function () {
        if (li.className === "capa list-group-item active") {
          //clase btn desactivada
          li.className = "capa list-group-item";
          //desactivar capa en mapa
          gestorMenu.muestraCapa(id_dom);
          //si tiene opcion a expand legend grafic y esta abierta cerrar.
          if (li.getElementsByClassName("legend-img").length == 0) {
            if (container_expand_legend_grafic.getAttribute("load") === "true")
              resize_img_icon.click();
          }
        } else {
          //activar capa
          li.className = "capa list-group-item active";
          gestorMenu.muestraCapa(id_dom);
          if (li.getElementsByClassName("legend-img").length == 0) {
            resize_img_icon.click();
          }
        }
      };
  
      let capa_description_a = document.createElement("a");
      capa_description_a.nombre = title;
      capa_description_a.href = "#";
      capa_description_a.innerHTML =
        "<span data-toggle2='tooltip' title='" +
        descripcion +
        "'>" +
        title +
        "</span>";
      capa_title_div.append(capa_description_a);
  
      let btn_zoom_layer = document.createElement("div");
      btn_zoom_layer.className = "zoom-layer-combobox";
      btn_zoom_layer.style = "align-self: center;";
      btn_zoom_layer.layername = title;
      btn_zoom_layer.innerHTML =
        "<i class='fas fa-search-plus' title='Zoom a capa'></i>";
      btn_zoom_layer.addEventListener("click", function () {
        if (li.className === "capa list-group-item") {
          li.className = "capa list-group-item active";
        }
        if (li.getElementsByClassName("legend-img").length == 0) {
          if (container_expand_legend_grafic.getAttribute("load") === "false")
            resize_img_icon.click();
        }
        zoomLayer(id_dom);
      });
  
      capa_info.append(capa_legend_div);
      capa_info.append(capa_title_div);
      capa_info.append(btn_zoom_layer);
      li.append(capa_info);
      li.append(container_expand_legend_grafic);
      return li;
    }
  
    modalEliminar(id, groupnamev, layerType) {
      let index_file = getIndexFileLayerbyID(id);
      let textname = addedLayers[index_file].name;
      let fileName = addedLayers[index_file].file_name;
      $("#modal_layer_del").remove();
      let modal = document.createElement("div");
      modal.id = "modal_layer_del";
      modal.className = "modal-file-delete";
  
      let close_icon = document.createElement("div");
      close_icon.style = "display:flex;flex-direction: row;padding-top:5px";
      let c_empty = document.createElement("div");
      c_empty.style.width = "90%";
      let c_close = document.createElement("div");
      c_close.style = "width:10%;text-align: center;cursor:pointer;";
      c_close.innerHTML =
        '<i style="color:grey;font-size:16px" class="fa fa-times" aria-hidden="true"></i>';
      c_close.onclick = function () {
        $("#modal_layer_del").remove();
      };
      close_icon.append(c_empty);
      close_icon.append(c_close);
  
      let modal_body = document.createElement("div");
      modal_body.className = "modal-file-delete-body";
      modal_body.innerHTML = `¿Eliminar Capa <strong>${textname}</strong>?`;
      modal_body.title = `¿Eliminar ${fileName}?`;
  
      let btn_container = document.createElement("div");
      btn_container.style =
        "display: flex; flex-direction: row;  justify-content: space-between;margin:0px 20px 10px 20px;";
  
      let btn_si = document.createElement("button");
      btn_si.className = "ui-btn ui-btn-danger";
      btn_si.innerHTML = "Eliminar";
      btn_si.onclick = function () {
        let section;
        addedLayers.forEach((lyr) => {
          if (lyr.id === id) {
            section = lyr.section;
          }
        });
        delFileItembyID(id);
        deleteLayerGeometry(id);
        $("#modal_layer_del").remove();
  
        //ElevationProfile
        if (IElevationProfile) {
          let perfilDelete = new IElevationProfile();
          if (id.includes(perfilDelete.namePrefixElevProfile)) {
            perfilDelete.removeElevationProfile(id);
            delFileItembyID(id); //Delete section/group from addedLayer
          }
        }
        updateNumberofLayers(section);
        showTotalNumberofLayers();
      };
  
      let btn_no = document.createElement("button");
      btn_no.className = "ui-btn ui-btn-primary";
      btn_no.innerHTML = "Cancelar";
      btn_no.onclick = function () {
        $("#modal_layer_del").remove();
      };
  
      btn_container.append(btn_si);
      btn_container.append(btn_no);
  
      modal.append(close_icon);
      modal.append(modal_body);
      modal.append(btn_container);
      document.body.appendChild(modal);
  
      $("#modal_layer_del").draggable({
        containment: "#mapa",
      });
    }
  
    editFileLayerName(id) {
      let index = getIndexFileLayerbyID(id);
      addedLayers[index].laodingname = false;
      let id_i = "flc-" + id;
      let container = document.getElementById(id_i);
      let element = container.getElementsByClassName("file-layername")[0];
      let name = element.innerText;
      let nodo_hijo = container.getElementsByClassName("btn-group")[0];
      element.remove();
  
      let input_name = document.createElement("input");
      input_name.value = name;
      input_name.type = element.innerText;
      input_name.className = "input_newname form-control";
      input_name.style = "width: 75% !important;";
      input_name.id = "i-" + id;
  
      input_name.autocomplete = "off";
      input_name.style = "height:22px!important;";
      input_name.onblur = function (e) {
        if (!addedLayers[index].laodingname) {
          $("#i-" + id).remove();
          let a_new = document.createElement("div");
          a_new.className = "file-layername";
          a_new.innerHTML = `<a>${name}</a>`;
          container.insertBefore(a_new, nodo_hijo);
        }
      };
  
      input_name.onkeyup = function (e) {
        if (e.key === "Enter" || e.keyCode === 13) {
          addedLayers[index].laodingname = true;
          $("#i-" + id).remove();
          let a_new = document.createElement("div");
          a_new.className = "file-layername";
          a_new.title = this.value;
          editDomNameofFileLayerbyID(id, this.value);
          a_new.innerHTML = `<a>${this.value}</a>`;
          a_new.onclick = function () {
            clickGeometryLayer(id);
          };
          container.insertBefore(a_new, nodo_hijo);
        }
      };
  
      container.insertBefore(input_name, nodo_hijo);
      $(`#i-${id}`).focus();
    }
  
    editGroupName(id, oldName, newName) {
      clearSpecialChars(oldName);
      clearSpecialChars(newName);
      let el = document.getElementById(`${oldName}-a`);
      if (el) {
        el.innerText = newName;
        document.getElementById(`lista-${oldName}`).id = `lista-${newName}`;
        document.getElementById(oldName + "-panel-body").id =
          newName + "-panel-body";
      }
    }
  
    removeLayerFromGroup(groupname, textName, id, fileName, layer) {
      if (serviceItems[id].layers[textName].L_layer != null) {
        serviceItems[id].layers[textName].L_layer.remove();
      }
  
      let el = document.getElementById("srvcLyr-" + id + textName);
      if (el) {
        el.parentElement.remove();
        el.remove();
      }
      serviceItems[id].layersInMenu--;
  
      for (let i in serviceItems[id].layers) {
        if (serviceItems[id].layers[i] === textName) {
          serviceItems[id].layers.splice(i, 1);
          break;
        }
      }
      if (
        serviceItems[id].layersInMenu == 0 ||
        serviceItems[id].layersInMenu == undefined
      ) {
        this.removeLayersGroup(groupname);
      }
      showTotalNumberofLayers();
    }
  
    removeLayersGroup(groupname) {
      let el = document.getElementById(`lista-${clearSpecialChars(groupname)}`);
      if (el) {
        el.parentElement.remove();
        el.remove();
      }
    }
  
    addLayerToGroup(groupname, layerType, textName, id, fileName, layer) {
      // layer.name = encodeURI(layer.name);
      let newLayer = layer;
      newLayer.active = false;
      newLayer.L_layer = null;
      // let firstLayerAdded = false; // To simulate the click event
      if (serviceItems[id] != undefined) {
        serviceItems[id].layers[textName] = newLayer;
        serviceItems[id].layersInMenu++;
      } else {
        serviceItems[id] = {
          layers: [],
          layersInMenu: 0,
        };
        serviceItems[id].layers[textName] = newLayer;
        serviceItems[id].layersInMenu++;
        // firstLayerAdded = true; // Yes! First layer added
      }
  
      let groupnamev = clearSpecialChars(groupname);
      if (!fileLayerGroup.includes(groupname)) {
        fileLayerGroup.push(groupname);
      }
      let main = document.getElementById("lista-" + groupnamev);
      let id_options_container = "opt-c-" + id;
      if (!main) {
        this.addSection(groupname);
      }
  
      let content = document.getElementById(groupnamev + "-panel-body");
      let layer_container = document.createElement("div");
      layer_container.id = "fl-" + id;
      layer_container.className = "file-layer-container";
  
      let layer_item = document.createElement("div");
      layer_item.id = "srvcLyr-" + id + textName;
      layer_item.className = "file-layer";
  
      if (!layer.legend) {
        layer.legend =
          layer.host +
          "?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=" +
          layer.name;
      } // maybe this should be implemented within layer definition, not in menu methods
  
      let imageFormats = ["png", "jpg", "gif", "webp", "svg", "bmp", "ico"],
        notLegendFromFile = !imageFormats.some((imgFormat) =>
          layer.legend.includes("." + imgFormat)
        );
  
      if (notLegendFromFile) {
        layer.legend +=
          _LEGEND_PARAMS + _LEGEND_OPTIONS + "forceTitles:off;forceLabels:off;";
      }
  
      let img_icon = document.createElement("div");
      img_icon.className = "loadservice-layer-img";
      img_icon.innerHTML = `<img loading="lazy" src="${layer.legend}" onerror='showImageOnError(this);' onload='adaptToImage(this.parentNode)'>`;
      img_icon.onclick = function () {
        clickWMSLayer(layer, layer_item, fileName);
      };
  
      let layer_name = document.createElement("div");
      layer_name.className = "file-layername";
      let capitalizedTitle =
        layer.title[0].toUpperCase() + layer.title.slice(1).toLowerCase();
      layer_name.innerHTML = "<a>" + capitalizedTitle + "</a>";
      layer_name.title = fileName;
      layer_name.onclick = function () {
        clickWMSLayer(layer, layer_item, fileName);
        // layer_item.classList.toggle("active");
        // if (!layer.active) {
        //   layer.L_layer = L.tileLayer
        //     .wms(layer.host, {
        //       layers: layer.name,
        //       format: "image/png",
        //       transparent: true,
        //     })
        //     .addTo(mapa);
        //   layer.active = true;
  
        //   gestorMenu.layersDataForWfs[layer.name] = {
        //     name: layer.name,
        //     section: layer.title,
        //     host: layer.host,
        //   };
        // } else {
        //   mapa.removeLayer(layer.L_layer);
        //   layer.active = false;
        // }
      };
  
      let zoom_button = document.createElement("div");
      zoom_button.className = "loadservice-layer-img";
      zoom_button.innerHTML = `<i class="fas fa-search-plus" title="Zoom a capa"></i>`;
      zoom_button.onclick = function () {
        clickWMSLayer(layer, layer_item, fileName);
        let bounds = [
          [layer.maxy, layer.maxx],
          [layer.miny, layer.minx],
        ];
        mapa.fitBounds(bounds);
      };
  
      layer_item.append(img_icon);
      layer_item.append(layer_name);
      layer_item.append(zoom_button);
      layer_container.append(layer_item);
      content.appendChild(layer_container);
  
      // Open the tab
  
      if (serviceItems[id].layersInMenu == 1) $(`#${groupnamev}-a`).click();
      addCounterForSection(groupname, layerType);
    }
  
    addButton({
      id = "custom-btn",
      location = "top",
      text = "A custom button",
      link = "#",
      title = "A custom button",
    }) {
      let btn = document.getElementById(id);
  
      if (!btn) {
        let btnHtml = `<li id="${id}" onclick="window.open('${link}', '_blank');" class="list-group-item menu-button" style="cursor: pointer; padding: 10px 1px;"><div class="capa-title"><div class="name-layer" style="align-self: center;"><a href="#"><span data-toggle2="tooltip" title="${title}">${text}</span></a></div><div class="zoom-layer" style="align-self: center;"><i class="fas fa-external-link" title="Abrir link"></i></div></div></li>`;
  
        let menuItems = document.getElementById("sidebar"); //document.getElementsByClassName('menu5 panel-default');
        if (location === "top") {
          menuItems.insertAdjacentHTML("beforebegin", btnHtml);
        }
        if (location === "bottom") {
          menuItems.insertAdjacentHTML("afterend", btnHtml);
        }
      }
    }
  
    removeButton(id) {
      let btn = document.getElementById(id);
      if (btn) {
        btn.remove();
      }
    }
  }
  
import 

class Printer {
    imprimir(itemComposite) {
      return "";
    }
  }

  class ImpresorItemHTML extends Impresor {
    imprimir(item) {
      var childId = item.getId();
      let lyr = item.capa,
        legend,
        legendParams = _LEGEND_PARAMS + _LEGEND_OPTIONS + "forceTitles:off;forceLabels:off;",
        aux = {
          ...item,
          childid: childId,
          display_options: false,
          type: lyr.servicio,
        };
      app.setLayer(aux);
      app.layerNameByDomId[childId] = item.nombre;
  
      if (
        lyr.legendURL === null ||
        typeof lyr.legendURL === "undefined" ||
        lyr.legendURL === ""
      ) {
        if (lyr.servicio === "wms") {
          lyr.legendURL =
            lyr.host +
            "?service=WMS&request=GetLegendGraphic&format=image%2Fpng&version=1.1.1&layer=" +
            lyr.nombre;
        } else {
          lyr.legendURL = item.legendImg || ERROR_IMG;
        }
      }
      legend = lyr.legendURL.includes("GetLegendGraphic")
        ? lyr.legendURL + legendParams
        : lyr.legendURL;
  
      // following line adds layer when click is made
      let legendImg = `<div class='legend-layer'><img class='legend-img' style='width:20px;height:20px' loading='lazy' src='${legend}' onerror='showImageOnError(this);' onload='adaptToImage(this.parentNode)'></div>`;
      let activated = item.visible == true ? " active " : "",
        btnhtml = "";
  
      const btn = document.createElement("li");
      btn.id = childId;
      btn.classList = "capa list-group-item" + activated;
      btn.style.padding = "10px 1px 10px 1px";
  
      const btn_title = document.createElement("div");
      btn_title.className = "capa-title";
      btn_title.innerHTML = legendImg;
  
      const btn_name = document.createElement("div");
      btn_name.className = "name-layer";
      btn_name.setAttribute("onClick", `gestorMenu.muestraCapa(\'${childId}\')`);
      btn_name.style.alignSelf = "center";
  
      const btn_link = document.createElement("a");
      btn_link.setAttribute("nombre", item.nombre);
      btn_link.href = "#";
  
      const btn_tooltip = document.createElement("span");
      btn_tooltip.setAttribute("data-toggle2", "tooltip");
      btn_tooltip.title = item.descripcion;
      btn_tooltip.innerHTML = item.titulo
        ? item.titulo.replace(/_/g, " ")
        : "por favor ingrese un nombre";
  
      const btn_zoom = document.createElement("div");
      btn_zoom.className = "zoom-layer";
      btn_zoom.setAttribute("layername", item.nombre);
      btn_zoom.style.alignSelf = "center";
  
      const btn_zoom_icon = document.createElement("i");
      btn_zoom_icon.classList = "fas fa-search-plus";
      btn_zoom_icon.title = "Zoom a capa";
  
      const btn_options_icon_div = document.createElement("div");
      btn_options_icon_div.className = "layer-options-icon";
      btn_options_icon_div.setAttribute("layername", item.nombre);
      btn_options_icon_div.title = "Opciones";
  
      const btn_options_icon = document.createElement("i");
      btn_options_icon.classList = "fas fa-angle-down";
      btn_options_icon.title = "Zoom a capa";
  
      const btn_options_list = document.createElement("div");
      btn_options_list.className = "display-none";
      btn_options_list.id = "layer-options-" + item.nombre;
  
      const btn_options = document.createElement("div");
      btn_options.className = "display-none";
      btn_options.id = "layer-options-" + item.nombre;
  
      if (loadLayerOptions) {
        btn.style.padding = "10px 1px 1px 1px";
        btn_name.removeAttribute("style");
        btn_zoom.removeAttribute("style");
        btn_options_icon_div.appendChild(btn_options_icon);
      }
  
      btn_link.appendChild(btn_tooltip);
      btn_name.appendChild(btn_link);
      btn_title.appendChild(btn_name);
  
      btn_zoom.appendChild(btn_zoom_icon);
      btn_title.appendChild(btn_zoom);
  
      btn.appendChild(btn_title);
      btn.appendChild(btn_options_icon_div);
      btn.appendChild(btn_options);
  
      return btn.outerHTML;
    }
  }
  
  class ImpresorItemWMSSelector extends Impresor {
    imprimir(itemComposite) {
      var childId = itemComposite.getId();
  
      return (
        "<option value='" +
        childId +
        "'>" +
        (itemComposite.titulo
          ? itemComposite.titulo.replace(/_/g, " ")
          : "por favor ingrese un nombre") +
        "</option>"
      );
    }
  }
  
  class ImpresorItemCapaBaseHTML extends Impresor {
    imprimir(itemComposite) {
      var childId = itemComposite.getId();
      let aux = {
        ...itemComposite,
        childid: childId,
        display_options: false,
        type: itemComposite.capa.servicio,
      };
      app.setLayer(aux);
      app.layerNameByDomId[childId] = itemComposite.nombre;
  
      var titulo = itemComposite.titulo
        ? itemComposite.titulo.replace(/_/g, " ")
        : "por favor ingrese un nombre";
  
      const OVERLAY_SWITCH = document.createElement("div");
      if (app.hillshade) {
        const enableHillshade = app.hillshade.addTo.find(
          (el) => el === itemComposite.capa.nombre
        );
        if (enableHillshade) {
          const OVERLAY_CHECKBOX = document.createElement("input");
          OVERLAY_CHECKBOX.type = "checkbox";
          OVERLAY_CHECKBOX.id = "switch-" + itemComposite.capa.nombre;
          OVERLAY_CHECKBOX.title = itemComposite.capa.nombre;
          OVERLAY_CHECKBOX.classList.add("switch");
          OVERLAY_CHECKBOX.classList.add("hillshade");
          OVERLAY_CHECKBOX.disabled = true;
  
          if(OVERLAY_CHECKBOX.title == gestorMenu.getActiveBasemap()){
            OVERLAY_CHECKBOX.disabled = false;
          }
  
          OVERLAY_CHECKBOX.setAttribute("onclick", "hillShade()");
  
          const OVERLAY_TOOLTIP = document.createElement("span");
          OVERLAY_TOOLTIP.classList.add("tooltiptext");
          OVERLAY_TOOLTIP.innerHTML =
            app.hillshade.switchLabel ?? "add Esri hillshade";
  
          const OVERLAY_LABEL = document.createElement("label");
          OVERLAY_LABEL.setAttribute("for", OVERLAY_CHECKBOX.id);
          OVERLAY_LABEL.appendChild(OVERLAY_TOOLTIP);
  
          OVERLAY_SWITCH.setAttribute("onclick", "event.stopPropagation()");
          OVERLAY_SWITCH.appendChild(OVERLAY_CHECKBOX);
          OVERLAY_SWITCH.appendChild(OVERLAY_LABEL);
        }
      }
  
      const iconSvg = `
              <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 92 92" enable-background="new 0 0 92 92" xml:space="preserve">
                  <path fill="${DEFAULT_ZOOM_INFO_ICON_COLOR}" id="XMLID_89_" d="M43.3,73.8c-0.8,0-1.6-0.3-2.2-0.8c-1-0.8-1.5-2.1-1.2-3.4l4.9-25l-2.7,1.5c-1.7,0.9-3.8,0.4-4.8-1.3
                      c-0.9-1.7-0.4-3.8,1.3-4.8l9.3-5.3c1.2-0.7,2.7-0.6,3.8,0.2c1.1,0.8,1.6,2.2,1.4,3.5L48,64.4l4.2-1.8c1.8-0.8,3.8,0,4.6,1.8
                      c0.8,1.8,0,3.8-1.8,4.6l-10.3,4.5C44.3,73.7,43.8,73.8,43.3,73.8z M53.2,26c0.9-0.9,1.5-2.2,1.5-3.5c0-1.3-0.5-2.6-1.5-3.5
                      c-0.9-0.9-2.2-1.5-3.5-1.5c-1.3,0-2.6,0.5-3.5,1.5c-0.9,0.9-1.5,2.2-1.5,3.5c0,1.3,0.5,2.6,1.5,3.5c0.9,0.9,2.2,1.5,3.5,1.5
                      C51,27.5,52.3,27,53.2,26z M92,46C92,20.6,71.4,0,46,0S0,20.6,0,46s20.6,46,46,46S92,71.4,92,46z M84,46c0,21-17,38-38,38S8,67,8,46
                      S25,8,46,8S84,25,84,46z"
                  />
              </svg>
          `;
  
      let minZoom = DEFAULT_MIN_ZOOM_LEVEL;
      let maxZoom = DEFAULT_MAX_ZOOM_LEVEL;
      const layer = baseLayers[gestorMenu.getLayerNameById(childId)];
      if (layer && layer.hasOwnProperty("zoom")) {
        minZoom = layer.zoom.min;
        maxZoom = layer.zoom.max;
      }
  
      const BASEMAP_THUMBNAIL = document.createElement("img");
      BASEMAP_THUMBNAIL.classList.add("img-rounded");
      BASEMAP_THUMBNAIL.loading = "lazy";
      BASEMAP_THUMBNAIL.src = itemComposite.getLegendImg();
      BASEMAP_THUMBNAIL.onerror = showImageOnError(this);
      BASEMAP_THUMBNAIL.alt = titulo;
  
      const TITLE_PARAGRAPH = document.createElement("p");
      TITLE_PARAGRAPH.style.margin = 0;
      TITLE_PARAGRAPH.innerText = titulo;
  
      const BASEMAP_TITLE = document.createElement("div");
      BASEMAP_TITLE.classList.add("non-selectable-text");
      BASEMAP_TITLE.appendChild(TITLE_PARAGRAPH);
  
      const BASEMAP_INFO = document.createElement("div");
      BASEMAP_INFO.classList.add("base-layer-item-info");
      BASEMAP_INFO.appendChild(BASEMAP_THUMBNAIL);
      BASEMAP_INFO.appendChild(BASEMAP_TITLE);
  
      const BASEMAP_LEGEND_IMG = itemComposite.legend ?? null;
      const LEGEND_BTN_TEXT = STRINGS.basemap_legend_button_text;
  
      const BASEMAP_LEGEND = document.createElement("button");
      BASEMAP_LEGEND.innerHTML = LEGEND_BTN_TEXT;
      BASEMAP_LEGEND.setAttribute(
        "onclick",
        `clickReferencias("${BASEMAP_LEGEND_IMG}");`
      );
  
      const BASEMAP_TOOLTIP = document.createElement("span");
      BASEMAP_TOOLTIP.id = itemComposite.nombre + "-tooltip";
      BASEMAP_TOOLTIP.classList.add("tooltiptext");
      BASEMAP_TOOLTIP.innerHTML = `<span>${STRINGS.basemap_min_zoom}<b>${minZoom}</b>${STRINGS.basemap_max_zoom}<b>${maxZoom}</b></span>`;
      BASEMAP_TOOLTIP.style =
        "-webkit-flex-direction: column; flex-direction: column; width: fit-content; height: fit-content; flex: 1 1 auto; padding: 5px;";
      BASEMAP_LEGEND_IMG ? BASEMAP_TOOLTIP.append(BASEMAP_LEGEND) : "";
  
      const INFO_ICON = document.createElement("div");
      INFO_ICON.classList.add("zoom-info-icon");
      INFO_ICON.innerHTML = iconSvg;
      INFO_ICON.appendChild(BASEMAP_TOOLTIP);
      INFO_ICON.setAttribute(
        "onclick",
        `let tooltips = document.querySelectorAll('.tooltiptext');
        tooltips.forEach(function(tooltip){
          if (tooltip.classList.contains("visible") && tooltip.id !== "${BASEMAP_TOOLTIP.id}") {
            toggleVisibility(tooltip.id);
          }
        });
        toggleVisibility("${BASEMAP_TOOLTIP.id}");
        event.stopPropagation();
        `
      );
  
      const SECOND_DIV = document.createElement("div");
      SECOND_DIV.classList.add("base-layer-item");
      SECOND_DIV.setAttribute("nombre", itemComposite.nombre);
      SECOND_DIV.href = "#";
      SECOND_DIV.appendChild(BASEMAP_INFO);
      SECOND_DIV.appendChild(OVERLAY_SWITCH);
      SECOND_DIV.appendChild(INFO_ICON);
  
      const FIRST_DIV = document.createElement("div");
      FIRST_DIV.style.verticalAlign = "top";
      FIRST_DIV.appendChild(SECOND_DIV);
  
      const BASEMAP_ITEM = document.createElement("li");
      BASEMAP_ITEM.classList.add("list-group-item");
      BASEMAP_ITEM.id = childId;
      BASEMAP_ITEM.title = itemComposite.capa.nombre;
      BASEMAP_ITEM.setAttribute(
        "onclick", 
        `function handleClick(){
  
          document.getElementById('collapseBaseMapLayers').classList.toggle('in')
          gestorMenu.muestraCapa("${childId}")
          
          let checkboxes = document.querySelectorAll('.hillshade')
          checkboxes.forEach(function(checkbox) {
            
            if(checkbox.title == gestorMenu.getActiveBasemap()){
              
              checkbox.disabled = false;
              
            }else{
              if(checkbox.checked == true){  
                hillShade()
                checkbox.checked = false;
              }
              checkbox.disabled = true;
            }
          });
        }
        if(gestorMenu.getActiveBasemap() != "${BASEMAP_ITEM.title}"){
          handleClick();  
          }else{
            document.getElementById('collapseBaseMapLayers').classList.toggle('in')
          }
        `
        ); // 2nd sentence hides basemaps menu after click
        BASEMAP_ITEM.appendChild(FIRST_DIV);
        
      return BASEMAP_ITEM.outerHTML; // TODO: change reference fn for expect an object instead string
    }
  }
  
  class ImpresorGrupoHTML extends Impresor {
    imprimir(itemComposite) {
      var listaId = itemComposite.getId();
      var itemClass = "menu5";
      let seccion = itemComposite.seccion;
  
      var active = itemComposite.getActive() == true ? " in " : "";
  
      return (
        '<div id="' +
        listaId +
        '" class="' +
        itemClass +
        ' panel-default">' +
        '<div class="panel-heading">' +
        '<h4 class="panel-title">' +
        '<a id="' +
        listaId +
        '-a" data-toggle="collapse" data-parent="#accordion1" href="#' +
        itemComposite.seccion +
        '" class="item-group-title">' +
        itemComposite.nombre +
        "</a>" +
        "<div class='item-group-short-desc'><a data-toggle='collapse' data-toggle2='tooltip' title='" +
        itemComposite.descripcion +
        "' href='#" +
        itemComposite.seccion +
        "'>" +
        itemComposite.shortDesc +
        "</a></div>" +
        "</h4>" +
        "</div>" +
        "<div id='" +
        itemComposite.seccion +
        "' class='panel-collapse collapse" +
        active +
        "'>" +
        '<div class="panel-body">' +
        itemComposite.itemsStr +
        "</div>" +
        "</div>" +
        "</div>"
      );
    }
  }
  
  class ImpresorGroupWMSSelector extends Impresor {
    imprimir(itemComposite) {
      var listaId = itemComposite.getId();
  
      return (
        "<option value='" + listaId + "'>" + itemComposite.nombre + "</option>"
      );
    }
  }
  
  class ImpresorCapasBaseHTML extends Impresor {
    imprimir(itemComposite) {
      var listaId = itemComposite.getId();
      // Only one basemap-selector
      if ($(".basemap-selector a[data-toggle='collapse']").length == 0) {
        const baseMapsMenu = document.createElement("a");
        baseMapsMenu.classList = "leaflet-control-layers-toggle";
        baseMapsMenu.title = itemComposite.nombre;
        baseMapsMenu.setAttribute("role", "button");
        baseMapsMenu.setAttribute("data-toggle", "collapse");
        baseMapsMenu.setAttribute("aria-expanded", "false");
        //baseMapsMenu.setAttribute('aria-controls', 'collapseExample');
        //baseMapsMenu.href = '#collapseBaseMapLayers';
  
        const baseMapsContainer = document.createElement("ul");
        baseMapsContainer.id = "collapseBaseMapLayers";
        baseMapsContainer.classList = "collapse pull-right";
  
        const baseMapsList = document.createElement("ul");
        baseMapsList.classList = "list-inline";
        baseMapsList.innerHTML = itemComposite.itemsStr;
  
        baseMapsContainer.appendChild(baseMapsList);
        baseMapsMenu.appendChild(baseMapsContainer);
  
        baseMapsMenu.addEventListener("click", function (event) {
          event.preventDefault();
          baseMapsContainer.classList.toggle("in");
        });
        baseMapsMenu.addEventListener("dblclick", function (event) {
          event.stopPropagation();
        });
  
        return baseMapsMenu;
  
        /* return '<a class="leaflet-control-layers-toggle pull-left" role="button" data-toggle="collapse" href="#collapseBaseMapLayers" aria-expanded="false" aria-controls="collapseExample" title="' + itemComposite.nombre + '"></a>' +
                  '<div class="collapse pull-right" id="collapseBaseMapLayers">' +
                  '<ul class="list-inline">' + itemComposite.itemsStr + '</ul>' +
                  '</div>'; */
      }
    }
  }
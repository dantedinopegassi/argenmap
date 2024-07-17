async function loadDefaultJson() {
    $.getJSON("./src/config/default/data.json", async function (data) {
      $.getJSON(
        "./src/config/default/preferences.json",
        async function (preferences) {
          gestorMenu.setLegendImgPath(
            "src/config/default/styles/images/legends/"
          );
          await loadTemplate({ ...data, ...preferences }, true);
        }
      );
    });
  }

  async function fetchJson(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  }
  
  async function loadDefaultJson(gestorMenu: GestorMenu) {
    try {
      const data = await fetchJson("./src/config/data.json");
      try {
        const preferences = await fetchJson("./src/config/preferences.json");
        gestorMenu.setLegendImgPath("src/config/styles/images/legends/");
        await loadTemplate({ ...data, ...preferences }, false);
      } catch (error) {
        console.warn("Template not found. Default configuration will be loaded.");
        await loadDefaultJson();
      }
    } catch (error) {
      console.warn("Template not found. Default configuration will be loaded.");
      await loadDefaultJson();
    }
  }
/********************************************************************|
| 1. Funcion original                                                |
|********************************************************************/

// $.getJSON("./src/config/data.json", async function (data) {
//   $.getJSON("./src/config/preferences.json", async function (preferences) {
//     gestorMenu.setLegendImgPath("src/config/styles/images/legends/");
//     await loadTemplate({ ...data, ...preferences }, false);
//   }).fail(async function (jqxhr, textStatus, error) {
//     console.warn("Template not found. Default configuration will be loaded.");
//     await loadDefaultJson();
//   });
//   }).fail(async function (jqxhr, textStatus, error) {
//   console.warn("Template not found. Default configuration will be loaded.");
//   await loadDefaultJson();
// });




/********************************************************************|
| 1. Funcion nativa con IIFE                                         |
|********************************************************************/

// async function fetchJson(url:string) {
//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error(`HTTP error! Status: ${response.status}`);
//   }
//   return response.json();
// }

// (async function() {
//   try {
//     const data = await fetchJson("./src/config/data.json");
//     try {
//       const preferences = await fetchJson("./src/config/preferences.json");
//       gestorMenu.setLegendImgPath("src/config/styles/images/legends/");
//       await loadTemplate({ ...data, ...preferences }, false);
//     } catch (error) {
//       console.warn("Template not found. Default configuration will be loaded.");
//       await loadDefaultJson();
//     }
//   } catch (error) {
//     console.warn("Template not found. Default configuration will be loaded.");
//     await loadDefaultJson();
//   }
// })();




/********************************************************************|
| 1. Funcion nativa con async                                        |
|********************************************************************/

async function fetchJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

async function loadConfiguration(gestorMenu: GestorMenu) {
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
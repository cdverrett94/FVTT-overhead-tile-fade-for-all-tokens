const MODULE_NAME = "overhead-tile-fade-for-all-tokens";

globalThis.otffat = {
  counter: 0,
  anyRadialTiles: false,
  descriptions: {
    OFF: "Provides the Foundry Default functionality where an overhead tile is only faded for the token that is under the tile.",
    BY_VISIBILITY: "This mode will fade an overhead tile as long as the token has visibility on the token under the tile."
  }
}

const updateOcclusion = function(wrapped, tokens) {
  const numberOfTiles = canvas.foreground.tiles.length;
  globalThis.otffat.counter = globalThis.otffat.counter ?? 0;

  if(this.data.flags[MODULE_NAME]?.mode !== "OFF") {
    //refresh vision to get accurate token.visible data. check put in place to prevent sight refresh more than once per ForegroundLayer#updateOcclusion
    if(globalThis.otffat.counter === 0) { // prevents updating vision while looping through every tile. Should only update on first tile.
      if(isNewerVersion(game.version ?? game.data.version, 0.8)) canvas.sight.initializeSources();
      canvas.sight.refresh();
    }
    tokens = canvas.tokens.placeables.filter(token => token.visible);
  }

  if(globalThis.otffat.anyRadialTiles) canvas.foreground._drawOcclusionShapes(tokens);

  globalThis.otffat.counter = (globalThis.otffat.counter >= numberOfTiles - 1)? 0 : globalThis.otffat.counter + 1;
  return wrapped(tokens);
}

// update if there are any radial tiles that are affected by this module. Prevents unecessary calls to ForegroundLayer#_drawOcclusionShapes
const updateAnyRadialTiles = function() {
  globalThis.otffat.anyRadialTiles = !!canvas.foreground.tiles.find(tile => tile.data.flags["overhead-tile-fade-for-all-tokens"]?.mode !== "OFF" && tile.data.occlusion.mode === CONST.TILE_OCCLUSION_MODES.RADIAL)
}

// trigger occlusion update when a tile is updated so new OTFFAT settings are taken into account immediately
const triggerOcclusionUpdate = function() {
  canvas.foreground.updateOcclusion();
}

// add off/on setting per tile
const renderTileConfig = function(sheet, html) {
  let tile = sheet.object;
  let flags = tile.data.flags[MODULE_NAME];

  let mode = flags?.mode ?? "BY_VISIBILITY";

  html.find('div.tab[data-tab="overhead"]').append(`
    <h2>Overhead Tile Fade for All Tokens Settings</h2>
    <div class="form-group">
      <label>Mode:</label>
      <select id="otffat_mode_select_${tile.id}" name="flags.${MODULE_NAME}.mode">
        <option value="OFF" ${(mode === "OFF")? 'selected':''}>Foundry Default (Off)</option>
        <option value="BY_VISIBILITY" ${(mode === "BY_VISIBILITY")? 'selected':''}>By Token Visibility</option>
      </select>
    </div>
    <p class="notes" id="otffat_mode_descriptions_${tile.id}">${globalThis.otffat.descriptions[mode]}</p>
    <h2></h2>
  `);

  $(`#otffat_mode_select_${tile.id}`).change(function() {
    let new_mode = $(this).val();
    let id = $(this).attr('id').split("otffat_mode_select_")[1];
    $(`#otffat_mode_descriptions_${id}`).text(globalThis.otffat.descriptions[new_mode]);
  });

  sheet.setPosition({height: "auto"});
}

Hooks.on("libWrapper.Ready", function() {
  libWrapper.register(MODULE_NAME, "Tile.prototype.updateOcclusion", updateOcclusion, "WRAPPER");
});

Hooks.on('renderTileConfig', renderTileConfig);

Hooks.on('canvasReady', updateAnyRadialTiles);
Hooks.on('createTile', updateAnyRadialTiles);
Hooks.on('updateTile', updateAnyRadialTiles);

Hooks.on('updateTile', triggerOcclusionUpdate);
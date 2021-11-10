class OverheadTileFade {
  static MODULE_NAME = "overhead-tile-fade-for-all-tokens";

  static updateOcclusion(wrapped, tokens) {
    // Added to original to filter tokens down to those that should be checked for this tile
    if (this.data.occlusion.mode === CONST.TILE_OCCLUSION_MODES.FADE && this.data.flags[module]?.mode !== "OFF") {
      if (this.data.flags[module]?.mode === "ALL") {
        tokens = canvas.tokens.placeables;
      } else if (this.data.flags[module]?.mode === "BY_VISIBILITY") {
        canvas.sight.refresh();
        tokens = canvas.tokens.placeables.filter(token => token.visible);
      } else {
        tokens = canvas.tokens.placeables.filter(token => {
          if (canvas.tokens.controlled.includes(token)) return true;
          if (this.data.flags[OverheadTileFade.MODULE_NAME]?.hidden !== true && token.data.hidden === true) return false;
          if (this.data.flags[OverheadTileFade.MODULE_NAME]?.friendly !== false && token.data.disposition === 1) return true;
          if (this.data.flags[OverheadTileFade.MODULE_NAME]?.neutral !== false && token.data.disposition === 0) return true;
          if (this.data.flags[OverheadTileFade.MODULE_NAME]?.hostile !== false && token.data.disposition === -1) return true;
          return false;
        });
      }
    }
    return wrapped(tokens);
  }

  static renderTileConfig(sheet, html) {
    let tile = sheet.object;
    let flags = tile.data.flags[OverheadTileFade.MODULE_NAME];

    const OTFFAT_DESCRIPTIONS = {
      OFF: "Provides the Foundry Default functionality where an overhead tile is only faded for the token that is under the tile.",
      ALL: "This mode will fade an overhead tile for all tokens if any other token is under the tile, regardless of type or visibility.",
      BY_DISPOSITION: "This mode allows for an overhead tile to be faded for all tokens as long as the token under the tile is one of the dispositions (i.e. friendly, neutral, hostile) chosen below. Also a setting for whether hidden tokens should be shown if the disposition matches.",
      BY_VISIBILITY: "This mode will fade an overhead tile as long as the token has visibility on the token under the tile."
    };

    let mode = flags?.mode || "BY_DISPOSITION";

    html.find('div.tab[data-tab="overhead"]').append(`
            <h2>Overhead Tile Fade for All Tokens Settings</h2>
            <div class="form-group">
                <label>Mode:</label>
                <select id="otffat_mode_select_${tile.id}" name="flags.${OverheadTileFade.MODULE_NAME}.mode">
                    <option value="OFF" ${(mode === "OFF")? 'selected':''}>Foundry Default</option>
                    <option value="ALL" ${(mode === "ALL")? 'selected':''}>All Tokens</option>
                    <option value="BY_VISIBILITY" ${(mode === "BY_VISIBILITY")? 'selected':''}>By Token Visibility</option>
                    <option value="BY_DISPOSITION" ${(mode === "BY_DISPOSITION")? 'selected':''}>By Token Disposition</option>
                </select>
            </div>
            <p class="notes" id="otffat_mode_descriptions_${tile.id}">${OTFFAT_DESCRIPTIONS[mode]}</p>
            <div id="otffat_mode_settings_BY_DISPOSITION" style="margin-top: 15px;">
                <p class="notes">Settings for when the mode is By Token Disposition</p>
                <div class="form-group fade-settings" id="fade-for-type">
                    <label>Dispositions:</label>
                    Friendly: <input type="checkbox" name="flags.${OverheadTileFade.MODULE_NAME}.friendly" data-dtype="Boolean" ${(flags?.friendly === false)? '':'checked="checked"'} />
                    Neutral: <input type="checkbox" name="flags.${OverheadTileFade.MODULE_NAME}.neutral" data-dtype="Boolean" ${(flags?.neutral === false)? '':'checked="checked"'} />
                    Hostile: <input type="checkbox" name="flags.${OverheadTileFade.MODULE_NAME}.hostile" data-dtype="Boolean" ${(flags?.hostile === false)? '':'checked="checked"'} />
                </div>
                <div class="form-group fade-settings" id="fade-for-hidden">
                    <label>Fade for hidden tokens?</label>
                    <input type="checkbox" name="flags.${OverheadTileFade.MODULE_NAME}.hidden" data-dtype="Boolean" ${(flags?.hidden !== true)? '':'checked="checked"'} />
                </div>
            </div>
            <h2></h2>
        `);

    $(`#otffat_mode_select_${tile.id}`).change(function() {
      let new_mode = $(this).val();
      let id = $(this).attr('id').split("otffat_mode_select_")[1];
      $(`#otffat_mode_descriptions_${id}`).text(OTFFAT_DESCRIPTIONS[new_mode]);
    });

  }
}

Hooks.on("libWrapper.Ready", function() {
  libWrapper.register(module, "Tile.prototype.updateOcclusion", OverheadTileFade.updateOcclusion, "WRAPPER");
});

Hooks.on('renderTileConfig', OverheadTileFade.renderTileConfig);
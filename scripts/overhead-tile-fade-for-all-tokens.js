const MODULE_NAME = 'overhead-tile-fade-for-all-tokens';

const includeRgx = new RegExp(`/modules/${MODULE_NAME}/scripts/${MODULE_NAME}.js`);
CONFIG.compatibility.includePatterns.push(includeRgx);

function fadeByTokenVisibility(tile) {
  return tile.document.occlusion.mode !== CONST.TILE_OCCLUSION_MODES.NONE && tile.document.occlusion.mode !== CONST.TILE_OCCLUSION_MODES.ROOF && tile.document.flags[MODULE_NAME]?.mode !== 'OFF';
}

function updateOcclusion(wrapped, tokens) {
  if (fadeByTokenVisibility(this)) {
    tokens = canvas.tokens.placeables.filter((token) => token.visible);
  }

  wrapped(tokens);
}

function drawOcclusionShapes(wrapped, tokens) {
  if (canvas.foreground.tiles.some(fadeByTokenVisibility)) tokens = canvas.tokens.placeables.filter((token) => token.visible);
  return wrapped(tokens);
}

Hooks.on('sightRefresh', () => {
  // if there's a overhead tile that depends on token visibility, schedule a foreground refesh to recalculate occlusion states
  // otherwise draw all visible tokens in the radial occlusion mask
  if (canvas.foreground.tiles.some(fadeByTokenVisibility)) {
    canvas.perception.schedule({ foreground: { refresh: true } });
  } else {
    canvas.foreground._drawOcclusionShapes(canvas.tokens.controlled);
  }
});

// add off/on settings per tile
const renderTileConfig = function (sheet, html) {
  let tile = sheet.object;
  let flags = tile.flags[MODULE_NAME];

  let mode = flags?.mode ?? 'BY_VISIBILITY';

  const descriptions = {
    OFF: 'Provides the Foundry Default functionality where an overhead tile is only faded for the token that is under the tile.',
    BY_VISIBILITY: 'This mode will fade an overhead tile as long as the token has visibility on the token under the tile.',
  };

  html.find('div.tab[data-tab="overhead"]').append(`
    <div class="form-group">
      <label>Occlusion By Visibility</label>
      <select id="otffat_mode_select_${tile.id}" name="flags.${MODULE_NAME}.mode">
        <option value="OFF" ${mode === 'OFF' ? 'selected' : ''}>Foundry Default (Off)</option>
        <option value="BY_VISIBILITY" ${mode === 'BY_VISIBILITY' ? 'selected' : ''}>By Token Visibility</option>
      </select>
    </div>
    <p class="notes" id="otffat_mode_descriptions_${tile.id}">${descriptions[mode]} Does not affect Roof tiles.</p>
  `);

  $(`#otffat_mode_select_${tile.id}`).change(function () {
    let new_mode = $(this).val();
    let id = $(this).attr('id').split('otffat_mode_select_')[1];
    $(`#otffat_mode_descriptions_${id}`).text(descriptions[new_mode]);
  });

  sheet.setPosition({ height: 'auto' });
};

Hooks.on('libWrapper.Ready', function () {
  libWrapper.register(MODULE_NAME, 'Tile.prototype.updateOcclusion', updateOcclusion, 'WRAPPER');
  libWrapper.register(MODULE_NAME, 'ForegroundLayer.prototype._drawOcclusionShapes', drawOcclusionShapes, 'WRAPPER');
});

Hooks.on('renderTileConfig', renderTileConfig);
Hooks.on('updateTile', (document, change) => {
  // trigger occlusion update when a tile is updated so new OTFFAT settings are taken into account immediately
  if (change.flags?.[MODULE_NAME]?.mode !== undefined) {
    canvas.perception.schedule({ foreground: { refresh: true } });
  }
});

Hooks.on("ready", function() {
    //CONFIG.debug.hooks = true
    const module = "overhead-tile-fade-for-all-tokens";
    const updateOcclusionForAllTokens = function({sendSocket = true, tiles = canvas.foreground.tiles} = {}) {
         tiles = tiles.filter(tile => tile.data.flags[module]?.activate !== false)
         if(tiles.length > 0) {
            for(tile of tiles) {
                    if(tile.data.occlusion.mode === CONST.TILE_OCCLUSION_MODES.FADE) {
                    tile.updateOcclusion(canvas.tokens.placeables);
                }
            }
            canvas.foreground.refresh();
            if(sendSocket) game.socket.emit(`module.${module}`);
        }
    }

    const renderTileConfig = function(sheet, html) {
        let tile = sheet.object;
        let flags = tile.data.flags[module]

        html.find('div.tab[data-tab="overhead"]').append(`
            <h3>Overhead Tile Fade for All Tokens Settings</h3>
            <div class="form-group">
                <label>Fade Overhead Tiles Based For All?</label>
                <input type="checkbox" name="flags.${module}.activate" ${(flags?.activate === false)? '':'checked="checked"'} />
            </div>
        `)
    }

    Hooks.on("sightRefresh", function() { updateOcclusionForAllTokens() });
    Hooks.on("updateTile", function(tile, changes, options, userid) {
        if(changes.occlusion?.mode === CONST.TILE_OCCLUSION_MODES.FADE || "x" in changes || "y" in changes) {
            updateOcclusionForAllTokens({tiles: [tile._object], sendSocket: false});
        }
    });
    game.socket.on(`module.${module}`, function() { updateOcclusionForAllTokens({sendSocket: false}) });

    Hooks.on('renderTileConfig', renderTileConfig)
});
Hooks.on("ready", function() {
     const updateOcclusionForAllTokens = function({sendSocket = true, tiles = canvas.foreground.tiles} = {}) {
         for(tile of tiles) {
            if(tile.data.occlusion.mode === CONST.TILE_OCCLUSION_MODES.FADE) {
                tile.updateOcclusion(canvas.tokens.placeables);
            }
        }
        canvas.foreground.refresh();
        if(sendSocket) game.socket.emit('module.overhead-tile-fade-for-all-tokens');
    }

    Hooks.on("sightRefresh", function() { updateOcclusionForAllTokens() });
    Hooks.on("updateTile", function(tile, changes, options, userid) {
        if(changes.occlusion?.mode === CONST.TILE_OCCLUSION_MODES.FADE || "x" in changes || "y" in changes) {
            updateOcclusionForAllTokens({tiles: [tile._object], sendSocket: false});
        }
    });
    game.socket.on('module.overhead-tile-fade-for-all-tokens', function() { updateOcclusionForAllTokens({sendSocket: false}) });
});
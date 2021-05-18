Hooks.on("ready", function() {
    Hooks.on('updateToken', function(token, changes, options, userid) {
        if("x" in changes || "y" in changes) {
            for(tile of canvas.foreground.tiles) {
                if(tile.data.occlusion.mode === CONST.TILE_OCCLUSION_MODES.FADE) {
                    let currentOccluded = tile.occluded;
                    tile.updateOcclusion(canvas.tokens.placeables)
                    let newOccluded = tile.occluded

                    if(currentOccluded !== newOccluded) game.socket.emit("module.overhead-tile-fade-for-all-tokens", {foreground: {refresh: true}})
                }
            }
        }
    });

    game.socket.on("module.overhead-tile-fade-for-all-tokens", function(data) {
        canvas.foreground.refresh();
    });
});
Hooks.on("ready", function() {
    const occlusionOverride = function() {
        let tokens = game.user.isGM ? canvas.tokens.controlled : canvas.tokens.ownedTokens;
        this.renderOcclusionMask();
        for ( let tile of this.tiles ) {
            console.log(tile)
            let oldIsOccluded = tile.occluded
            if(tile.data.occlusion.mode === CONST.TILE_OCCLUSION_MODES.FADE) tokens = canvas.tokens.placeables;
            tile.updateOcclusion(tokens);
            let newIsOccluded = tile.occluded

            console.log(oldIsOccluded, newIsOccluded)

            if(oldIsOccluded !== newIsOccluded) game.socket.emit("module.overhead-tile-fade-for-all-tokens", {foreground: {refresh: true}})
        }
    }


    game.socket.on("module.overhead-tile-fade-for-all-tokens", function(data) {
        console.log('hi')
        canvas.perception.schedule(data)
    })
    ForegroundLayer.prototype.updateOcclusion = occlusionOverride;
});
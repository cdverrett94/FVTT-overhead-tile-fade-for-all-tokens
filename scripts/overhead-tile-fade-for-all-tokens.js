Hooks.on("ready", function() {
    const module = "overhead-tile-fade-for-all-tokens";

    const updateOcclusion = function() {
        let tokens = game.user.isGM ? canvas.tokens.controlled : canvas.tokens.ownedTokens;
        this._drawOcclusionShapes(tokens);
        this.occlusionMask.roofs.removeChildren();
        for ( let tile of this.tiles ) {
           // Added to original to filter tokens down to those that should be checked for this tile
            tokens = game.user.isGM ? canvas.tokens.controlled : canvas.tokens.ownedTokens;
            if(tile.data.occlusion.mode === CONST.TILE_OCCLUSION_MODES.FADE && tile.data.flags[module]?.activate !== false) {
                tokens = canvas.tokens.placeables.filter(function(token) {
                    let tile = this;
                    if(canvas.tokens.controlled.includes(token)) return true;
                    if(tile.data.flags[module]?.hidden !== true && token.data.hidden === true) return false;
                    if(tile.data.flags[module]?.friendly !== false && token.data.disposition === 1) return true;
                    if(tile.data.flags[module]?.neutral !== false && token.data.disposition === 0) return true;
                    if(tile.data.flags[module]?.hostile !== false && token.data.disposition === -1) return true;
                    return false;
                }, tile)
            }
            // Finish added code for function
        
            tile.updateOcclusion(tokens);
            if ( tile.isRoof && (tile.occluded || !this.displayRoofs) ) {
                const s = tile.getRoofSprite();
                if ( !s ) continue;
                s.tint = 0x0000FF;
                this.occlusionMask.roofs.addChild(s); 
            }
        }
    }

    // use libWrapper to wrap method if available
    if (game.modules.get("lib-wrapper")?.active) {
        libWrapper.register(module, "ForegroundLayer.prototype.updateOcclusion", updateOcclusion, "OVERRIDE");
    } else {
        ForegroundLayer.prototype.updateOcclusion = updateOcclusion;
    }

    // Adding settings to the Tile Config
    const renderTileConfig = function(sheet, html) {
        let tile = sheet.object;
        let flags = tile.data.flags[module]

        html.find('div.tab[data-tab="overhead"]').append(`
            <h2>Overhead Tile Fade for All Tokens Settings</h3>
            <div class="form-group">
                <label>Fade This Overhead Tile for All Tokens?</label>
                <input type="checkbox" name="flags.${module}.activate" data-dtype="Boolean" ${(flags?.activate === false)? '':'checked="checked"'} />
            </div>
            <div class="form-group">
                <label>Fade For Players When What Tokens is Under the Tile?</label>
                Friendly: <input type="checkbox" name="flags.${module}.friendly" data-dtype="Boolean" ${(flags?.friendly === false)? '':'checked="checked"'} />
                Neutral: <input type="checkbox" name="flags.${module}.neutral" data-dtype="Boolean" ${(flags?.neutral === false)? '':'checked="checked"'} />
                Hostile: <input type="checkbox" name="flags.${module}.hostile" data-dtype="Boolean" ${(flags?.hostile === false)? '':'checked="checked"'} />
            </div>
            <div class="form-group">
                <label>Fade for hidden tokens?</label>
                <input type="checkbox" name="flags.${module}.hidden" data-dtype="Boolean" ${(flags?.hidden !== true)? '':'checked="checked"'} />
            </div>
        `)
    }

    Hooks.on('renderTileConfig', renderTileConfig)
});
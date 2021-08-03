Hooks.on("ready", function() {
    const module = "overhead-tile-fade-for-all-tokens";

    const updateOcclusion = function(wrapped, tokens) {
        // Added to original to filter tokens down to those that should be checked for this tile
        if(this.data.occlusion.mode === CONST.TILE_OCCLUSION_MODES.FADE && this.data.flags[module]?.activate !== false) {
            tokens = canvas.tokens.placeables.filter(token => {
                if(canvas.tokens.controlled.includes(token)) return true;
                if(this.data.flags[module]?.hidden !== true && token.data.hidden === true) return false;
                if(this.data.flags[module]?.friendly !== false && token.data.disposition === 1) return true;
                if(this.data.flags[module]?.neutral !== false && token.data.disposition === 0) return true;
                if(this.data.flags[module]?.hostile !== false && token.data.disposition === -1) return true;
                return false;
            });
        }
        return wrapped(tokens);
    }

    // use libWrapper to wrap method if available
    if (game.modules.get("lib-wrapper")?.active) {
        libWrapper.register(module, "Tile.prototype.updateOcclusion", updateOcclusion, "WRAPPER");
    } else {
        const oldUpdateOcclusion = Tile.prototype.updateOcclusion;
        Tile.prototype.updateOcclusion = function (tokens) {
            return updateOcclusion.call(this, oldUpdateOcclusion.bind(this), tokens);
        };
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
                <label>Fade For Players When What Tokens are Under the Tile?</label>
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
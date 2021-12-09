# Changelog
## 1.4.4
V9.235 (V9T2) compatibility
Fixed bug where on second load, the tile config sheet wouldn't have its height set

## 1.4.3
V9 compatibility
Changed default mode to by visibility.

## 1.4.2
Fix Macro compendium having duplicate/incorrect old macros.
Fixed issue that prevented tile occlusion from functioning properly right when a token was hidden/revealed by visibility.

## 1.4.1
Change versioning method
Reconfigured the options for fade methods to be:
- Foundry Default - uses the default foundry method where the tile is faded for only the token under the tile
- All - Fade the tile for all tokens regardless of visibility, hidden status, or disposition
- By Disposition - fade the tile if a token that matches the selected disposition and hidden status in the settings
- By Visibility - fade the tile as long as the controllers token has visibility on the token under the tile.

## 0.3.0
 Wrap Tile.prototype.updateOcclusion using "wrapper" instead of ForegroundLayer.prototype.updateOcclusion using "override" by dev7355608

## 0.2.0
Added per tile settings
- Activate fade for all tokens on a per tile basis. defaults to on
- A setting for when certain token types are underneath - fade for all tokens if a player/neutral/hostile token is underneath. Allows you not have the tile fade when an enemy or other token type goes under the tile. Each setting defaults to on.
- Fade for all tokens if there's a hidden token under the tile. This allows you to not have the tile fade for all tokens if there's a hidden token. Defaults to not fade when there's a hidden token.
Added a series of macros to toggle each of the above settings and a last macro to change all of the settings for all controlled tokens.

## 0.1.0
Initial Release

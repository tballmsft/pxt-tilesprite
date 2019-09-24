//% weight=1000 color="#442255" icon="\uf45c"
//% groups='["Tiles", "Events", "Conditions", "Actions"]'
//% blockGap=8
namespace TileWorld {

    let myWorld = new TileWorld();
    /**
     * Set the map for placing tiles in the scene
     * @param map
     */
    //% blockId=TWsettilemap block="set tile map to %map=tilemap_image_picker"
    //% group="Tiles"
    export function setTileMap(map: Image) { 
        myWorld.setMap(map) 
    }
    /**
     * Set the background tile for sprites
     * @param color
     */
    //% group="Tiles"
    //% blockId=TWsetbackgroundtile block="set background tile to %color=colorindexpicker"
    export function setBackgroundTile(code: number) { 
        myWorld.setBackgroundTile(code)
    }
    /**
     * Set an image as a tile at the given index. Tiles should be a 16x16 image
     * @param index
     * @param img
     */
    //% blockId=TWsettile block="set tile %index=colorindexpicker to %img=tile_image_picker"
    //% group="Tiles"
    export function setTile(code: number, image: Image) { 
        myWorld.addTiles(code, image)
    }
    /**
     * Set an image as a sprite at the given index. Sprites should be a 16x16 image
     * @param index
     * @param img
     */
    //% blockId=TWsetsprite block="set sprite %index=colorindexpicker to %img=tile_image_picker with $kind=spritekind"
    //% group="Tiles"
    export function addTileSprite(code: number, image: Image, kind: number) { 
        myWorld.addTileSprites(code, image, kind)
    }

    // notifications

    /**
     * Act on a sprite that is resting on a tile
     * @param body code to execute
     */
    //% group="Events" color="#444488"
    //% blockId=TWontilestationary block="on $tile of kind $kind=spritekind at rest"
    //% blockAllowMultiple=1 draggableParameters="reporter"
    export function onTileStationary(kind: number, h: (tile: TileSprite) => void) {
        myWorld.onTileStationary(kind, h);
    }
    /**
     * Act on a sprite that has moved to center of tile
     * @param body code to execute
     */
    //% group="Events" color="#444488"
    //% blockId=TWontilearrived block="on $tile of kind $kind=spritekind arrived"
    //% blockAllowMultiple=1 draggableParameters="reporter"
    export function onTileArrived(kind: number, h: (tile: TileSprite, direction: TileDir) => void) { 
        myWorld.onTileArrived(kind, h)
    }
    /**
     * Act on a sprite that has just moved into new tile
     * @param body code to execute
     */
    //% group="Events" color="#444488"
    //% blockId=TWontiletransition block="on $tile of kind $kind=spritekind transition"
    //% blockAllowMultiple=1 draggableParameters="reporter"
    export function onTileTransition(kind: number, h: (tile: TileSprite, col: number, row: number) => void) { 
        myWorld.onTileTransition(kind, h)
    }
    
    // checks

    /**
     * Check if a direction is one of several values.
     */
    //% group="Conditions" color="#448844"
    //% blockId=TWisoneof block="is %dir=variables_get(direction) one of %c1 %c2 || %c3"
    //% inlineInputMode=inline direction.shadow=tiledir
    export function isOneOf(dir: number, c1: TileDir, c2: TileDir = 0xff, c3: TileDir = 0xff) { 
        myWorld.isOneOf(dir, c1, c2, c3)
    }
    /**
     * Check if a direction is not one of several values.
     */
    //% group="Conditions" color="#448844"
    //% blockId=TWisnotoneof block="is %dir=variables_get(direction) not one of %c1 %c2 || %c3"
    //% inlineInputMode=inline direction.shadow=tiledir
    export function isNotOneOf(dir: number, c1: TileDir, c2: TileDir = 0xff, c3: TileDir = 0xff) { 
        myWorld.isNotOneOf(dir, c1, c2, c3)
    }
}
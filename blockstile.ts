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
    //% blockId=TWsetsprite block="set sprite %index=colorindexpicker to %img=tile_image_picker"
    //% group="Tiles"
    export function addTileSprite(code: number, image: Image) { 
        myWorld.addTileSprites(code, image)
    }
    
    export function getTileSprite(code: number) { 
        return myWorld.getSprite(code)
    }
    export function makeGroup(code: number, code2: number, code3: number = 0xff, code4: number = 0xff) { 
        return myWorld.makeGroup(code, code2, code3, code4)
    }
    
    // notifications
    //% group="Events"
    export function onTileStationary(code: number, h: (ts: TileSprite) => void) { }
    export function onTileArrived(code: number, h: (ts: TileSprite, d: Dir) => void) { }
    export function onTileTransition(code: number, h: (ts: TileSprite, col: number, row: number) => void) { }
    
    // checks
    export function isOneOf(d: Dir, c1: Dir, c2: Dir = 0xff, c3: Dir = 0xff) { }
    export function isNotOneOf(d: Dir, c1: Dir, c2: Dir = 0xff, c3: Dir = 0xff) { }

    // actions
    export function setTileCode(ts: TileSprite, code: number) {
        myWorld.setCode(ts, code)
    }

}
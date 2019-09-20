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
     /**
     * Set the player
     * @param color
     */
    //% group="Tiles"
    //% blockId=TWsetplayer block="set player to %color=colorindexpicker"
    export function setPlayer(code: number) { 
        let player = myWorld.getSprite(code)
        bindToController(player)
        scene.cameraFollowSprite(player)
    }
    
    // notifications
    //% group="Events"

    /**
     * Act on a sprite that is resting on a tile
     * @param body code to execute
     */
    //% group="Events"
    //% blockId=TWontilestationary block="on %code=colorindexpicker at rest"
    //% blockAllowMultiple=1
    export function onTileStationary(code: number, h: (tile: TileSprite) => void) {
        myWorld.onTileStationary(code, h);
    }
    /**
     * Act on a sprite that has moved to center of tile
     * @param body code to execute
     */
    //% group="Events"
    //% blockId=TWontilearrived block="on %code=colorindexpicker arrived"
    //% blockAllowMultiple=1
    export function onTileArrived(code: number, h: (tile: TileSprite, direction: TileDir) => void) { 
        myWorld.onTileArrived(code, h)
    }
    /**
     * Act on a sprite that has just moved into new tile
     * @param body code to execute
     */
    //% group="Events"
    //% blockId=TWontiletransition block="on %code=colorindexpicker transition"
    //% blockAllowMultiple=1
    export function onTileTransition(code: number, h: (tile: TileSprite, col: number, row: number) => void) { 
        myWorld.onTileTransition(code, h)
    }
    
    // checks
    export function makeGroup(code: number, code2: number, code3: number = 0xff, code4: number = 0xff) {
        return myWorld.makeGroup(code, code2, code3, code4)
    }
    export function isOneOf(d: TileDir, c1: TileDir, c2: TileDir = 0xff, c3: TileDir = 0xff) { 
        myWorld.isOneOf(d, c1, c2, c3)
    }
    export function isNotOneOf(d: TileDir, c1: TileDir, c2: TileDir = 0xff, c3: TileDir = 0xff) { 
        myWorld.isNotOneOf(d, c1, c2, c3)
    }

    // actions
    export function setTileCode(ts: TileSprite, code: number) {
        myWorld.setCode(ts, code)
    }

}
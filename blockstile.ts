//% weight=1000 color="#442255" icon="\uf45c"
//% groups='["Tiles", "Events", "Tests", "Actions"]'
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

    // TODO: can we unify the two below?
    // idea - a sprite is stationary or movable?

    // set $code $image $kind $movable?
    // $code -> $kind, regardless of $movable
    // only movable sprites get events
 
    /**
     * Set an image as a tile at the given index. Tiles should be a 16x16 image
     * @param index
     * @param img
     */
    //% blockId=TWaddsprite block="set $code=colorindexpicker to $kk sprite $image=tile_image_picker with $kind=spritekind"
    //% group="Tiles"
    //% inlineInputMode=inline
    export function addSprite(code: number, image: Image, kk: KindKind, kind: number) {
        if (kk == KindKind.Fixed)
            myWorld.addTiles(code, image)
        else
            myWorld.addTileSprites(code, image, kind)
    }

    /**	
    * Move sprite with buttons	
    * @param color	
    */
    //% group="Tiles"	
    //% blockId=TWmoveButtons block="move $kind=spritekind with buttons"	
    export function moveWithButtons(kind: number) { 
        let sprites = game.currentScene().spritesByKind[kind].sprites()
        sprites.forEach((s) => { 
            if (s instanceof TileSprite) {
                bindToController(<TileSprite>s)}
            } 
        )
    }
    
    // notifications

    /**
     * Act on a sprite that is resting on a tile
     * @param body code to execute
     */
    //% group="Events" color="#444488"
    //% blockId=TWontilestationary block="on change around $kind=spritekind at $tile"
    //% blockAllowMultiple=1 draggableParameters="reporter"
    export function onTileStationary(kind: number, h: (tile: TileSprite) => void) {
        myWorld.onTileStationary(kind, h);
    }

    /**
     * Sprite is at center of tile and received request to move
     * @param body code to execute
     */
    //% group="Events" color="#444488"
    //% blockId=TWontilearrived block="on request of $kind=spritekind at $tile to move $direction"
    //% blockAllowMultiple=1 draggableParameters="reporter"
    export function onTileArrived(kind: number, h: (tile: TileSprite, direction: TileDir) => void) { 
        myWorld.onTileArrived(kind, h)
    }

    /**
     * Sprite has just move into (entered) a tile
     * @param body code to execute
     */
    //% group="Events" color="#444488"
    //% blockId=TWontiletransition block="on $kind=spritekind moved into $tile"
    //% blockAllowMultiple=1 draggableParameters="reporter"
    export function onTileTransition(kind: number, h: (tile: TileSprite) => void) { 
        myWorld.onTileTransition(kind, h)
    }
    
    // checks

    /**
     * Check if a direction is one of several values.
     */
    //% group="Tests" color="#448844"
    //% blockId=TWisoneof block="test %dir=variables_get(direction) $cmp %c1 %c2"
    //% inlineInputMode=inline
    export function isOneOf(dir: number, cmp: Testing = Testing.OneOf, c1: TileDir, c2: TileDir) { 
        if (cmp == Testing.OneOf)
            myWorld.isOneOf(dir, c1, c2)
        else 
            myWorld.isNotOneOf(dir, c1, c2)
    }
}
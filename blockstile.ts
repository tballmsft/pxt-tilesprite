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
    //% blockId=TWsettile block="set %index=colorindexpicker to fixed sprite %img=tile_image_picker with $kind=spritekind""
    //% group="Tiles"
    export function setTile(code: number, image: Image, kind: number) { 
        myWorld.addTiles(code, image)
    }

    /**
     * Set an image as a sprite at the given index. Sprites should be a 16x16 image
     * @param index
     * @param img
     */
    //% blockId=TWsetsprite block="set %index=colorindexpicker to movable sprite %img=tile_image_picker with $kind=spritekind"
    //% group="Tiles"
    export function addTileSprite(code: number, image: Image, kind: number) { 
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
    //% blockId=TWontilestationary block="on $tile of kind $kind=spritekind at rest"
    //% blockAllowMultiple=1 draggableParameters="reporter"
    export function onTileStationary(kind: number, h: (tile: TileSprite) => void) {
        myWorld.onTileStationary(kind, h);
    }

    /**
     * Sprite is at center of tile and received request to move
     * @param body code to execute
     */
    //% group="Events" color="#444488"
    //% blockId=TWontilearrived block="on $tile of kind $kind=spritekind move $direction"
    //% blockAllowMultiple=1 draggableParameters="reporter"
    export function onTileArrived(kind: number, h: (tile: TileSprite, direction: TileDir) => void) { 
        myWorld.onTileArrived(kind, h)
    }

    /**
     * Sprite has just move into (entered) a tile
     * @param body code to execute
     */
    //% group="Events" color="#444488"
    //% blockId=TWontiletransition block="enter $tile of kind $kind=spritekind"
    //% blockAllowMultiple=1 draggableParameters="reporter"
    export function onTileTransition(kind: number, h: (tile: TileSprite) => void) { 
        myWorld.onTileTransition(kind, h)
    }

    
    // checks

    /**
     * Check if a direction is one of several values.
     */
    //% group="Conditions" color="#448844"
    //% blockId=TWisoneof block="is %dir=variables_get(direction) one of %c1 %c2 || %c3"
    //% inlineInputMode=inline
    export function isOneOf(dir: number, c1: TileDir, c2: TileDir = 0xff, c3: TileDir = 0xff) { 
        myWorld.isOneOf(dir, c1, c2, c3)
    }

    /**
     * Check if a direction is not one of several values.
     */
    //% group="Conditions" color="#448844"
    //% blockId=TWisnotoneof block="is %dir=variables_get(direction) not one of %c1 %c2 || %c3"
    //% inlineInputMode=inline
    export function isNotOneOf(dir: number, c1: TileDir, c2: TileDir = 0xff, c3: TileDir = 0xff) { 
        myWorld.isNotOneOf(dir, c1, c2, c3)
    }
}
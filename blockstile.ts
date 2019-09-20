//% weight=1000 color="#442255" icon="\uf45c"
//% groups='["Tiles", "Events", "Logic"]'
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
    export function setBackgroundTile(code: number) { 
        myWorld.setBackgroundTile(code)
    }
    export function setTileCode(ts: TileSprite, code: number) { 
        myWorld.setCode(ts, code)
    }
    export function addTile(code: number, image: Image) { 
        myWorld.addTiles(code, image)
    }
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
    export function onTileStationary(code: number, h: (ts: TileSprite) => void) { }
    export function onTileArrived(code: number, h: (ts: TileSprite, d: Dir) => void) { }
    export function onTileTransition(code: number, h: (ts: TileSprite, col: number, row: number) => void) { }
    // logic
    export function isOneOf(d: Dir, c1: Dir, c2: Dir = 0xff, c3: Dir = 0xff) { }
    export function isNotOneOf(d: Dir, c1: Dir, c2: Dir = 0xff, c3: Dir = 0xff) { }

}
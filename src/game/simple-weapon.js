import Sprite from '../lib/sprite'
import ImageMap from '../lib/image_map'

class SimpleWeapon {

  constructor(appContext) {
    this.orangeRoot = appContext;

    // Definicion del tiro de la nave ---------------------------------------
    this.balaImageMap = new ImageMap({
        image : this.orangeRoot.getImageManager().get("bala_nave"), 
        width : 1,
        height : 4
    });    
  }




  fire(x, y) {
    let spr = new Sprite({
        src : this.balaImageMap
    });
    
    let mainLayer = this.orangeRoot.getLayers()[0];
    mainLayer.addSprite(spr);
    spr.setX(x).setY(y-8);
    
    spr.on("enterFrame", function(eventData, s) { 
        if (s.getY() > 110) {
            s.incY(-4);
        } else {
            s.destroy();
        }
    });       


    spr.on("collision", function(eventName, ourWeapon, aCollision) {
      
      if(aCollision.length > 0) {
        if(aCollision[0].getClass() == Sprite.Classes.ENEMY) {
          ourWeapon.destroy();
        }
      }
    });
    

  }
}

export default SimpleWeapon
import Sprite from '../lib/sprite'
import ImageMap from '../lib/image_map'

class ComplexWeapon {

  constructor(appContext) {
    this.orangeRoot = appContext;

    // Definicion del tiro de la nave ---------------------------------------
    this.balaImageMap = new ImageMap({
      image : this.orangeRoot.getImageManager().get("bala_enemy"), 
      width : 5,
      height : 7
    });    
  }


  fire(x, y) {
    let spr = new Sprite({
        src : this.balaImageMap
    });
    
    let mainLayer = this.orangeRoot.getLayers()[0];
    mainLayer.addSprite(spr);
    spr.setX(x-2).setY(y-8);

    spr.on("collision", function(eventName, ourWeapon, aCollision) {
      if(aCollision.length > 0) {
        let enemy = aCollision[0];
        
        if(enemy.getClass() == Sprite.Classes.ENEMY) {
          enemy.destroy();
          ourWeapon.destroy();
        }
      }
    });    

    spr.on("enterFrame", function(eventData, s) { 
        if (s.getY() > 10) {
            s.incY(-4);
        } else {
            s.destroy();
        }
    }); 

  }
}

export default ComplexWeapon
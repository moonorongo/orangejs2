import Sprite from '../lib/sprite'
import ImageMap from '../lib/image_map'
import Animate from '../lib/animate'

class ComplexWeapon {

  constructor(appContext) {
    this.orangeRoot = appContext;

    // Definicion del tiro de la nave ---------------------------------------
    this.balaImageMap = new ImageMap({
      image : this.orangeRoot.getImageManager().get("bala_enemy"), 
      width : 5,
      height : 7
    });    

    // Animacion del tiro 
    this.balaEnemyAnimation = new Animate(this.balaImageMap, {
        statusConfig : [ 
            { loopMode : "L"},
            { loopMode : "L"}
        ],
        speed : 2
    });    
  }


  fire(x, y) {
    let spr = new Sprite({
        src : this.balaEnemyAnimation
    });
    
    let mainLayer = this.orangeRoot.getLayers()[0];
    mainLayer.addSprite(spr);
    spr.setX(x).setY(y);
    
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
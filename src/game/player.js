import Sprite from '../lib/sprite'
import Animate from '../lib/animate'
import ImageMap from '../lib/image_map'
import SimpleWeapon from './simple-weapon';
import ComplexWeapon from './complex-weapon';

class Nave extends Sprite {
  
  constructor(appContext) {
    // ImageMaps
    let naveImageMap = new ImageMap({
      image : appContext.getImageManager().get("nave"),
      width : 16,
      height : 8,
      dieStatus : 1 // el status que seleccionara al momento de hacer destroy en el sprite
    });

    // Animations
    let naveAnimation = new Animate(naveImageMap, {
        statusConfig : [ 
            { loopMode : "L"},
            { loopMode : "L"}
        ],
        speed : 1
    });

    super({
           src : naveAnimation,
           class : Sprite.Classes.FRIEND,
           id : "nave1"
       });

    this.dx = 0;
    
    this.simpleWeapon = new SimpleWeapon(appContext);
    this.complexWeapon = new ComplexWeapon(appContext);
    
    this.weapon = this.simpleWeapon;

    // asigno el context de la app, como todavia no lo agregamos a un layer no lo tiene asignado
    // y rompe bindActions()
    this.orangeRoot = appContext; 

    this.bindActions();
  }




  bindActions() {
    // Bind
    this.on("keydown", (eventData) => {

        switch(eventData.e.keyCode) {
            case 49 : this.weapon = this.simpleWeapon; // key '1'
                      break;

            case 50 : this.weapon = this.complexWeapon; // key '2'
            break;

            case 39 : this.dx = 2;
                      break;

            case 37 : this.dx = -2;
                      break;

            case 32 : this.fire()
                      break;

            case 17 : this.fire()
                      break;

            default :   console.log(eventData.e.keyCode);
        }
    });
    
    this.on("mousemove", (eventData) => {
        this.setX((eventData.relativeX / 2.5) - 8);
    });
    
    this.on("mouseup", (eventData) => {
        this.fire();
        this.setX((eventData.relativeX / 2.5) - 8);
    });
    
    this.on("keyup", (eventData) => {
        switch(eventData.e.keyCode) {
            case 39 :   this.dx = 0;
                        break;
            case 37 :   this.dx = 0;
                        break;
        }
    });
    
    this.on("enterFrame", () => {
        this.incX(this.dx);
    });    
  }


  fire() {
    if(this.weapon) {
      this.weapon.fire(this.getX() + 8, this.getY());
    } else {
      console.error('no weapon');
    }
  }


  setWeapon(weapon) {
    this.weapon = weapon
  }

  removeWeapon() {
    this.weapon = null
  }

}

export default Nave
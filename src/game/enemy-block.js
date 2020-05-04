import ImageMap from '../lib/image_map'
import Animate from '../lib/animate'
import Sprite from '../lib/sprite'


class EnemyBlock {
  constructor(appContext) {
    this.orangeRoot = appContext;
    this.changeDir = false;
    // this.enemyDx = .5;
    this.enemyDx = 0;
    this.downCounter = 0;

    this.setImages();
  }


  // Imagenes usadas por enemigos --------------------------------
  setImages() {
    this.enemy3ImageMap = new ImageMap({
      image : this.orangeRoot.getImageManager().get("enemy3"), 
      width : 10,
      height : 8,
      dieStatus : 1
    });

    this.enemy2ImageMap = new ImageMap({
      image : this.orangeRoot.getImageManager().get("enemy2"), 
      width : 13,
      height : 8,
      dieStatus : 1
    });

    this.enemy1ImageMap = new ImageMap({
      image : this.orangeRoot.getImageManager().get("enemy1"), 
      width : 14,
      height : 8,
      dieStatus : 1
    });    


    // animations
  }



  buildEnemies(originX, originY) {
    this.originX = originX;
    this.originY = originY;
    let mainLayer = this.orangeRoot.getLayers()[0]
    this.enemies = [];

    for (let j = 0; j < 5; j++) {
      let enemiesRow = [];

      for (let i = 0; i < 11; i++) {
        let enemyAnimation;

        if(j >= 3) { // cuarta y quinta fila de enemigos
          enemyAnimation = new Animate(this.enemy1ImageMap, {
              statusConfig : [ 
                  { loopMode : "L"},
                  { loopMode : "L", speed : 8}
              ],
              speed : 8
          });

        } else if(j >= 1) {  // segunda y tercera fila de enemigos
          enemyAnimation = new Animate(this.enemy2ImageMap, {
              statusConfig : [ 
                  { loopMode : "L"},
                  { loopMode : "L", speed : 8}
              ],
              speed : 8
          });

        } else { // primera fila de enemigos
          enemyAnimation = new Animate(this.enemy3ImageMap, {
            statusConfig : [ 
                { loopMode : "L"},
                { loopMode : "L", speed : 8}
            ],
            speed : 8
          });
        } // end ifs 

        let enemy = new Sprite({
          src : enemyAnimation,
          class : Sprite.Classes.ENEMY
        });          

        enemiesRow.push(enemy);
        mainLayer.addSprite(enemy); 
        enemy.setX(this.originX + (i*16) ).setY(this.originY + (j*16) );
        
        // si alguno detecta que se llego al borde, se cambia el sentido de todos
        enemy.on("enterFrame", (eventData, s) => { 
          if(((s.getX() < 0) || (s.getX() > 240)) && (!this.changeDir)) { 
              this.changeDir = true; 
          }

          // los paro si llegan a 200
          if(s.getY() > 200) { 
            this.enemyDx = 0; 
          }

        });
      } // end for i

      this.enemies.push(enemiesRow);
    } // end for j
    
  } // end buildEnemies




  updateFrame() {
    // si algun enemy me dijo que cambie de direccion
    if(this.changeDir) { 
      this.enemyDx = -this.enemyDx;
      this.downCounter = 5;
      this.changeDir = false;
    }    

    if(this.downCounter) {
      this.originY += 3;
      this.downCounter--;
    }

    this.originX += this.enemyDx;

    for (let j = 0; j < 5; j++) {
      for (let i = 0; i < 11; i++) {
        let enemy = this.enemies[j][i];
        enemy && enemy.setX(this.originX + (i*16) ).setY(this.originY + (j*16) );
      }
    }


  }

}

export default EnemyBlock
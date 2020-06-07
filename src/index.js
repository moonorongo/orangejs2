console.log('Orange v2 Started');

import _ from "underscore";

import Orange from './lib/orange';
import Layer from './lib/layer';
import Player from './game/player'
import EnemyBlock from './game/enemy-block'

// test url: localhost:82
// testear, ver si come memoria
      // 
      // este mamarracho me parece que no le gusta... 
      // reescribir la demo de manera mas elegant
// -->>      enemy3.shot = function() {



var app = new Orange({
  fps : 60
})      

app.init(document.getElementById("main"), {scaleWidth : 2, scaleHeight : 2});

// agrego las imagenes que quiero utilizar.
app.getImageManager().addImage(["assets/space_invaders/bala_enemy.png", 
"assets/space_invaders/enemy1.png", 
"assets/space_invaders/enemy2.png", 
"assets/space_invaders/enemy3.png", 
"assets/space_invaders/ufo.png", 
"assets/space_invaders/nave.png", 
"assets/space_invaders/bala_nave.png", 
"assets/space_invaders/space_bg.png"
]);



// un monton de mierda que me queda por implementar
function init_game() {
 
  // Layers
  var l = new Layer();
  app.addLayer(l);
  l.setBackground(app.getImageManager().get("space_bg"))
    

  // Nave Sprite
  var nave = new Player(app);
  nave.showPivotPoint(true);

  l.addSprite(nave); 
  nave.setX(110).setY(192);


  // Bloque Enemigos
  var bloqueEnemigos = new EnemyBlock(app);
  bloqueEnemigos.buildEnemies(10, 10);
  
// test
  // let fake= new Player(app, true);
  // fake._class = Sprite.Classes.ENEMY
  // l.addSprite(fake); 
  // fake.setX(200).setY(170);

  app.preUpdateCallback(() => {
    bloqueEnemigos.updateFrame()

    // scroll fondo simple
    if(l.getX() > -512) {
      l.setX(l.getX() - 1);
    } else {
      l.setX(0)
    }

  })

// implementar colisiones

// y, cuando esta muriendo... poder setear si sigue siendo destructivo.



  /*
  // Definicion del tiro ENEMY ---------------------------------------
  var balaEnemyImageMap = new ImageMap({
      image : app.getImageManager().get("bala_enemy"), 
      width : 5,
      height : 7
  });
  
  // Pequeño constructor de tiros.
  var EnemyShot = function(x,y) {
      var spr = new Sprite({
          src : balaEnemyAnimation
      });
      
      l.addSprite(spr);
      spr.setX(x).setY(y);
      
      spr.on("enterFrame", function(eventData, s) { 
          if (s.getY() < 200) {
              s.incY(2);
          } else {
              s.destroy();
          }
      });            
  
      spr.on("collision", function(eventName, context, aCollision) {
          if(aCollision.length > 0) {
              if(aCollision[0].getClass() == Sprite.Classes.FRIEND) {
                  aCollision[0].destroy(false);
                  context.destroy();
              }
          }
      });
  
      return spr;
  } // FIN DEFINICION DISPARO ENEMY --------------------------------
  
  app.preUpdateCallback(() => {
    update()
  })
      // si algun enemy me dijo que cambie de direccion
      if(global.changeDir) { 
          global.enemyDx = -global.enemyDx;
          // global.downCounter = 5;
          global.changeDir = false;
      }
      
      // aqui, para bajar una linea los enemys
      if(global.downCounter > 0) global.downCounter--;
  
      if( (Math.floor(Math.random()*10) == 0) && only_10) { // ponele...
          only_10--;
          var sTemp = null; 
          
          if(numeroHabilitados > 0) {
              while(sTemp == null) {
                  randomColumn = Math.floor(Math.random()*11);
                  sTemp = global.habilitados[randomColumn];
              }
          } else {
              app.stop();
              alert('WIN!');
          }
          
          if (!_.isNull(sTemp) && numeroHabilitados > 0) sTemp.shot();
      }
    });
    
*/

  // y finalmente, pulso el boton rojo.
  app.start();
}




// Inicio la precarga, cuando finalize llama al callback.
// mas adelante tengo que hacerlo mejor, con un objeto que tenga sucess, error, progress, etc.
app.getImageManager().preload(init_game); // FIN PRELOAD


console.log('Orange v2 Started');

import Orange from './lib/orange';
import Layer from './lib/layer';
import ImageMap from './lib/image_map';
import Animate from './lib/animate';
import Sprite from './lib/sprite';
import Player from './game/player'
import _ from "underscore";

// test url: localhost:82
// testear, ver si come memoria
      // 
      // este mamarracho me parece que no le gusta... 
      // reescribir la demo de manera mas elegant
// -->>      enemy3.shot = function() {



// Basura que despues vamos a reescribir como una class que se va a llamar Space Invaders
var dx, 
    randomColumn,
    numeroHabilitados,
    global = {
      enemyDx : .5,
      downCounter : 0,
      changeDir : false,
      habilitados : []
    },
    contadorFila = 0,
    dx=0,
    numeroHabilitados = 11;
    
var app = new Orange()      

app.init(document.getElementById("main"), {scaleWidth : 2.5, scaleHeight : 2});

// agrego las imagenes que quiero utilizar.
app.getImageManager().addImage(["assets/space_invaders/bala_enemy.png", 
"assets/space_invaders/enemy1.png", 
"assets/space_invaders/enemy2.png", 
"assets/space_invaders/enemy3.png", 
"assets/space_invaders/ufo.png", 
"assets/space_invaders/nave.png", 
"assets/space_invaders/bala_nave.png", 
"assets/space_invaders/screenShotSI.png"
]);



// un monton de mierda que me queda por implementar
function init_game() {
 
  // Layers
  var l = new Layer();
  app.addLayer(l);
  l.setBackground(app.getImageManager().get("screenShotSI"))
    

  // Nave Sprite
  var nave = new Player(app);
  l.addSprite(nave); 
  nave.setX(110).setY(192);

// armar un SimpleWeapon, que sea esta bala, que la pueda asignar al player
// y que el player dispare lo que le asigne


  
  /*
      
       
       
  
       
  // Definicion del tiro ENEMY ---------------------------------------
  var balaEnemyImageMap = new ImageMap({
      image : app.getImageManager().get("bala_enemy"), 
      width : 5,
      height : 7
  });
  
  // Animacion del tiro enemy
  var balaEnemyAnimation = new Animate(balaEnemyImageMap, {
      statusConfig : [ 
          { loopMode : "L"},
          { loopMode : "L"}
      ],
      speed : 2
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
       
       
       
       
       
       
       
       
       
       
       
       
       
  // Definicion de enemigos --------------------------------
  var enemy3ImageMap = new ImageMap({
      image : app.getImageManager().get("enemy3"), 
      width : 10,
      height : 8,
      dieStatus : 1
  });
  
  var enemy2ImageMap = new ImageMap({
      image : app.getImageManager().get("enemy2"), 
      width : 13,
      height : 8,
      dieStatus : 1
  });
  
  var enemy1ImageMap = new ImageMap({
      image : app.getImageManager().get("enemy1"), 
      width : 14,
      height : 8,
      dieStatus : 1
  });
       
       
 
       
  // creo las filas de enemigos
  for(var i=0; i<11; i++) {
      var enemy3Animation = new Animate(enemy3ImageMap, {
          statusConfig : [ 
              { loopMode : "L"},
              { loopMode : "L", speed : 8}
          ],
          speed : 8
      });
  
      var enemy3 = new Sprite({
          src : enemy3Animation,
          class : Sprite.Classes.ENEMY,
          id : contadorFila +"_"+ i
      });
      
      l.addSprite(enemy3); 
      
      enemy3.setX(i*16 + 49).setY(40);
  
      // y esto es un HERRMOOOOSSHOO mamarracho que me permite hacer JS... amo este lenguaje
      // ah... detesto JAVA... lo detesto... sabelo.
      enemy3.shot = function() {
          EnemyShot(this.getX() + 3, this.getY() + 5); 
      }
      
      // enterFrame. ----------------------------------------------------------------------------
      enemy3.on("enterFrame", function(eventData, s) { 
          s.incX(global.enemyDx);
 
          if(((s.getX() < 0) || (s.getX() > 240))&& (!global.changeDir)) {
              global.changeDir = true; 
          } 
          
          if(global.downCounter > 0) s.incY(3);
      });
      
      // colision enemigo-nave. -----------------------------------------------------------------
      enemy3.on("collision", function(eventData, s, aCollision) { 
          if(aCollision.length > 0) {
              if(aCollision[0].getClass() == Sprite.Classes.FRIEND) {
                  aCollision[0].destroy(false);
              }
          }
      });
      
  } // end for enemy3 ------------------------------------------------------------------------
  
  
  
  for(var j=0; j<2; j++) {
      contadorFila++;
      for(var i=0; i<11; i++) {
      
          var enemy2Animation = new Animate(enemy2ImageMap, {
              statusConfig : [ 
                  { loopMode : "L"},
                  { loopMode : "L", speed : 8}
              ],
              speed : 8
          });
      
          var enemy2 = new Sprite({
              src : enemy2Animation,
              class : Sprite.Classes.ENEMY,
              id : contadorFila +"_"+ i
          });
          l.addSprite(enemy2); 
          
          enemy2.setX(i*16 + 49).setY(56 + j*16);
  
          enemy2.shot = function() {
              EnemyShot(this.getX() + 4, this.getY() + 4); 
          }
          
          // enterFrame. -----------------------------------------------------------------
          enemy2.on("enterFrame", function(eventData, s) { 
              s.incX(global.enemyDx);
              
              if(((s.getX() < 0) || (s.getX() > 240))&& (!global.changeDir)) {
                  global.changeDir = true; 
              }
              
              if(global.downCounter > 0) s.incY(3);
          });
          
          
          // colision enemigo-nave.-----------------------------------------------------------------
          enemy2.on("collision", function(eventData, s, aCollision) { 
              if(aCollision.length > 0) {
                  if(aCollision[0].getClass() == Sprite.Classes.FRIEND) {
                      aCollision[0].destroy(false);
                  }
              }
          });
          
      }
  } // end for enemy2 ------------------------------------------------------------------------
  
  


  for(var j=0; j<2; j++) {
      contadorFila++;
      for(var i=0; i<11; i++) {
      
          var enemy1Animation = new Animate(enemy1ImageMap, {
              statusConfig : [ 
                  { loopMode : "L"},
                  { loopMode : "L", speed : 8}
              ],
              speed : 8
          });
      
          var enemy1 = new Sprite({
              src : enemy1Animation,
              class : Sprite.Classes.ENEMY,
              id : contadorFila +"_"+ i
          });
  
          l.addSprite(enemy1); 
          
          // posicionamiento enemigos
          enemy1.setX(i*16 + 49).setY(88 + j*16);
  
          enemy1.shot = function() {
              EnemyShot(this.getX() + 5, this.getY() + 5); 
          }
  
          // Bindings enemys -----------------------------------------------------------------
          // SIEMPRE es necesario agregar primero el sprite antes de asignarle algun evento
          enemy1.on("enterFrame", function(eventData, s) { 
              s.incX(global.enemyDx);
              
              if(((s.getX() < 0) || (s.getX() > 240))&& (!global.changeDir)) {
                  global.changeDir = true; 
              }
              
              if(global.downCounter > 0) s.incY(3);
          });
          
          
          // colision enemigo-nave.-----------------------------------------------------------------
          enemy1.on("collision", function(eventData, s, aCollision) { 
              if(aCollision.length > 0) {
                  if(aCollision[0].getClass() == Sprite.Classes.FRIEND) {
                      aCollision[0].destroy(false);
                  }
              }
          });
          
          
          if(j==1) global.habilitados.push(enemy1);
      }
  } // end for enemy1 ------------------------------------------------------------------------
  
  

var only_10 = 50;
  
  
  app.preUpdateCallback(function() {
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


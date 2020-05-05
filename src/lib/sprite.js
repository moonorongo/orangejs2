/*
 * Declares {@link Sprite} class etc.
 * @file sprite.js
 * @version 2.0
 */

import _ from "underscore";


/**
 * @class Sprite 
 * un sprite es un bloque que se puede mover, y que va a recibir eventos.
 * Cada sprite puede tener asignada una ImageMap o una Animation.
 * Si recibe un imageMap pone por defecto el primer cuadro/estado
 * 
 * @constructor Sprite
 * @param {Object} customSettings Un objeto de inicializacion del Sprite. El objeto debera tener las siguientes propiedades: <br>
 * <em>src</em> : ImageMap o Animation utilizada por el Sprite <br>
 * optional int <em>pivotX</em>: el punto utilizado como limite contra el _boundary Layer.<br>
 * optional int <em>pivotY</em>: idem, tanto para este como para el anterior, si no se especifican toma el centro del Sprite. <br>
 * optional int <em>class</em>: Un identificador que indica a que clase pertenece. Puedes utilizar algunos de los identificadores predefinidos internamente, o  crear indicadores propios<br>
 */
class Sprite {

  

  constructor(customSettings) {
    /** @property {private Layer} _layer Referencia al Layer que pertenece. */
    this._layer = null

    /** @property {private int} _x Posicion x del Sprite. */
    this._x = 0
    /** @property {private int} _y Posicion y del Sprite. */
    this._y = 0

    this._pivot = 0
           
    /** @property {private Object} _eventCallback Objecto interno con los distintos callbacks de los eventos asignados al Sprite. */
    this._eventCallback = {}
            
    /** @property {private ImageMap} _src Imagen asociada al Sprite, puede ser un ImageMap o una Animation. */
    this._src = customSettings.src
            
    /** @property {private int} _w Ancho del Sprite. */
    this._w = this._src.getSpriteWidth()
    /** @property {private int} _h Alto del Sprite. */
    this._h = this._src.getSpriteHeight()
               
    /** @property {private int} _pivotX Punto utilizado para ver si se puede colocar el sprite en esa posicion. */
    this._pivotX = customSettings.pivotX || Math.floor(this._w / 2)
               
    /** @property {private int} _pivotY Punto utilizado para ver si se puede colocar el sprite en esa posicion.  */
    this._pivotY = customSettings.pivotY || Math.floor(this._h / 2)

               
    /** @property {private int} _offsetX Pixeles a desplazar para el calculo del camino mas corto (es una variable de ajuste para hacer coincidir el Sprite con lo que armemos con los tiles). */
    this._offsetX = customSettings.offsetX || 0
               
    /** @property {private int} _offsetY Idem offset X, para Y.  */
    this._offsetY = customSettings.offsetY || 0
               
               
    /** @property {private int} _class Numero interno para clasificar de alguna manera al Sprite. */
    this._class = customSettings.class || 0
            
    /** @property {private String} _id Identificador unico, de proposito general. */
    this._id = customSettings.id || ""
            
            
    /** @property {private int} _dirX Direccion horizontal hacia donde esta yendo el Sprite. */
    this._dirX = 0
    /** @property {private int} _dirY Direccion vertical hacia donde esta yendo el Sprite. */
    this._dirY = 0

            
    /** @property {private boolean} _prepareToDestroy Flag, se pone en true cuando llamo a Sprite.destroy(). */
    this._prepareToDestroy = false
            
    /** @property {private boolean} _removeFromLayer Flag, cuando llamo a Sprite.destroy() indica si debo, ademas, quitar del Layer el sprite. 
     * Esto es util para cuando quiero destruir un Sprite, pero quiero dejar el "cadaver" como imagen. 
     */
    this._removeFromLayer = false

    /**
     * @property {private int} _expand Aca tengo el factor de expansion del Sprite: 0 > _expand < 1: encoge; _expand = 1: tamaño real; _expand > 1: agranda.
     */
    this._expandX = 1
    this._expandY = 1
            

    this._ignoreBound = customSettings.ignoreBound || false
            
    /** @property {private int} _muriendo Numero que tiene la cantidad de frames que dura la animacion que se ejecuta cuando destruyo al Sprite. */
    this._muriendo = (this._src.getType() == "Animation")?  this._src._fnGetStatusDieCantFrames() : 0
        
    this.orangeRoot = null;         
        
    this._showPivotPoint = false;
    // this._pivotPoint = null;
    // this._pivotPointData = null;
  }

  // ------------------------------------------------------------------------------------------------------
  // PRIVATE SECTION
  // ------------------------------------------------------------------------------------------------------

  /**
   * @function {private void} _setDirX Establece la direccion de movimiento del Sprite.
   * @param {int} x nueva posicion.
   */    
  _setDirX(x) {
    if(x > this._x) {
      this._dirX = Sprite.MOVE_RIGHT;
    } else if (x < this._x) {
      this._dirX = Sprite.MOVE_LEFT;
    } else {
      this._dirX = Sprite.MOVE_NONE;
    }
  }


  /**
   * @function {private void} _setDirY Establece la direccion de movimiento del Sprite.
   * @param {int} y nueva posicion.
   */    
  _setDirY(y) {
    if(y > this._y) {
      this._dirY = Sprite.MOVE_DOWN;
    } else if (y < this._y) {
      this._dirY = Sprite.MOVE_UP;
    } else {
      this._dirY = Sprite.MOVE_NONE;
    }        
  }   

  _checkX(x) {
    return (this._layer._fnGetBoundaryStatus(x + this._pivotX, this._y + this._pivotY).r != 0)? true : false;
  }

  _checkY(y) {
    return (this._layer._fnGetBoundaryStatus(this._x + this._pivotX, y + this._pivotY).r != 0)? true : false;
  }


  /**
   * @function {private boolean} _setX Posiciona el Sprite en la pantalla. 
   * Checkea si puede posicionarlo, y actualiza la direccion de movimiento. 
   * Si no lo puede actualizar, entonces retorna FALSE
   * @param {int} x nueva posicion.
   */    
  _setX(x) {
    let success = false;
    
    if(this._ignoreBound) {
      this._setDirX(x);
      this._x = x;
      success = true;
    } else {
      if(this._checkX(x)) { 
        this._setDirX(x);
        this._x = x;
        success = true;
      } else { 
        this._dirX = Sprite.MOVE_NONE;
      }
    }
    
    return success;
  }; 


  /**
   * @function {private void} _setY Posiciona el Sprite en la pantalla. 
   * Checkea si puede posicionarlo, y actualiza la direccion de movimiento. 
   * Si no lo puede actualizar, entonces retorna false.
   * @param {int} y nueva posicion.
   */    
  _setY(y) {
    let success =false;

    if(this._ignoreBound) {
      this._setDirY(y);
      this._y = y;
      success = true;
    } else {
      if(this._checkY(y)) {
        this._setDirY(y);
        this._y = y;
        success = true;
      } else { 
        this._dirY = Sprite.MOVE_NONE;
      }
    }

    return success;
  }  

  // ------------------------------------------------------------------------------------------------------
  // PUBLIC SECTION
  // ------------------------------------------------------------------------------------------------------

  /**
   * @function {public void} setIgnoreBound Si es true, ignora el boundary Layer, permitiendo posicionar el Sprite en cualquier parte.
   * @param {boolean} status true/false.
   */    
  setIgnoreBound(status) {
    this._ignoreBound = status;
  }

  /**
   * @function {public boolean} checkX Devuelve true si es posible posicionar el sprite en dicha posicion. AGREGAR UNA FN CHECK(X,Y)
   * @param {int} x Posicion horizontal.
   */    
  checkX(x) {
    return this._checkX(x);
  }

  /**
  * @function {public boolean} checkY Idem checkX.
  * @param {int} y Posicion vertical.
  */    
  checkY(y) {
    return this._checkY(y);
  }

  /**
   * @function {public void} showPivotPoint Especifica si muestra o no el pivot Point asignado al Sprite... util para debuguear
   * @param {boolean} status true/false.
   */    
  showPivotPoint(status) {
    this._showPivotPoint = status;
  }

  /**
   * @function {public void} _fnSetLayer Utilizada desde Layer.addSprite, le inyecta al Sprite el Layer donde esta siendo insertado
   * @param {Layer} layer El Layer al que pertenece el Sprite.
   */    
  _fnSetLayer(layer) {
    this._layer = layer;
  }

  /**
   * @function {public void} _fnSetRootContext Utilizada desde Layer.addSprite, inyecta el objeto root (Orange) para facilitar su acceso
   * @param {Orange} root Orange... no more.
   */    
  _fnSetRootContext(root) {
    this.orangeRoot = root;
  }

  /**
  * @function {public Sprite} setX Posiciona horizontalmente el Sprite, devuelve la propia instancia, para encadenar con otros metodos.
  * @param {int} x Posicion horizontal donde va a ir el Sprite.
  */    
  setX(x) {
    this._setX(x);
    return this;
  }

  /**
  * @function {public Sprite} setY Posiciona verticalmente el Sprite, devuelve la propia instancia, para encadenar con otros metodos.
  * @param {int} y Posicion vertical donde va a ir el Sprite.
  */    
  setY(y) {
    this._setY(y);
    return this;
  }

  /**
   * @function {public int} getX Obtiene la posicion horizontal del Sprite.
   */    
  getX() {
    return this._x;
  }

  /**
  * @function {public int} getY Obtiene la posicion vertical del Sprite.
  */    
  getY() {
    return this._y;
  }

  /**
   * @function {public Sprite} incX Incrementa en dx pixels la posicion del Sprite. 
   * Si el valor es positivo, el Sprite se desplazara hacia la derecha, si es negativo hacia la izquierda.
   * @param {int} dx Cantidad de pixels a desplazar.
   */    
  incX(dx) { 
    let x = this._x;
    x += dx;
    return this._setX(x);
  }

  /**
   * @function {public Sprite} incY Incrementa en dy pixels la posicion del Sprite. Si el valor es positivo, el Sprite se desplazara hacia abajo, si es negativo hacia arriba.
   * @param {int} dy Cantidad de pixels a desplazar.
   */    
  incY(dy) { 
    let y = this._y;
    y += dy;
    return this._setY(y);
  }

  /**
   * @function {public int} getWidth Obtiene el ancho del Sprite.
   */    
  getWidth() {
    return this._w * this._expandX;
  }

  /**
  * @function {public int} getWidth Obtiene el alto del Sprite.
  */    
  getHeight() {
    return this._h * this._expandY;
  }

  /**
   * @function {public int} getDir Obtiene la direccion de avance del Sprite.
   * este metodo retorna combinaciones de movimientos, ej diagonales lo devuelve como suma de 2 movimientos
   */    
  getDir() {
    return this._dirX + this._dirY;
  }

  /**
   * @function {public void} setExpandX Establece el nivel de expansion a lo ANCHO 
   * (1: mantiene igual, 2; ennsancha al doble, .5: encoge a la mitad).
   */    
  setExpandX(ex) {
    this._expandX = ex;
  }


  /**
   * @function {public void} setExpandY Establece el nivel de expansion a lo ALTO 
   * (1: mantiene igual, 2; ennsancha al doble, .5: encoge a la mitad).
   */    
  setExpandY(ey) {
    this._expandY = ey;
  }


  /**
   * @function {public Animation} getAnimation En realidad puede devolver un Animation o un ImageMap, 
   * ya que se le puede asignar cualquiera de las 2 cosas a un Sprite.
   */    
  getAnimation() {
    return this._src;
  }


  /**
   * @function {public void} destroy Inicia la secuencia de eliminacion del Sprite, seteando _prepareToDestroy. 
   * Si le paso como parametro 'false', no lo removera del Layer (util para, por ejemplo, dejar el cadaver del enemigo)
   * @param {boolean} removeFromLayer Si seteo false se conservará la instancia en el Layer.
   */    
  destroy(removeFromLayer) {
    this._prepareToDestroy = true;
    this._removeFromLayer = (_.isUndefined(removeFromLayer))? true : removeFromLayer;
  }


  /**
   * @function {public int} getClass Obtiene la clase asignada al sprite.
   */    
  getClass() {
    return this._class;
  }


  /**
   * @function {public void} setClass Asigna una clase al Sprite.
   * @param {int} class La clase a asignar.
   */    
  setClass(c) {
    this._class = c;
  }

  /**
   * @function {public String} getId Obtiene el identificador del Sprite.
   */    
  getId() {
    return this._id;
  }

  /**
   * @function {public void} setId Asigna un identificador de proposito general.
   * @param {String} id El nombre del identificador.
   */    
  setId(id) {
    this._id = id;
  }

  /**
   * @function {public void} _fnUpdate Actualiza el Sprite. Si lo destruimos maneja las fases de la destruccion. 
   */    
  _fnUpdate() {
    // esto funciona asi: _src puede ser una Animation o ImageMap... le paso (0) por si es un ImageMap, 
    // ImageMap.getFrame puede tomar (frame) o (frame, status): si no especifico status, toma el status interno (esto es para compatibilidad con Animation)
    // y si es una Animation, no es tenido en cuenta.
    // getFrame(), en Animation o ImageMap devuelven imgData.
    // seis años despues.. esta clarisimo
    
    let imgData; 

    if(this._prepareToDestroy) { // recibio la orden de reventarlo
      if(this._muriendo > 0) { 
        this._muriendo--;
      } else { // ya murio, lo reviento del todo.
        this.orangeRoot.removeFromEventStack(this);
        if(this._removeFromLayer) this._layer.removeSprite(this);
      }                

      this._src.setStatusDie(); 
      imgData = this._src.getFrame(0);  // si _src es Animation, no se toma en cuenta el parametro.

      this._layer._fnGetCanvas()
        .drawImage(
          imgData.image, 
          imgData.px, 
          imgData.py, 
          this._w, 
          this._h, 
          this._x, 
          this._y, 
          this._w * this._expandX, 
          this._h * this._expandY);
        
    } else { // dibuja normalmente

      imgData = this._src.getFrame(0); // si _src es Animation, no se toma en cuenta el parametro.
      this._layer._fnGetCanvas()
       .drawImage(
          imgData.image, 
          imgData.px, 
          imgData.py, 
          this._w, 
          this._h, 
          this._x,
          this._y,
          this._w * this._expandX, 
          this._h * this._expandY);
    }
    
    if(this._showPivotPoint) {
      this._layer._fnGetCanvas().save();
      this._layer._fnGetCanvas().fillStyle = "rgba(0,255,255,1)";
      this._layer._fnGetCanvas().fillRect(this._x + this._pivotX, this._y + this._pivotY, 1, 1);                     
      this._layer._fnGetCanvas().restore();
    }

  } // end _fnUpdate


  /**
   * @function {public void} on Asigna un evento al Sprite, y su correspondiente callback.
   * @param {Event} event El nombre del evento a asignar. Ademas de los eventos standard (click, keyup, keydown, keypress), tambien incluye 2 eventos no standard: <br>
   * <strong>enterFrame</strong>: se ejecuta cada vez que el sprite entra en el cuadro, y previamente al callback principal asignado, y a la actualizacion del frame. <br>
   * <strong>collision</strong>: se ejecuta cada vez que el sprite colisiona con otro. <br>
   * @param {Callback} callback el callback a asignar. Todos los callbacks reciben (eventData, Sprite), que es un objeto con datos, y una referencia al Sprite que tiene asignado el evento.
   * Tambien recibe aCollision, si es collision, que consiste en un array con referencias a Sprites contra los que colisiono.
   */    
  on(event, callback) {
    this.orangeRoot.addToEventStack(event, this);
    this._eventCallback[event] = callback;
  }


  /**
   * @function {public void} _fnNotify Esta funcion es llamada dentro del loop, y es la que se encarga 
   * de notificar de los eventos ocurridos a los Sprites que tienen eventos asignados.
   */    
  _fnNotify(eventName, e) {
    let rX, rY, eventData;
    var aCollision = [];
      
    // para cualquier evento que no sea collision voy a tomar algunos valores para enviar al objeto q le mando al callback
    if (eventName=="collision") { 
      // ver si solo hay un sprite... ;P
      _.each(this._layer._fnGetSprites(), (sprite) => {
          if(sprite !== this) {
            let p1x = this._x,
                p1y = this._y,
                o2x = sprite.getX() + sprite.getWidth(),
                o2y = sprite.getY() + sprite.getHeight(),
                totalWidth = (this._w * this._expandX) + sprite.getWidth(),
                totalHeight = (this._h * this._expandY) + sprite.getHeight(),
                restaX = o2x - p1x,
                restaY = o2y - p1y;

            // var p2x = this._x + (this._w * this._expandX);
            // var p2y = this._y + (this._h * this._expandY);
            
            // var o1x = sprite.getX();
            // var o1y = sprite.getY();
              
            if( (restaX > 0) && (restaX < totalWidth) &&
                (restaY > 0) && (restaY < totalHeight) ) {
             aCollision.push(sprite);
            }
          } // if
      });

    } else if(eventName=="enterFrame") { 

      eventData = {
        eventName : eventName
      };

    } else { // si es lo demas (keypress, keydown, click)
        
        rX = e.clientX - this.orangeRoot.getCanvasElement().offsetLeft;
        rY = e.clientY - this.orangeRoot.getCanvasElement().offsetTop;

        eventData = {
            relativeX : rX,
            relativeY : rY,
            clicked : false,
            eventName : eventName,
            e : e
        };
        
        // si esta dentro de la caja del sprite seteo propiedad "clicked" : true
        if( (rX >= this._x) && 
            (rY >= this._y) && 
            (rX <= this._x + this._w) && 
            (rY <= this._y + this._h) ) { 

          eventData.clicked = true; 
        }
    } // end else (keypress, keydown, click)
    
    // el callback del evento que se ejecuta, envia eventData, el sprite, y si es collision un array de sprites con los que esta colisionando
    this._eventCallback[eventName](eventData, this, aCollision);    
  } // end _fnNotify
}

// "Constantes"
Sprite.MOVE_NONE = 0;
Sprite.MOVE_UP = 1;
Sprite.MOVE_UP_RIGHT = 5;
Sprite.MOVE_RIGHT = 4;
Sprite.MOVE_DOWN_RIGHT = 20;
Sprite.MOVE_DOWN = 16;
Sprite.MOVE_DOWN_LEFT = 80;
Sprite.MOVE_LEFT = 64;
Sprite.MOVE_UP_LEFT = 65;    

Sprite.Classes = {
  "NONE" : 0,
  "FRIEND" : 1,
  "ENEMY" : 2      
}

export default Sprite
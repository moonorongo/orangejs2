/*
 * Declares {@link Layer} class etc.
 * @file layer.js
 * @version 2.0
  */

 import _ from "underscore";

/**
 * @class Layer 
 * Un Layer es un contenedor de Sprites. Un Layer puede tener un ancho/alto superior al del canvas que lo contiene, y puede desplazarse 
 * con un scroll.
 * Tambien se le puede asignar una imagen que actue como limite para los sprites (boundary), y se le puede asignar una imagen de background.
 * 
 * @constructor Layer
 * @param {optional int} width El ancho del Layer, si no se especifica toma el del canvas.
 * @param {optional int} height El alto del Layer, idem.
 */
class Layer {
  constructor(width, height) {
    /** @property {private Sprites} _sprites Array que contiene los Sprites del layer. */
    this._sprites = [];
        
    /** @property {private Canvas} _layer El "canvas context" (interno) del layer, donde seran dibujados los sprites. */
    this._layer;
        
    /** @property {private Canvas} _boundary El "canvas context" (interno) del limite del _layer, es utilizado para proporcionar limites (ej crear laberintos, plataformas, etc) dentro del Layer. */
    this._boundary;
            
    /** @property {private Canvas} _context Referencia al canvas inicializado en Orange.init(), donde se dibuja todo. */
    this._context;
            
    /** @property {private int} _width Ancho del canvas, si no se proporciona toma el ancho del _context del juego. */
    this._width = width;

    /** @property {private int} _height Alto del canvas, idem anterior. */
    this._height = height;
            
    /** @property {private image} _bgLayer Imagen background del Layer. */
    this._bgLayer;

    this._tileMap;
    /** @property {private boolean} _showBoundary Muestra el boundary del Layer, para debuguear. */

    this._showBoundary = false,

    this._bgX,
    this._bgY;

    this._tmpCanvas;
    this._tmpCanvasBoundary;
    this.orangeRoot;
  }

  // ------------------------------------------------------------------------------------------------------
  // PRIVATE SECTION
  // ------------------------------------------------------------------------------------------------------

  /**
   * @function {private void} _putInContext ejecuta _fnUpdate (que dibuja los sprites), y se encarga de pintar el layer en el canvas principal.
   * A FUTURO: Seguramente habra algo que me permita hacer scrolles... que no se como voy a implementar, si con algo asi como una camara, o lo que sea.
   */    
  _putInContext() {
    this._fnUpdate();
    this._context.drawImage(this._layer.canvas,0,0); // a futuro la posicion debera poder moverse. (o hacer scroll loop)
    // this._context.drawImage(this._boundary.canvas,0,0); // a futuro la posicion debera poder moverse. (o hacer scroll loop)
  }  


/**
 * @function {private void} _fnUpdate Actualiza el Layer, pintando el fondo, y los Sprites asignados.
 */    
  _fnUpdate() {
    if(!_.isUndefined(this._bgLayer)) { 
      this._layer.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);            
      this._layer.drawImage(this._bgLayer, this._bgX, this._bgY);
    } else {
      // o pinta un cuadrado negro.
      this._layer.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);
    }

    if((!_.isUndefined(this._tmpCanvasBoundary)) && (this._showBoundary)) { 
      this._layer.save();
      this._layer.globalAlpha = 0.1;
      this._layer.drawImage(this._tmpCanvasBoundary, this._bgX, this._bgY);
      this._layer.restore();
    }

    // pinta cada sprite.
    _.each(this._sprites, (sprite) => {
      if(sprite) {
        sprite._fnUpdate();
      } else {
        console.info('Layer: undefined sprite to update (_fnUpdate)  '); 
      }
    });
  }  


  /**
   * Setea posicion x de fondo
   * @param {integer} x posicion x de background
   */
  setX(x) {
    this._bgX = x;
  }

  /**
   * Setea posicion y de fondo
   * @param {integer} y posicion y de background
   */
  setY(y) {
    this._bgY = y;
  }

  /**
   * obtiene posicion x de fondo
   */
  getX() {
    return this._bgX
  }

  /**
   * obtiene posicion y de fondo
   */
  getY() {
    return this._bgY
  }


  _setBackground(img, x, y) {
    this._bgX = x || 0;
    this._bgY = y || 0;
    this._bgLayer = img;
  }


  _setBoundary(img, x, y) {
    this._tmpCanvasBoundary = document.createElement("canvas");
    this._tmpCanvasBoundary.width = this._tmpCanvas.width;
    this._tmpCanvasBoundary.height = this._tmpCanvas.height;
    this._boundary = this._tmpCanvasBoundary.getContext("2d");
    
    let boundX = x || 0, 
        boundY = y || 0;

    this._boundary.drawImage(img, boundX, boundY);        
  }  


  // ------------------------------------------------------------------------------------------------------
  // PUBLIC SECTION
  // ------------------------------------------------------------------------------------------------------

  /**
   * @function {public void} showBoundary Especifica si quiero mostrar el boundary del Layer, para testear.
   * @param {boolean} status true/false activa o desactiva.
   */    
  showBoundary(status) {
    this._showBoundary = status; 
  }


  /**
   * @function {public canvas} _fnGetCanvas Devuelve el contexto del canvas
   */    
  _fnGetCanvas() {
    return this._layer;
  }


  /**
   * @function {public Sprites} _fnGetSprites Retorna el Array de Sprites. Realmente no se si se utiliza en algun lado...
   */    
  _fnGetSprites() {
    return this._sprites;
  }
  

  /**
   * @function {public void} setBackround Especifica una imagen de fondo para el Layer. 
   * Tambien se puede asignar (optativamente) una posicion inicial x e y, que es la posicion donde dibujara la imagen (por defecto: 0,0).
   * @param {Imagen} img La imagen de fondo a especificar
   * @param {optional} x Posicion x a dibujar.
   * @param {optional} y Posicion y a dibujar.
   */    
  setBackground(img, x, y) {
    this._setBackground(img, x, y);
  }

  getTileMap() {
    return this._tileMap;
  }


  setTileMap(tMap) {
      this._tileMap = tMap;
      this._setBackground(this._tileMap.getLayer());
      this._setBoundary(this._tileMap.getBoundary());
  }


  /**
   * @function {public void} _update Actualiza el Layer, y lo dibuja en el context principal.
   */    
  update() {
    this._putInContext();
  }  


  /**
   * @function {public void} addSprite Agrega un Sprite al array interno de Sprites, del Layer.
   * @param {Sprite} sprite El Sprite que quiero agregar.
   */    
  addSprite(sprite) {
    sprite._fnSetLayer(this);
    sprite._fnSetRootContext(this.orangeRoot);
    this._sprites.push(sprite);
  }


  /**
   * @function {public boolean} removeSprite Quita la referencia del sprite del array interno de Sprites. Retorna true si la operacion se concreta exitosamente.
   * @param {Sprite} sprite El Sprite que quiero quitar.
   */    
  removeSprite(sprite) {
    var i = this._sprites.indexOf(sprite);
    if(i != -1) {
      this._sprites.splice(i,1);
      return true;
    } else {
      return false;
    }
  }


  /**
   * @function {public Sprite} getSpriteById Obtiene un Sprite del Layer, por su Id.
   * @param {String} id El identificador por el que lo quiero buscar.
   */    
  getSpriteById(id) {
    return _.findWhere(this._sprites, { id : id });
  }  


  /**
   * @function {public void} setBoundary Asigna una imagen y genera un canvas, que es utilizado para proporcionar 
   * limites de movimiento dentro del Layer (util para laberintos, plataformas y casi todo lo que se te ocurra).
   * Por donde este en blanco la imagen se podra posicionar un Sprite, donde este en negro no sera posible.
   * @param {Image} img La imagen a asignar.
   * @param {optional} x Posicion x a dibujar.
   * @param {optional} y Posicion y a dibujar.
   */    
  setBoundary(img, x, y) {
    this._setBoundary(img, x, y);
  }  


  /**
   * @function {public canvas} getBoundary Obtiene el limite asignado al Layer... No se si lo utilizo en algun lado.
   */    
  getBoundary() {
    return this._boundary;
  }  


  /**
   * @function {public Object} _fnGetBoundaryStatus Obtiene un valor de un pixel determinado, del _boundary. 
   * Devuelve un objeto {r, g, b, a}. Se utiliza para determinar si puedo posicionar un Sprite en ese lugar.
   * @param {int} x Posicion x.
   * @param {int} y Posicion y.
   */    
  _fnGetBoundaryStatus(x, y) {
    if(_.isNaN(x) || _.isNaN(y)) {
        return {
            r : 255,
            g : 255,
            b : 255,
            a : 255
        }
    } else {
        if(_.isUndefined(this._boundary)) {
            return {
                r : 255,
                g : 255,
                b : 255,
                a : 255
            }
        } else {
            var data  = this._boundary.getImageData(x, y,  1, 1).data;
            return {
                r : data[0],
                g : data[1],
                b : data[2],
                a : data[3]
            }
        }                
    } // isNaN
  }


  /*        
          AGREGAR PROPERTY z-index, que me permita luego (mediante un setter y getter) ordenar en Orange el array _layers
          para que, al momento de dibujar, haya una estructura multicapa.
  */        
  /**
   * @function {public void} _fnInit Utilizado por Orange.addLayer, crea una referencia _context al contexto general, 
   * e instancia el _layer interno, donde se dibujaran los Sprites.
   * @param {canvas} context El canvas principal del juego.
   */    
  _fnInit(context) {
    this._context = context;
    this._tmpCanvas = document.createElement("canvas");
    this._tmpCanvas.width = this._width || this._context.canvas.width;
    this._tmpCanvas.height = this._height || this._context.canvas.height;
    this._layer = this._tmpCanvas.getContext("2d");
  }


  /**
   * @function {public void} _fnSetRootContext Crea una referencia interna de Orange para uso general.
   * @param {Orange} root
   */    
  _fnSetRootContext(root) {
    this.orangeRoot = root;
  }

}

export default Layer
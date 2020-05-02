/*
 * Declares {@link Orange} class etc.
 * @file orange.js
 * @version 2.0
  */

  import _ from "underscore";
  import ImageManager from "./image_manager"

/**
 * @class Orange
 * Clase Principal, contiene todos los metodos para inicializar la libreria, precargar imagenes, arrancar el loop, etc.
 * @constructor Orange
 */
class Orange {
  constructor() {
    /** @property {private canvasContext} _context El contexto 2D creado al inicializar la libreria, y donde se dibuja todo. */
    this._context = null; 

    /** @property {private canvas} canvasElement El elemento canvas en el DOM. */
    this.canvasElement = null;

    /** @property {private array} _layers Los layers que contiene el videojuego. */
    this._layers = [];

    /** @property {private ImageManager} _imageManager Una instancia de ImageManager, encargada de la precarga de imagenes y todo lo que necesite el juego. */
    this._imageManager = null;

    /** @property {private boolean} _bPlay Estado del videojuego, puede ser ejecutandose o en pausa. */
    this._bPlay = false;

    /** @property {private int} _counter Contador interno de 1 a 256, que por ahora no sirve para nada, pero seguramente servira para algo. */
    this._counter = 1;

    /** @property {private int} _speed el intervalo de ms entre llamadas al loop, 20ms son 60 fps. */
    this._speed = 20; // ms;

    /** @property {private object} _eventStack Aqui se guardan las instancias de los sprites a los que se asignaron eventos. */
    this._eventStack = { 
        mousedown : [],
        mouseup : [],
        mousemove : [],
        keydown : [],
        keyup : [],
        collision : [],
        enterFrame : []
    };

    /** @property {private callback} _cbMainLoop Callback asignado por el usuario, el cual es llamado al final de la ejecucion de los eventos, 
     * y ejecutado antes del dibujado de la pantalla. */
    this._cbMainLoop = null;

    /** @property {private Orange} orangeRoot Referencia a Orange, utilizado en diferentes lugares. */
    // this.orangeRoot = null;  
  }


  // ------------------------------------------------------------------------------------------------------
  // PRIVATE SECTION
  // ------------------------------------------------------------------------------------------------------
 
  /**
   * @function {private void} _init Inicializa la libreria, en el elemento DOM que le pasemos. Si no especificamos el elemento lo crea. 
   * Tambien crea una instancia del ImageManager, y asigna los eventos a los sprites registrados.
   * @param {optional} el El elemento opcional sobre el que se desarrollara la accion
   * @param {optional} scale El escalado del canvas.
   */    
  _init(el, scale) {
    // aca chequear si el es undefined no ejecutar esto...
    let domBody = document.getElementsByTagName("body")[0];

    if(_.isUndefined(el)) {
        domBody.innerHTML += '<canvas id="orange" width="500" height="198" style="border: 1px solid orange"></canvas>';
        this.canvasElement = domBody.getElementsByTagName("canvas")[0];
    } else {
      this.canvasElement = el;
    }
    
    this._context = this.canvasElement.getContext("2d");
    
    // si define scale, reescala el canvas
    if(!_.isUndefined(scale)) {
        this.canvasElement.width = this.canvasElement.width * scale.scaleWidth;
        this.canvasElement.height = this.canvasElement.height * scale.scaleHeight;
        this._context.scale(scale.scaleWidth, scale.scaleHeight);
    }
    
    this._imageManager = new ImageManager();
    
    this._bindEvents();
  }


  // EVENTS! ---------------------------    
  /**
   * @function {private void} _listener con _bindEvents, funcion para el control de eventos. 
   * La Funcion se ejecuta con cada evento registrado, y le transmite al evento, a traves de _fnNotify(), a cada uno de los sprites
   */        
  _listener(e) {
    var key = e.type;
    let keyCode = e.keyCode;
    
    // prevents scroll in page 
    if( (keyCode == 38) ||  
        (keyCode == 40) ||  
        (keyCode == 39) ||  
        (keyCode == 37)
    ) {
      e.preventDefault();
    }
    
    _.each(this._eventStack[key], (sprite) => {
      sprite._fnNotify(key, e);
    }); 
  };


  /**
   * @function {private void} _bindEvents Llamada al inicializar la libreria, esta funcion recorre _eventStack, y registra en cada tipo de evento un callback
   * _listener, que sera ejecutado cada vez que ocurran los eventos registrados
   * 
   */    
  _bindEvents() {
    _.each(this._eventStack, (event, key) => {
      if( (key != "collision") && (key != "enterFrame") ) {
        let regExKey =  /key/g;
        let _element = (regExKey.test(key))? window : this.canvasElement;
        _element.addEventListener(key, evt => this._listener(evt));  
      } 
    });        
  }


  /**
   * @function {private void} _update 
   * Es llamada en cada actualizacion del frame, desde el _loop, recorre todos los Layers en _layer, y les ejecuta Layer.update()
   */
  _update() {
    _.each(this._layers, (layer) => {
      layer.update();
    });
  }


  /**
   * @function {private void} _start 
   * Inicia el _loop
   */
  _start() {
      this._loop();
  }


  /**
   * @function {private void} _loop Llamada cada _speed ms, se encarga de redibujar el canvas. Tambien realiza el checkeo de colisiones para los sprites
   * que tengan registrado el evento 'collision', y tambien notifica a los que estan registrados en 'enterFrame'.
   * Ejecuta el main Callback asignado, y determina la cantidad de ms derrochados, para garantizar la fluidez del movimiento.
   */
  _loop() {
    // incrementa counter interno, utilizado para Animation
    this._counter++;

    if (this._counter >= 256) this._counter = 1; // se utiliza ^2 para facilitar la division con >>

    // bloque para determinar el costo en ms del bloque _cbMainLoop.
    let msStart = new Date().getMilliseconds();

    // evento collision: se ejecuta para cada sprite registrado.
    if(this._eventStack) {
      this._eventStack.collision && _.each(this._eventStack.collision, function(sprite) {
        sprite._fnNotify("collision");
      });                      

      this._eventStack.enterFrame && _.each(this._eventStack.enterFrame, function(sprite) {
          sprite._fnNotify("enterFrame");
      });                      
    }
    
          
    this._cbMainLoop && this._cbMainLoop();
          
    // _update: se encarga de recorrer el array _layers y pintar cada layer en el canvas
    // nota para recordar: a su vez, cada layer tiene un metodo _update, que se encarga de pintar los sprites que tiene sobre si mismo.
    this._update();      
    
    let msStop = new Date().getMilliseconds();
    var msLoop = msStop - msStart; 

    // si msLoop es negativo quiere decir que pasamos de segundo, entonces corregimos para obtener la duracion del loop
    if(msLoop < 0) {
      msLoop = 1000 + msLoop; // obtiene la diferencia de ms
    }
          
    if(this._bPlay) {
      // setea el timeout descontando los ms de ejecucion del codigo.
      // si msLoop es mayor que _speed, entonces que pase al proximo o proximos refresh...
      let nextLoop = this._speed - msLoop;
      if( msLoop >= this._speed) {
        nextLoop = (Math.floor(msLoop / this._speed) + 1) * this._speed;
      } else {
        console.warn('salteados ' + (Math.floor(msLoop / this._speed) + 1) + ' frames');
      }

      setTimeout(() => {
        this._loop();
      }, nextLoop);
    }
  }

  // ------------------------------------------------------------------------------------------------------
  // PUBLIC SECTION
  // ------------------------------------------------------------------------------------------------------

  /**
   * @function {public void} addLayer Permite agregar una capa de sprites en el _context. Las capas se dibujaran en el orden en que fueron agregadas.
   * @param {Layer} layer Instancia de Orange.Layer que quiero agregar
   */    
  addLayer(layer) {
    layer._fnInit(this._context);
    layer._fnSetRootContext(this);
    this._layers.push(layer);
  }

  /**
  * @function {public Array} getLayers Devuelve los layers utilizados en el juego.
  */    
  getLayers() {
    return this._layers;
  }

  /**
  * @function {public ImageManager} getImageManager devuelve una instancia de ImageManager
  */    
  getImageManager() {
    return this._imageManager;
  }

  /**
  * @function {public void} init Expone publicamente a _init
  * @param {Canvas} element Elemento Canvas en el que se desarrollara el juego.
  * @param {optional} scale El escalado del canvas.
  */    
  init(element, scale) {
    this._init(element, scale);
    // this.orangeRoot = this;
  }

  /**
  * @function {public Canvas} getCanvasElement Retorna el elemento Canvas donde se desarrolla el juego.
  */    
  getCanvasElement() {
    return this.canvasElement;
  }

  /**
  * @function {public void} _fnUpdate Fuerza la actualizacion de un frame.
  */    
  _fnUpdate() {
    this._update();
  }

  /**
  * @function {public void} start Inicia el loop.
  */    
  start() {
    this._bPlay = true;
    this._start();
  }

  /**
  * @function {public void} stop Pausa el loop.
  */    
  stop() {
    this._bPlay = false;
  }

  /**
  * @function {public void} preUpdateCallback Establece un callback que sera ejecutado al final del loop (luego de la deteccion de colisiones)
  * y antes de la actualizaccion del canvas (_update). POR ESO SE LLAMA preUdate!!!
  */    
  preUpdateCallback(callback) {
    this._cbMainLoop = callback;
  }

  /**
  * @function {public int} getCounter Devuelve el estado del contador interno (no demasiado util, de momento),
  */    
  getCounter() {
    return this._counter;
  }
  
  /**
  * @function {public void} addToEventStack Funcion de uso interno. Guarda una referencia del sprite en el array de eventos que le indiquemos. 
  * @param {Event} event El evento en el que quiero agregar el sprite.
  * @param {Sprite} sprite El sprite que quiero agregar.
  */    
  addToEventStack(event, sprite) {
    this._eventStack[event].push(sprite);
  }

  /**
  * @function {public boolean} removeFromEventStack
  * Funcion de uso interno. Quita el sprite que le pasamos de todos los eventStacks en que lo encuentre.
  * @param {Sprite} sprite El sprite que quiero remover.
  */    
  removeFromEventStack(sprite) {
    _.each(this._eventStack, (e, key) => {
      let i = e.indexOf(sprite);
      if(i != -1) {
          e.splice(i,1);
          return true;
      } else {
          return false;
      }
    });
  }

}

export default Orange;
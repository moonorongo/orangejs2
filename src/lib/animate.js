/*
 * Declares {@link Animation} class etc.
 * @file animate.js
 * @version 2.0
 */

import _ from "underscore";


/**
 * @class Animate
 * Una Animate recibe un ImageMap y gestiona una animacion en base a unos parametros de inicializacion. 
 * Una Animate gestiona diferentes "animaciones" que aqui se consideran "status" (por ejemplo animacion a la derecha, a la izquierda... explotando...etc)
 * 
 * @constructor Animate
 * @param {ImageMap} imageMap El ImageMap con los cuadros y estados.
 * @param {optional Object} config La configuracion de la animacion y de cada Status
 */
class Animate {
  constructor(imageMap, config) {
    /** @property {private ImageMap} _imageMap El ImageMap asignado */
    this._imageMap = imageMap;

    /** @property {private Object} _defaults Esoo mismo */
    this._defaults = {
      speed : 20
    }
            
    /** @property {private int} _imagenWidth el ancho del cada frame, tomado del ImageMap asignado */
    this._imagenWidth = this._imageMap.getSpriteWidth()

    /** @property {private int} _imagenHeight el alto del cada frame, tomado del ImageMap asignado */
    this._imagenHeight = this._imageMap.getSpriteHeight()

    /** @property {private Object} _config la configuracion interna de la Animation, tomada de la configuracion de la inicializacion, y los parametros defaults */
    this._config = config || _defaults

    /** @property {private int} _frame El puntero interno de la Animation. */
    this._frame = 0

    /** @property {private int} _status La animacion que quiero ejecutar (seria la fila del ImageMap). */
    this._status = 0

    /** @property {private int} _speed La velocidad con que se ejecuta la animacion. */
    this._speed = this._config.speed

    /** @property {private int} _speedCounter Contador de uso interno para gestionar la velocidad de la animacion. */
    this._speedCounter = 0
  }


  // ------------------------------------------------------------------------------------------------------
  // PUBLIC SECTION
  // ------------------------------------------------------------------------------------------------------

  /**
   * @function {public Object} getFrame Obtiene un frame, incrementa el puntero interno, y demas. 
   * Devuelve un objeto, con una referencia a la imagen, y la posicion x e y dentro de la misma, segun el status asignado.
   */    
  getFrame() {
    let currentSpeed = ( _.isUndefined(this._config.statusConfig[this._status].speed) )? this._speed : this._config.statusConfig[this._status].speed;

    if(this._speedCounter < currentSpeed) {
      this._speedCounter++;
    } else {
      this._speedCounter = 0;
        if(this._frame < this._imageMap.getCantFrames(this._status) - 1) {
          this._frame++;
        } else {
          this._frame = 0;       
        }
    }
    
    return { 
      image : this._imageMap.getImage(), 
      px : this._imagenWidth * this._frame, 
      py : this._imagenHeight * this._status};
  }


  /**
   * @function {public int} getSpriteWidth obtiene el ancho del Sprite.
   */    
  getSpriteWidth() {
    return this._imagenWidth;
  }

  /**
   * @function {public int} getSpriteHeight obtiene la altura del Sprite.
   */    
  getSpriteHeight() {
    return this._imagenHeight;
  }

  getType() {
     return "Animation";
  }


  /**
   * @function {public void} setStatus Asigna el status (la fila) que quiero reproducir.
   * @param {int} status El numero de status que quiero asignar.
   */    
  setStatus(s) {
    this._status = s;
    if(this._frame >= this._imageMap.getCantFrames(this._status) - 1) {
      this._frame = 0;
    }
  }


  /**
   * @function {public void} setStatusDie Asigna el status al dieStatus asignado en la instanciacion del ImageMap, 
   * si no tiene seteado en imageMap no lo setea, deja el que estaba
   */    
  setStatusDie() {
    if(_.isNull(this._imageMap._fnGetDieStatus())) {
      return;
    }

    this._status = this._imageMap._fnGetDieStatus();
  }  


  /**
   * @function {public int} _fnGetStatusDieCantFrames Retorna la cantidad de frames que vamos a necesitar para la propiedad _muriendo en Sprite.
   */    
  _fnGetStatusDieCantFrames() {
    let i = this._imageMap._fnGetDieStatus();

    if(_.isNull(i)) {
      return 0;
    } else {
      let speed = (_.isUndefined(this._config.statusConfig[i].speed))? this._speed : this._config.statusConfig[i].speed;
      return this._imageMap._fnGetStatusDieCantFrames() * (speed - 1);
    }
  }


}

export default Animate
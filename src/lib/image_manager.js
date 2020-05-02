/*
 * Declares {@link ImageManager} class etc.
 * @file image_manager.js
 * @version 2.0
  */

  import _ from "underscore";

/**
 * @class ImageManager 
 * El ImageManager es el encargado de la precarga de las imagenes a utilizar en el Juego. 
 * DE MOMENTO OFRECE UNAS FUNCIONALIDADES BASICAS, PERO ESPERO EN UN FUTURO AGREGAR ALGUNAS MAS
 */ 
class ImageManager {

  /** @constructor ImageManager
   * @param {optional Array} aImages Si bien la inicializacion permite setear el Array inicial de imagenes a cargar, 
   * en Orange el sistema se encarga de instanciar la clase, por lo que, por lo menos aca, esta feature no se utiliza.
   */
  constructor(aImages = []) {
    this._imagesToPreload = aImages;
    this._images = [];
    this._completeTask = null;
    this._options = null;
    this._callback = null;
  }


  // ------------------------------------------------------------------------------------------------------
  // PRIVATE SECTION
  // ------------------------------------------------------------------------------------------------------
  
  _addImage(src) {
    if(_.isString(src)) {
      this._imagesToPreload.push(src);
    } else {
      _.each(src, (e) => {
        this._imagesToPreload.push(e);
      });
    }
  }


  _startPreload(callback) {
    _.each(this._imagesToPreload, (src) => {
      let tmpImg = document.createElement("img");
      tmpImg.src = src;
      this._images.push(tmpImg);
    })
    
    this._imagesToPreload = [];
    this._callback = callback;

    this._completeTask = setInterval(() => {
      this._checkCompleteTask(); 
    }, 300);
  };  


  _checkCompleteTask() {
    var count = 0;
    
    _.each(this._images, (e) => {
      if(e.complete) count++;
    })
    
    if(count == this._images.length) { 
      clearInterval(this._completeTask);
      this._callback();
    } 
  };    

  // ------------------------------------------------------------------------------------------------------
  // PUBLIC SECTION
  // ------------------------------------------------------------------------------------------------------
  

  /**
   * @function {public void} addImage Permite agregar al array interno de imagenes los archivos que queremos cargar.
   * @param {Images} src Puede tomar una imagen individual (String) o un Array de Strings (para especificar varias).
   */    
  addImage(src) {
    this._addImage(src);
  }

  /**
   * @function {public void} preload Inicia la precarga de imagenes. Al finalizar ejecuta el callback pasado como parametro.
   * @param {callback} callback La funcion a ejecutar al finalizar la carga.
   */
  preload(callback) {
      this._startPreload(callback);
  }  

  /**
   * @function {public Array} getImages Devuelve el array interno completo con las imagenes cargadas.
    */    
   getImages() {
    return this._images;
  }

  /**
  * @function {public Image} get Obtiene una Imagen de las imagenes cargadas.
  * @param {String} src el nombre, o parte del nombre, del archivo. La funcion devuelve el primero que encuentre.
  */    
  get(src) {
    var rTest = new RegExp(src);
    
    return _.filter(this._images,(i) => { 
      return rTest.test(i.src) 
    })[0];
  }
  
}

export default ImageManager
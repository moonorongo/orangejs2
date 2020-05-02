import _ from "underscore";

class ImageMap {
  constructor(imgData) {
    this._image = imgData.image;
    this._nFrames = [];

    // obtencion automatica de frames en base a la transparencia del frame
    // si el frame es totalmente transparente, entonces se considera que la animacion llego a su fin.
    // contra: no se podra tener frames totalmente transparentes.
    let _tmpCanvas = document.createElement("canvas");
    _tmpCanvas.width = this._image.width;
    _tmpCanvas.height = this._image.height;

    let _tempContext = _tmpCanvas.getContext('2d');
    _tempContext.clearRect(0, 0, this._image.width, this._image.height);
    _tempContext.drawImage(this._image, 0, 0);

    this._imagenWidth = this._image.width;
    this._imagenHeight = this._image.height;
    this._spriteWidth  = imgData.width;
    this._spriteHeight = imgData.height;

    this._tMap = imgData.transitableMap || null;
    this._dieStatus = imgData.dieStatus || 0;
    this._status = 0;

    let _cantidadFrames = Math.ceil(this._imagenWidth / this._spriteWidth),
        _statusLength =  Math.ceil(this._imagenHeight / this._spriteHeight);

    for(var fila = 0; fila < _statusLength; fila++) {
      for(var columna = 0; columna < _cantidadFrames; columna++) {
            
        let data = _tempContext.getImageData(columna * this._spriteWidth, fila * this._spriteHeight,  this._spriteWidth, this._spriteHeight).data;
        let longitudDatos = data.length;
        let celdaTransparente = true;
        
        for(var i = 0;  i < longitudDatos; i += 4) {
          if (data[i+3] != 0) celdaTransparente = false;
        }
        
        if (celdaTransparente) {
            this._nFrames[fila] = columna;
            break;
        };
        
        // si no encontro el ultimo frame vacio, entonces setea el ultimo con el valor maximo
        if(columna == _cantidadFrames - 1) {
          this._nFrames[fila] = _cantidadFrames;
        } 
                
      } // for columna
    } // for fila
  } // END CONSTRUCTOR



  // ------------------------------------------------------------------------------------------------------
  // PUBLIC SECTION
  // ------------------------------------------------------------------------------------------------------
  
  getChar(charNumber) {
    let tWidth = Math.floor(this._imagenWidth / this._spriteWidth),
        s = Math.floor(charNumber / tWidth),
        frame = charNumber % tWidth;
       
    let t = (!_.isNull(this._tMap))? this._tMap[s][frame] : true;

    return { 
      image : this._image, 
      px : this._spriteWidth * frame, 
      py : this._spriteHeight * s, 
      transitable : t
    };
  }


  getFrame(frame, status) {
    var s = (_.isUndefined(status))? this._status : status;

    return { 
      image : this._image, 
      px : this._spriteWidth * frame, 
      py : this._spriteHeight * s
    };
  }


  setStatus(s) {
     this._status = s;
  }


  _fnGetDieStatus() {
      return this._dieStatus;
  }


  setStatusDie() {
      this._status = this._dieStatus;
  }


  getImage() {
      return this._image;
  }


  getSpriteWidth() {
      return this._spriteWidth; 
  }


  getSpriteHeight() {
     return this._spriteHeight;
  }


  getType() {
      return "ImageMap";
  }


  getCantFrames(status) {
     return this._nFrames[status];
  }


  _fnGetStatusDieCantFrames() {
     return this._nFrames[this._dieStatus];
  }
  
}

export default ImageMap;
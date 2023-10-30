class HttpError extends Error{
    constructor(message, errorCode){
        super(message);// agrego la propiedad mensaje
        this.code = errorCode;// agrego la propiedad codigo a la clase
    }
}
module.exports = HttpError;
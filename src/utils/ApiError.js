class ApiError extends Error{
    constructor(
        statusCode,                                 // for example 404 or 400 or something
        message='Something went wrong',
        errors=[],
        stack=''
    ){
        super(message)
        this.statusCode=statusCode
        this.data=null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}
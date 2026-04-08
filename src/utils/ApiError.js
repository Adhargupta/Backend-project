class ApiError extends Error{
    constructor(
        statusCode,                                 // for example 404 or 400 or something
        message='Something went wrong',
        errors=[],
        stack=''                                        // We are using stack to capture the stack trace of the error, which can be helpful for debugging purposes. If a stack trace is provided, it will be used; otherwise, we will capture the current stack trace.
    ){
        super(message)                                      // call the parent class constructor with the message
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
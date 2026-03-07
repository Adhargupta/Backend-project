import express from 'express'

const app = express()


import cors from 'cors'     // This allow us to make request from frontend to backend
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,    // This is the origin from which we allow request to our backend (frontend url)
        cradentials: true     // This is used to allow cookies to be sent from frontend to backend 
    }
))
app.use(express.json({limit: '16kb'}))     // This is used to parse the incoming request body in json format (if we don't use this we can't access req.body in our routes)
app.use(express.urlencoded())               // This is used when user goes for different browser then different url generates 
app.use(express.static("public"))     // This is used to serve static files from the "public" directory (like images, css files, js files etc.)


import cookieParser from 'cookie-parser'
app.use(cookieParser())     // This is used to parse the cookies from the incoming request and make it available in req.cookies (if we don't use this we can't access req.cookies in our routes)

export default app 
// export {app}     // This work same as above

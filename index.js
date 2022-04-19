import express from 'express'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import config from './config'
import 'dotenv/config'

// SERVER SETUP
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
    store: MongoStore.create({
        mongoUrl: config.mongoUrl,
        mongoOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    }),
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000*60*60*24*30
    }
}))

// ROUTES


// SERVER INITIALIZE
const PORT = process.env.PORT || 8080
const server = app.listen(PORT, () => {
    console.log(`Server para el prode mundial corriendo en el puerto ${PORT}`)
})
server.on('error', (err) => {
    console.error("Server error: ", err)
})
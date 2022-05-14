const MongoStore = require('connect-mongo')
const express = require("express");
const session =require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const { create } = require('express-handlebars');
const csrf = require('csurf')
const User = require("./models/User");
require('dotenv').config()
const clientDB = require('./database/db')
const mongoSanitize = require('express-mongo-sanitize')
const cors = require('cors')

const app = express();

const corsOption = {
    Credential: true,
    origin: process.env.PATHHEROKU || '*',
    methods: ['GET','POST']
}
app.use(cors())
//configuración de session
app.use(session({
    secret: process.env.SECRETSESSION,
    resave: false,
    saveUninitialized: false,
    name: 'secret-name',
    store: MongoStore.create({
        clientPromise: clientDB,
        dbName: process.env.DBNAME
    }),
    cookie: {secure:process.env.MODO === 'production' ? true : false , maxAge: 30*24*60*60*1000}
}))
//flash
app.use(flash())


///passport

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user,done) => done(null,{id:user._id, userName: user.userName})) //req.user
passport.deserializeUser(async(user,done) => {
    const userDB = await User.findById( user.id)
    return done(null,{id:userDB._id, userName: userDB.userName})
})

//set up handlebars
const hbs = create({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: "views/layout/",
    partialsDir: "views/components"
});
//config motor de plantilla
app.engine(".hbs", hbs.engine)
app.set("view engine", ".hbs");
app.set("views", "./views")






//middleware
app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({extended: true}))

app.use(csrf())
app.use(mongoSanitize())


app.use((req,res,next) => {
    res.locals.csrfToken = req.csrfToken()
    next()
})

app.use('/', require('./routes/home'))
app.use('/auth', require('./routes/auth'))


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('Servidor andando')
})

const User = require("../models/User")
const { validationResult } = require('express-validator')
const { nanoid } = require('nanoid')
const nodemailer = require('nodemailer')
require('dotenv').config()

const registerForm = (req, res) => {
    res.render('register', { mensajes: req.flash('mensajes') })
}

const registerUser = async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        req.flash('mensajes', errors.array())
        
        //return res.json(errors.array())
        return res.redirect('/auth/register')
    }

    const { userName, email, password } = req.body
    try {
        let user = await User.findOne({ email: email })
        if (user) throw new Error('ya existe el usuario')
        user = new User({ userName, email, password, tokenConfirm: nanoid() })
        await user.save()

        const transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.userEmail,
                pass: process.env.passEmail
            }
        });

        await transport.sendMail({
            from: "waldiredumarinrivera@gmail.com",
            to: user.email,
            subject: "verifica tu cuenta de correo",
            html: `<a href="${process.env.PATHHEROKU || 'http://localhost:5000'}/auth/confirmar/${user.tokenConfirm}">Verifica tu cuenta presionado aquí</a>`
        });


        req.flash('mensajes', [{ msg: 'Reviza tu correo electrónico y confirma' }])
        res.redirect('/auth/login')

    } catch (error) {

        req.flash('mensajes', [{ msg: error.message }])
        return res.redirect('/auth/register')
    }

}

const confirmarCuenta = async (req, res) => {
    const { token } = req.params
    try {
        const user = await User.findOne({ tokenConfirm: token })
        if (!user) throw new Error('No existe este usuario')
        user.cuentaConfirmada = true
        user.tokenConfirm = null
        await user.save()
        req.flash('mensajes', [{ msg: 'Cuenta verificada, puedes iniciar sesión' }])
        res.redirect('/auth/login')
    } catch (error) {
        req.flash('mensajes', [{ msg: error.message }])
        return res.redirect('/auth/login')
    }

}

const loginForm = (req, res) => {
    res.render('login', { mensajes: req.flash('mensajes') })
}

const loginUser = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        req.flash('mensajes', errors.array())
        //return res.json(errors.array())
        return res.redirect('/auth/login')
    }
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) throw new Error('no existe este email')
        if (!user.cuentaConfirmada) throw new Error('falta confirmar cuenta')
        if (!(await user.comparePassword(password))) throw new Error('Contraseña incorrecta')

        //crea la sesion de usuario a travez de passport
        req.login(user, function (err) {
            if (err) throw new Error('error al crear la sesión')
            return res.redirect('/')
        })

    } catch (error) {
        req.flash('mensajes', [{ msg: error.message }])
        return res.redirect('/auth/login')
        //res.send(error.message)
    }
}


const cerrarSesion = (req, res) => {
    req.logout()
    res.redirect('/auth/login')
}

module.exports = {
    loginForm,
    registerForm,
    registerUser,
    confirmarCuenta,
    loginUser,
    cerrarSesion
}
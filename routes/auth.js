const express = require('express');
const {body} = require('express-validator')
const { loginForm, registerForm, registerUser,confirmarCuenta ,loginUser, cerrarSesion} = require('../controllers/authController');
const router = express.Router();


router.get('/register',registerForm)
router.post('/register',[
    body('userName','ingrese un nombre válido').trim().notEmpty().escape(),
    body('email','ingrese un email válido').trim().isEmail().normalizeEmail(),
    body('password','contraseña de mínimo 6 carácteres').trim().isLength({min: 6}).escape().custom((value,{req}) => {
        if(value !== req.body.rePassword){
            throw new Error('no coinciden las contraseñas')
        }
        return value
    })
],registerUser)
router.get('/confirmar/:token',confirmarCuenta)
router.get('/login', loginForm)
router.post ('/login',[
    body('email','ingrese un email válido').trim().isEmail().normalizeEmail(),
    body('password','contraseña de mínimo 6 carácteres').trim().isLength({min: 6}).escape()
],loginUser)

router.get('/logout',cerrarSesion)

module.exports = router;

const Url = require('../models/Url')
const validationResult = require('express-validator')
const { nanoid } = require('nanoid')

const leerUrl = async (req, res) => {
    try {
        const urls = await Url.find({ user: req.user.id }).lean()
        res.render('home', { urls: urls })
    } catch (error) {
        req.flash('mensajes', [{ msg: error.message }])
        return res.redirect('/')
    }

};

const agregarUrl = async (req, res) => {

    const { origin } = req.body

    try {
        
        const url = new Url({ origin: origin, shortURL: nanoid(6), user: req.user.id })

        req.flash('mensajes', [{ msg: 'url agregada' }])

        await url.save()
        res.redirect('/')

    } catch (error) {
        req.flash('mensajes', [{ msg: error.message }])
        return res.redirect('/')
    }
}

const eliminarUrl = async (req, res) => {
    const { id } = req.params
    try {
        const url = await Url.findById(id);
        if (!url.user.equals(req.user.id)) {
            throw new Error('no es tu url');
        }
        await url.remove()
        res.redirect('/')
    } catch (error) {
        req.flash('mensajes', [{ msg: error.message }])
        return res.redirect('/')
    }
}

const editarUrlForm = async (req, res) => {
    const { id } = req.params
    try {
        const url = await Url.findById(id).lean()


        if (!url.user.equals(req.user.id)) {
            throw new Error('no es tu url');
        }
        res.render('home', { url })
    } catch (error) {
        req.flash('mensajes', [{ msg: error.message }])
        return res.redirect('/')
    }
}

const editarUrl = async (req, res) => {
    const { id } = req.params
    const { origin } = req.body
    try {
        const url = await Url.findById(id);
        if (!url.user.equals(req.user.id)) {
            throw new Error('no es tu url');
        }


        await url.updateOne({ origin })
        res.redirect('/')

    } catch (error) {
        req.flash('mensajes', [{ msg: error.message }])
        return res.redirect('/')
    }
}

const redireccionamiento = async (req, res) => {
    const { shortURL } = req.params
    console.log(shortURL)
    try {
        const urlDb = await Url.findOne({ shortURL: shortURL })
        res.redirect(urlDb.origin)
    } catch (err) {
        req.flash('mensajes', [{ msg: err.message }])
        return res.redirect('/auth/login')
    }
}


module.exports = {
    leerUrl,
    agregarUrl,
    eliminarUrl,
    editarUrlForm,
    editarUrl,
    redireccionamiento,
}
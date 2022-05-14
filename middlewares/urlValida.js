const { URL } = require('url')

const urlValidar = (req, res, next) => {
    try {

        const errors = validationResult(req)
        
        if (!errors.isEmpty()) {
            throw new Error(errors.array())
        }
        const { origin } = req.body;
        const urlFrontend = new URL(origin)
        if (urlFrontend.origin !== 'null') {
            if (
                urlFrontend.protocol === 'http:' ||
                urlFrontend.protocol === 'https:'
            ) {
                return next()
            }
        }
        throw new Error('Tiene que tener https://')

    } catch (error) {
        if(error.message === 'Invalid URL'){
            req.flash('mensajes', [{ msg: 'Url no valida' }])
        }else{
            req.flash('mensajes', [{ msg: error.message }])
        }
        
        return res.redirect('/')

    }
}



module.exports = urlValidar
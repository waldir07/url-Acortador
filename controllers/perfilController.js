const flash = require('connect-flash/lib/flash');
const formidable = require('formidable')
const path = require('path')
const User = require("../models/User")
const Jimp = require('jimp')
const fs = require('fs')


module.exports.formPerfil = async (req, res) => {

    try {
        const user = await User.findById(req.user.id)
        return res.render('perfil',{user: req.user, imagen: user.imagen})
    } catch (error) {
        console.log(error)
        res.render('perfil');
    }
    
}

module.exports.editarFotoPerfil = async (req, res) => {
    const form = new formidable.IncomingForm();
    form.maxFileSize = 50 * 1024 * 1024;//50mb

    form.parse(req, async (err, fields, files) => {

        try {
            if (err) {
                throw new Error('falló formidable')
            }
            console.log(files)

            const file = files.myFile;
            if (file.originalFilename === '') {
                throw new Error('Por favor agrega una imagen')
            }

            const imageTypes = ['image/jpeg', 'image/png']
            if (!imageTypes.includes(file.mimetype)) {
                throw new Error('por favor agrega una imagen tipo jpg/png')
            }
            if (!file.size > 50 * 1024 * 1024) {
                throw new Error('menos de 5mb por favor')
            }
            const extension = file.mimetype.split('/')[1]
            const dirFile = path.join(__dirname, `../public/img/perfil/${req.user.id}.${extension}`)
            console.log(dirFile)



            fs.renameSync(file.filepath, dirFile)
            
            
            const image = await Jimp.read(dirFile)
            image.resize(200,200).quality(90).writeAsync(dirFile)
            
            const user = await  User.findById(req.user.id)
            user.imagen = `${req.user.id}.${extension}`
            await user.save()
            req.flash('mensajes', [{ msg: 'ya se subió la imagen' }])
        } catch (error) {
            console.log(error)
            req.flash('mensajes', [{ msg: error.message }])

        } finally {
            return res.redirect('/perfil')
        }


    })
}
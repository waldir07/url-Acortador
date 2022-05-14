document.addEventListener('click', e => {
    if(e.target.dataset.short){
        const url = `${windows.location.origin}/${e.target.dataset.short}`
        navigator.clipboard
        .writeText(url)
        .then(() => {
            console.log('texto copiado')
        })
        .catch((err) => {
            console.log('error')
        })
    }
})
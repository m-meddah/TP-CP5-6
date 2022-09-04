const utilsModule = {
    // adresse de l'API
    base_url: 'http://localhost:3000',
    hideModals: function() {
        // cacher la modale en retirant la classe CSS de la modale
        const modals = document.querySelectorAll('.modal');

        for(const modal of modals) {
            modal.classList.remove('is-active');
        }
    }
}

module.exports = utilsModule;
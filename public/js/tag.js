const utilsModule = require('./utils');
const tagModule = {
    makeTagInDOM: function(tag) {
        // créer le span représentant le tag
        const span = document.createElement('span');
        // lui donner la class tag de Bulma
        span.classList.add('tag');
        // modifier son texte
        span.textContent = tag.name;
        // changer sa couleur de fond
        span.style.backgroundColor = tag.color;
        // lui donner un data-attribute id
        span.dataset.tagId = tag.id;
        // lui attacher un écouteur d'event dblclick pour dissocier le tag de la carte
        span.addEventListener('dblclick', tagModule.dissociateTagToCard);
        // récupérer dans le DOM la bonne carte
        const cardDOM = document.querySelector(`[data-card-id="${tag.card_has_tag.card_id}"]`);
        // l'insérer dans la bonne carte
        cardDOM.appendChild(span);
    },
    dissociateTagToCard: async function(event) {
        // récupérer l'id du tag
        const tagId = event.target.dataset.tagId;
        // récupérer l'id de la carte
        const cardId = event.target.closest('.box').dataset.cardId;
        try {
            // dissocier le tag de la carte
            // faire un call API en DELETE sur /tags/:tagId/card/:cardId
            await fetch(`${utilsModule.base_url}/cards/${cardId}/tag/${tagId}`, {
                method: 'DELETE'
            });
            // supprimer le tag du DOM
            event.target.remove();
        } catch(error) {
            console.error(error);
            alert("Impossible de dissocier le tag de la carte !");
        }
        
    },
    showAssociateTagModal: function(event) {
        const tagModal = document.querySelector('#associateTagModal');
        // on modifie le champ caché card_id en fonction de la carte qui a été cliquée
        tagModal.querySelector('input[name="card_id"]').value = event.target.closest('.box').dataset.cardId;
        // on affiche la modale
        tagModal.classList.add('is-active');
    },
    handleAssociateTagForm: async function(event) {
        // empêcher le rechargement de la page
        event.preventDefault();
        // récupérer les infos du formulaire
        const formData = new FormData(event.target);
        // récupérer l'id de la carte
        const cardId = formData.get('card_id');
        // récupérer l'id du tag
        // faire un call API en POST sur /cards/:id/tag
        const response = await fetch(`${utilsModule.base_url}/cards/${cardId}/tag`, {
            method: 'POST',
            body: formData
        });
        const card = await response.json();
        const tag = card.tagsList.find(tag => tag.id === Number(formData.get('tagId')));
        // mettre à jour le DOM en affichant le tag dans la bonne carte
        tagModule.makeTagInDOM(tag);
        // fermer la modale
        utilsModule.hideModals();
    }
}

module.exports = tagModule;
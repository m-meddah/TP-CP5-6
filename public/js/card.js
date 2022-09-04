const utilsModule = require('./utils');
const tagModule = require('./tag');

const cardModule = {
    handleAddCardForm: async function(event) {
        // empêcher le rechargement de la page
        event.preventDefault();
        // on recup les value du formulaire
        const formData = new FormData(event.target);
    
        try {
          const response = await fetch(`${utilsModule.base_url}/cards`, {
            method: 'POST',
            body: formData
          });
          const card = await response.json();
          // on créé la carte dans le DOM
          cardModule.makeCardInDOM(card);
        } catch(error) {
          console.error(error);
          alert("Impossible de créer la carte !");
        }
        // on vide le formulaire
        event.target.reset();
        // on cache la modale
        utilsModule.hideModals();
      },
      makeCardInDOM: function(card) {
        // selectionner le template
        const template = document.getElementById('templateCard');
        // on en fait un clone
        const templateCard = template.content.cloneNode(true);
        // on va modifier le titre de la carte
        templateCard.querySelector('.column').textContent = card.description;
        // modifier l'id de la carte dans le DOM, l'attribut data-card-id
        const cardDOM = templateCard.querySelector('.box');
        cardDOM.dataset.cardId = card.id;
        // changer la couleur de fond de la carte
        cardDOM.style.backgroundColor = card.color;
        // mettre à jour card_id du formulaire d'édition
        cardDOM.querySelector('input[name="card_id"]').value = card.id;
        // attacher un écouter d'event click sur le bouton de modification
        cardDOM.querySelector('.btn-edit-card').addEventListener('click', cardModule.showEditCardForm);
        // attacher un écouteur d'event submit sur le form d'édiiton de la carte
        cardDOM.querySelector('form').addEventListener('submit', cardModule.handleEditCardForm);
        // attacher un écouteur d'event click sur le bouton de suppression de la carte
        cardDOM.querySelector('.btn-delete-card').addEventListener('click', cardModule.deleteCard);
        // attacher un écouteur d'event click sur le bouton servant à associer un tag à une carte
        cardDOM.querySelector('.btn-associate-tag').addEventListener('click', tagModule.showAssociateTagModal);
        // placer la carte dans la bonne liste
        const listDOM = document.querySelector(`.panel[data-list-id="${card.list_id}"]`);
        // on place la carte au bon endroit dans la liste, ici la div panel-block
        listDOM.querySelector('.panel-block').appendChild(templateCard);
      },
      deleteCard: async function(event) {
        const cardDOM = event.target.closest('.box');
        // récupérer l'id de la carte via le data-attribute de la div card
        const cardId = cardDOM.dataset.cardId;
        try {
          // faire un call API en DELETE sur /cards/:id
          await fetch(`${utilsModule.base_url}/cards/${cardId}`, {
            method: 'DELETE'
          });

          // supprimer la carte dans le DOM
          cardDOM.remove();
        } catch(error) {
          console.error(error);
          alert("Impossible de supprimer la carte !");
        }
      },
      handleEditCardForm : async function(event) {
          // couper le rechargement de la page
          event.preventDefault();
          // récupérer la data du formulaire d'édition
          const formData = new FormData(event.target);
          try {
            // faire un call API en PATCH sur /cards/:id
          await fetch(`${utilsModule.base_url}/cards/${formData.get('card_id')}`, {
            method: 'PATCH',
            body: formData
          });
          // en cas de succès, modifier le titre de la carte
          const cardDOM = event.target.closest('.box');
          if(formData.get('description')) {
            cardDOM.querySelector('.title-card').textContent = formData.get('description');
          }
          // changer la couleur de la carte dans le DOM
          cardDOM.style.backgroundColor = formData.get('color');
          // cacher le formulaire
          event.target.classList.add('is-hidden');
          // afficher le titre de la carte
          cardDOM.querySelector('.title-card').classList.remove('is-hidden');
        } catch(error) {
          console.error(error);
          alert("Impossible de modifier la carte !");
        }
        
      },
      showEditCardForm: function(event) {
        // cacher le titre de la carte
        const cardDOM = event.target.closest('.box');
        cardDOM.querySelector('.title-card').classList.add('is-hidden');
        // afficher le formulaire d'édition
        cardDOM.querySelector('form').classList.remove('is-hidden');
      },
      showAddCardModal: function(event) {
        // récupérer l'id de la liste qui a été cliqué
        //  const listId = event.target.closest('.panel').getAttribute('data-list-id');
        const listId = event.target.closest('.panel').dataset.listId;
        // modifier le input hidden du formulaire avec le bon id de list
        document.querySelector('#addCardModal input[name="list_id"]').value = listId;
        // affiche la modale
        document.getElementById('addCardModal').classList.add('is-active');
      },
      moveCards: function(list) {
        const cardsDOM = list.querySelectorAll('.box');
        cardsDOM.forEach(async (cardDOM, i) => {
          // récupérer l'id de la carte de ce tour de boucle
          const cardId = cardDOM.dataset.cardId;
          // on créé un formData sans lui spécifier de formulaire (car il n'y en a pas)
          const formData = new FormData();
          // puis on lui donne les propriétés qu'il faut changer
          formData.set('position', i);
          // ici on va récupérer l'id de la liste
          const listId = list.closest('.panel').dataset.listId;
          formData.set('list_id', listId);
          // faire un call API en PATCH sur /cards/:id
          await fetch(`${utilsModule.base_url}/cards/${cardId}`, {
            method: 'PATCH',
            body: formData
          });
        })
      }
}

module.exports = cardModule;
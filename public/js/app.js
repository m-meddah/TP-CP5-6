const utilsModule = require('./utils');
const listModule = require('./list');
const cardModule = require('./card');
const tagModule = require('./tag');

// on objet qui contient des fonctions
const app = {
  
  // fonction d'initialisation, lancée au chargement de la page
  init: function () {
    app.addListenerToActions();
    app.getListsFromAPI();
    // récupérer l'élément container
    const listContainer = document.querySelector('.card-lists');
    new Sortable(listContainer, {
      draggable: '.panel',
      onEnd: function() {
        // récupérer toutes les listes triées dans le bon ordre
        const listsDOM = document.querySelectorAll('.panel');
        // pour chacun d'entre elle, faire un call API en PATCH sur /lists/:id
        listsDOM.forEach(async (listDOM, i) => {
          // récupérer l'id de la liste
          const listId = listDOM.dataset.listId;
          // on créé un formData qu'on passera dans le body du fetch
          const formData = new FormData()
          // on met à jour sa position
          formData.set('position', i);
          // faire le call API
          await fetch(`${utilsModule.base_url}/lists/${listId}`, {
            method: 'PATCH',
            body: formData
          });
        })
      }
    });
    app.fillSelectTagModal();
  },
  getListsFromAPI: async function() {
    try {
      // récupérer les listes via un fetch sur la route GET /lists
      const response = await fetch(`${utilsModule.base_url}/lists`);
      const lists = await response.json();
      
      // boucler sur lists pour créer chaque liste dans le DOM grâce à la fonction makeListInDOM
      for(const list of lists) {
        listModule.makeListInDOM(list);
        for(const card of list.cardsList) {
          cardModule.makeCardInDOM(card);
          for(const tag of card.tagsList) {
            tagModule.makeTagInDOM(tag);
          }
        }
      }
    } catch(error) {
      console.error(error);
    }
    
  },
  addListenerToActions: function() {
    // on veut attacher un écouteur d'évènement click sur notre bouton d'ajout de liste
    document.getElementById('addListButton').addEventListener('click', listModule.showAddListModal);
    // on veut attacher un écouteur d'évènement click sur les boutons de fermeture
    document.querySelectorAll('.close').forEach(btnClose => {
      btnClose.addEventListener('click', utilsModule.hideModals);
    });
    // on veut attacher un écouteur d'évènement submit au formulaire d'ajout de liste
    document.querySelector('#addListModal form').addEventListener('submit', listModule.handleAddListForm);
    // on veut attacher aux petits + un écouteur d'évènement click pour afficher la modale d'ajout de carte
    // const btnsAddCard = document.querySelectorAll('.btn-add-card');
    // for(const btn of btnsAddCard) {
    //   btn.addEventListener('click', app.showAddCardModal);
    // }
    // attraper la soumission du formulaire d'ajout de carte pour créer la carte dans le DOM
    document.querySelector('#addCardModal form').addEventListener('submit', cardModule.handleAddCardForm);
    // on attache un écouteur d'event submit sur le formulaire d'association d'un tag
    document.querySelector('#associateTagModal form').addEventListener('submit', tagModule.handleAssociateTagForm);
  },
  fillSelectTagModal: async function() {
    try {
      // On souhaite récupérer tous les tags
      // faire un call API en GET sur /tags
      const response = await fetch(`${utilsModule.base_url}/tags`);
      const tags = await response.json();
      // remplir le select du form de la modal
      const select = document.querySelector('#associateTagModal select[name="tagId"]');
      for(const tag of tags) {
        // on créé une balise option
        const option = document.createElement('option');
        // on modifie son texte avec le nom du tag
        option.textContent = tag.name;
        // on modifie sa value avec l'id du tag
        option.value = tag.id;
        // on insère la balise option dans le select
        select.appendChild(option);
      }
    } catch(error) {
      console.error(error);
      alert("Impossible de récupérer les tags !");
    }
  } 

};

// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener('DOMContentLoaded', app.init );
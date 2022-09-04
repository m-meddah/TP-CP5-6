(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{"./card":2,"./list":3,"./tag":4,"./utils":5}],2:[function(require,module,exports){
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
},{"./tag":4,"./utils":5}],3:[function(require,module,exports){
const utilsModule = require('./utils');
const cardModule = require('./card');

const listModule = {
    handleAddListForm: async function(event) {
        // on va enlever le rechargement de la page
        event.preventDefault();
        // on va créer un formData pour récupérer plus facilement les valeurs du formulaire
        const formData = new FormData(event.target);
        try {
          // faire un call API sur la route POST /lists
          const response = await fetch(`${utilsModule.base_url}/lists`, {
            method: 'POST',
            body: formData
          });
          const list = await response.json();
          // on crééer la liste dans le DOM en lui passant formData
          listModule.makeListInDOM(list);
        } catch(error) {
          console.error(error);
          alert("Impossible de créer la liste !");
        }
        
        // cacher la modale
        utilsModule.hideModals();
        // on vide le formulaire
        event.target.reset();
      },
      makeListInDOM: function(list) {
        // créer la liste dans le DOM en partant du template
        const template = document.getElementById('templateList');
        // créer une copie du template que l'on va ensuite modifier et insérer dans le DOM
        const templateList = template.content.cloneNode(true);
        // on modifie le titre de la liste de la copie du template
        templateList.querySelector('h2').textContent = list.name;
        // modifier l'ID de la liste dans le DOM, ça va modifier le data-list-id
        templateList.querySelector('.panel').dataset.listId = list.id;
        // modifier l'ID de la liste du form d'édition
        templateList.querySelector('input[name="list_id"]').value = list.id;
        // attacher un écouteur d'event double click sur le h2 de la liste qui affichera le formulaire d'édition
        templateList.querySelector('h2').addEventListener('dblclick', listModule.showEditListForm);
        // attacher un écouteur d'event submit sur le formulaire d'édition
        templateList.querySelector('form').addEventListener('submit', listModule.handleEditListForm);
        // on va attacher l'écouteur d'event click sur le bouton + pour afficher la modale de carte
        templateList.querySelector('.btn-add-card').addEventListener('click', cardModule.showAddCardModal);
        // on va attacher l'écouteur d'event click sur le bouton de suppression de la liste
        templateList.querySelector('.btn-delete-list').addEventListener('click', listModule.deleteList);
        // on va cibler l'élément container qui va contenir nos cartes pouvant être déplacées
        const cardContainer = templateList.querySelector('.panel-block');
        // on instancie SOrtable autant de fois qu'on a de containers de cartes (donc à chaque liste créée)
        const sortable = new Sortable(cardContainer, {
          // renseigner l'élément pouvant être déplacé dans le container, ici nos cartes
          draggable: '.box',
          // permet de regrouper les containers en tant qu'un seul bloc et donc permettre de déplacer nos cartes à l'intérieur de chaque liste
          group: 'list',
          // déclencer une fonction lorsqu'un drag & drop est effectué
          onEnd: function(event) {
            // on récupère le container d'origine, là où on a saisi la carte
            const originList = event.from;
            // on récupère le nouveau container, là où on a déposé la carte
            const newList = event.to;
            
            // modifier la position de toutes les cartes de la liste d'origine
            cardModule.moveCards(originList);
            if(originList !== newList) {
              cardModule.moveCards(newList);
            }

          }
        });
        // insérer dans le DOM La copie du template
        document.querySelector('.card-lists').appendChild(templateList);
      },
      deleteList: async function(event) {
        // demander la confirmation de l'utilisateur
        if(confirm("Voulez-vous vraiment supprimer cette liste ?")) {
          const listDOM = event.target.closest('.panel');
          // récupérer l'id de la liste
          const listId = listDOM.dataset.listId;
          try {
            // faire un call API DELETE sur /lists/:id
            await fetch(`${utilsModule.base_url}/lists/${listId}`, {
              method: 'DELETE'
            });
            // supprimer la liste dans le DOM
            listDOM.remove();
          } catch(error) {
            console.error(error);
            alert("Impossible de supprimer cette liste !");
          }
          
        }
      },
      handleEditListForm: async function(event) {
        // empêcher le rechargement de la page
        event.preventDefault();
        // intercepter les données du formulaire
        const formData = new FormData(event.target);
        /* 
        const input = document.querySelector('input').value
        {
          name: 'truc',
          tel: '06.0...',
          ...
        }
        
        */

        // récupérer l'id de la liste (pour le coup on l'a déjà dans formData)
        // const listId = event.target.closest('.panel').dataset.listId;
        // faire un call API en PATCH sur la route /lists/:id
        try {
          const response = await fetch(`${utilsModule.base_url}/lists/${formData.get('list_id')}`, {
            method: 'PATCH',
            body: formData
          });
          if(response.ok) {
            // reset le formulaire
            event.target.reset();
            // cacher le formulaire
            event.target.classList.add('is-hidden');
            // modifier le h2
            const h2 = event.target.previousElementSibling;
            if(formData.get('name')) {
              h2.textContent = formData.get('name');
            }
            // afficher le h2
            h2.classList.remove('is-hidden');
          }
          
        } catch(error) {
          console.error(error);
          alert("Impossible de modifier la liste !")
        }

      },
      showEditListForm: function(event) {
        // cacher le h2 de la liste
        event.target.classList.add('is-hidden');
        // afficher le formulaire d'édition
        event.target.nextElementSibling.classList.remove('is-hidden');
        // event.target.closest('.panel').querySelector('form').classList.remove('is-hidden');
      },
      showAddListModal: function() {
        // afficher la modale en lui donnant la classe CSS is-active de Bulma
        document.getElementById('addListModal').classList.add('is-active');
      },
}

module.exports = listModule;
},{"./card":2,"./utils":5}],4:[function(require,module,exports){
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
},{"./utils":5}],5:[function(require,module,exports){
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
},{}]},{},[1]);

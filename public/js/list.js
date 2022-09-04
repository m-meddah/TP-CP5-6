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
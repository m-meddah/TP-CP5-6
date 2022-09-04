const { List } = require('../models/index');

const listController = {
    getAllLists: async (request, response) => {
        try {
            const lists = await List.findAll({
                include: {
                    association: 'cardsList',
                    include: 'tagsList'
                    },
                order: [
                    ['position', 'ASC'],
                    ['cardsList', 'position', 'ASC']
                ]
            });

            response.json(lists);
    
        } catch(error) {
            console.trace(error);

            response.status(500).json(error.toString());
        }
    },

    createList: async (request, response) => {
        try {
            const { name, position } = request.body;

            if(!name) {
                response.status(400).json(
                    {
                        code: "missing_name",
                        message: "Le champ name ne peut pas être vide"
                    }
                );
            }

            const createdList = await List.create({ name, position });

            response.json(createdList);
    
        } catch(error) {
            console.trace(error);

            response.status(500).json(error.toString());
        }
    },

    getOneList: async (request, response) => {
        try {
            
            const listId = request.params.id;

            const list = await List.findByPk(listId, {
                include: {
                    association: 'cardsList',
                    include: 'tagsList'
                    },
                order: [
                    ['position', 'ASC'],
                    ['cardsList', 'position', 'ASC']
                ]
            })

            if(list) {
                response.json(list);

            } else {

                response.status(404).json(
                    {
                        code: "wrong_id",
                        message: `La liste avec l'id ${listId} n'existe pas`
                    }
                );
            }

        } catch(error) {
            console.trace(error);

            response.status(500).json(error.toString());
        }
    },

    modifyList: async (request, response) => {
        try {
            
            const listId = request.params.id;

            const list = await List.findByPk(listId);

            if(list) {

                const { name, position } = request.body;

                if(name) {
                    list.name = name;
                };

                if(position) {
                    list.position = position;
                };

                await list.save();

                response.json(list);

            } else {

                response.status(404).json(
                    {
                        code: "wrong_id",
                        message: `La liste avec l'id ${listId} n'existe pas`
                    }
                );
            }

        } catch(error) {
            console.trace(error);

            response.status(500).json(error.toString());
        }
    },

    deleteList: async (request, response) => {
        try {
            
            const listId = request.params.id;

            const list = await List.findByPk(listId);

            if(list) {

                await list.destroy();

                response.json(`La liste avec l'id ${listId} a bien été supprimée`);

            } else {

                response.status(404).json(
                    {
                        code: "wrong_id",
                        message: `La liste avec l'id ${listId} n'existe pas`
                    }
                );
            }

        } catch(error) {
            console.trace(error);

            response.status(500).json(error.toString());
        }
    }
};

module.exports = listController;

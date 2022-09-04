const { Tag, Card } = require('../models/index');

const tagController = {
    getAllTags: async (request, response) => {
        try {
            const tagsList = await Tag.findAll();

            response.json(tagsList);
        } catch (error) {
            console.trace(error);

            response.status(500).json(error.toString());
        }
    },

    createTag: async (request, response) => {
        try {
            const { name, color } = request.body;

            if(!name) {
                response.status(400).json(
                    {
                        code: "missing_name",
                        message: "Le champ name ne peut pas être vide"
                    }
                );
            }

            const createdTag = await Tag.create({ name, color });

            response.json(createdTag);

        } catch (error) {
            console.trace(error);

            response.status(500).json(error.toString());
        }
    },

    modifyTag: async (request, response) => {
        try {
            
            const tagId = request.params.id;

            const tag = await Tag.findByPk(tagId);

            if(tag) {

                const { name, color } = request.body;

                if(name) {
                    tag.name = name;
                };

                if(color) {
                    tag.color = color;
                };

                await tag.save();

                response.json(tag);
            }

        } catch (error) {
            console.trace(error);

            response.status(500).json(error.toString());
        }
    },

    deleteTag: async (request, response) => {
        try {
            
            const tagId = request.params.id;

            const tag = await Tag.findByPk(tagId);

            if(tag) {

                await tag.destroy();

                response.json(`Le tag avec l'id ${tagId} a bien été supprimée`);

            } else {
                response.status(404).json(
                    {
                        code: "wrong_id",
                        message: `Le tag avec l'id ${tagId} n'existe pas`
                    }
                );
            }

        } catch(error) {
            console.trace(error);

            response.status(500).json(error.toString());
        }
    },

    addTagToCard: async (request, response) => {

        try {

            const cardId = request.params.id;

            const tagId = request.body.tagId;

            let card = await Card.findByPk(cardId, {
                include: {
                    association: "tagsList"
                }
            });

            if(!card) {
                return response.status(404).json({
                    code: "wrong_card_id",
                    message: `La carte avec l'id ${cardId} n'existe pas`
                })
            }
    
            const tag = await Tag.findByPk(tagId);
    
            if(!tag) {
                return response.status(404).json({
                    code: "wrong_tag_id",
                    message: `Le tag avec l'id ${tagId} n'existe pas`
                })
            }

            await card.addTagsList(tag);

            card = await Card.findByPk(cardId, {
                include: {
                    association: "tagsList"
                }
            });

            response.json(card);

        } catch (error) {
            console.trace(error);

            response.status(500).json(error.toString());
        }

    },

    removeTagFromCard: async (request, response) => {
        try {

            const cardId = request.params.card_id;

            const tagId = request.params.tag_id;

            let card = await Card.findByPk(cardId, {
                include: {
                    association: "tagsList"
                }
            });

            if(!card) {
                return response.status(404).json({
                    code: "wrong_card_id",
                    message: `La carte avec l'id ${cardId} n'existe pas`
                })
            }

            const tag = await Tag.findByPk(tagId);
    
            if(!tag) {
                return response.status(404).json({
                    code: "wrong_tag_id",
                    message: `Le tag avec l'id ${tagId} n'existe pas`
                })
            }

            await card.removeTagsList(tag);

            card = await Card.findByPk(cardId, {
                include: {
                    association: "tagsList"
                }
            });

            response.json(card);

        } catch (error) {
            console.trace(error);

            response.status(500).json(error.toString());
        }
    }
};

module.exports = tagController;
const List = require('./list');
const Card = require('./card');
const Tag = require('./tag');

// Associations

// 1 List peut avoir plusieurs Card
List.hasMany(Card, {
    as: 'cardsList',
    foreignKey: 'list_id'
});

//  1 Card appartient à une seule List
Card.belongsTo(List, {
    as: 'list',
    foreignKey: 'list_id'
});

//  1 Card peut avoir plusieurs Tag
Card.belongsToMany(Tag, {
    as: 'tagsList',
    through: 'card_has_tag',
    foreignKey: 'card_id',
    otherKey: 'tag_id'
});

//  1 Tag peut appartenir à plusieurs Card
Tag.belongsToMany(Card, {
    as: 'cardsList',
    through: 'card_has_tag',
    foreignKey: 'tag_id',
    otherKey: 'card_id'
});

module.exports = { List, Card, Tag };

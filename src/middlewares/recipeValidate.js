const { check } = require('express-validator');

let validateCreateRecipe = () => {
    return [
        check('number_of_step', 'number_of_step does not Empty').not().isEmpty(),
    ];
}
let validateUpdateRecipe = () => {
    return [
        check('number_of_step', 'number_of_step does not Empty').not().isEmpty(),
        check('recipe_id', 'recipe_id does not Empty').not().isEmpty(),
    ];
}
let validateRecipe = {
    validateCreateRecipe: validateCreateRecipe,
    validateUpdateRecipe: validateUpdateRecipe
};

module.exports = { validateRecipe };
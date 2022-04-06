const { check } = require('express-validator');

let validateCreateComment = () => {
    return [
        check('number_of_step', 'number_of_step does not Empty').not().isEmpty(),
    ];
}
let validateUpdateComment = () => {
    return [
        check('number_of_step', 'number_of_step does not Empty').not().isEmpty(),
        check('recipe_id', 'recipe_id does not Empty').not().isEmpty(),
    ];
}
let validateInterac = {
    validateCreateComment, validateUpdateComment
};

module.exports = { validateInterac };
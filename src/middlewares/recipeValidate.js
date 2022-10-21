const {check} = require('express-validator');

let validateCreateRecipe = () => {
  return [
    check('short_description', 'short_description does not Empty').not().isEmpty(),
    check('amount_of_people', 'amount_of_people does not Empty').not().isEmpty(),
    check('cooking_time', 'cooking_time does not Empty').not().isEmpty(),
    check('title', 'title does not Empty').not().isEmpty(),
    check('stepcontent', 'stepcontent does not Empty').not().isEmpty(),
    check('category', 'category does not Empty').not().isEmpty(),
    check('ingredient', 'ingredient does not Empty').not().isEmpty(),
  ];
};
let validateUpdateRecipe = () => {
  return [
    check('recipe_id', 'recipe_id does not Empty').not().isEmpty(),
    check('short_description', 'short_description does not Empty').not().isEmpty(),
    check('amount_of_people', 'amount_of_people does not Empty').not().isEmpty(),
    check('cooking_time', 'cooking_time does not Empty').not().isEmpty(),
    check('title', 'title does not Empty').not().isEmpty(),
    check('stepcontent', 'stepcontent does not Empty').not().isEmpty(),
    check('category', 'category does not Empty').not().isEmpty(),
    check('ingredient', 'ingredient does not Empty').not().isEmpty(),
  ];
};
let validateRecipe = {
  validateCreateRecipe: validateCreateRecipe,
  validateUpdateRecipe: validateUpdateRecipe,
};

module.exports = {validateRecipe};

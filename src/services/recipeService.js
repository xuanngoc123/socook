const db = require('../models/index')
const { getUrlImage } = require('../config/multer')

const recipeService = {
    resolveGetRecipe: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let id = req.query.id;
                let recipe = await db.Recipe.findOne({
                    where: { id: id },
                    raw: true
                })
                if (!recipe) {
                    resolve({
                        messageCode: 2,
                        message: 'recipe not found!'
                    })
                } else {
                    if (recipe.main_image_url) recipe.main_image_url = getUrlImage(recipe.main_image_url);

                    let step = await db.Step.findAll({
                        where: { recipe_id: recipe.id },
                        raw: true
                    })

                    for (let i = 0; i < step.length; i++) {
                        if (step[i].image_url_list != '' && step[i].image_url_list != null) {

                            let listKey = step[i].image_url_list.trim().split(' ');

                            let listUrl = '';
                            for (let j = 0; j < listKey.length; j++) {
                                listUrl = listUrl + ' ' + getUrlImage(listKey[j])
                            }
                            step[i].image_url_list = listUrl;
                        }
                    }
                    let likes = await db.Like.count({
                        where: { recipe_id: recipe.id }
                    })

                    const [results, metadata] = await db.sequelize.query(
                        `SELECT i.name, rhi.quantity  FROM recipe_has_ingredient AS rhi JOIN ingredient as i ON rhi.ingredient_id = i.id WHERE rhi.recipe_id = ${id};`
                    );
                    let comment = await db.Comment.findAll({
                        where: { recipe_id: recipe.id },
                        raw: true
                    })
                    if (comment) {
                        for (let i = 0; i < comment.length; i++) {
                            let listImgaeComment = '';
                            if (comment[i].image_url_list != '' && comment[i].image_url_list != null) {
                                let listKeyComment = comment[i].image_url_list.trim().split(' ');
                                for (let i = 0; i < listKeyComment.length; i++) {
                                    listImgaeComment = listImgaeComment + ' ' + getUrlImage(listKeyComment[i]);
                                }
                            }


                            let likeComment = await db.User_like_comment.count({
                                where: { comment_id: comment[i].id }

                            })
                            let childComment = await db.Child_comment.findAll({
                                where: { parent_id: comment[i].id },
                                raw: true
                            })
                            comment[i].image_url_list = listImgaeComment;
                            comment[i].like = likeComment;
                            comment[i].childComment = childComment;
                        }
                    }


                    let data = {
                        recipe,
                        step,
                        likes,
                        ingredient: results,
                        comment,
                    }

                    resolve({
                        messageCode: 1,
                        message: 'get recipe success!',
                        data
                    })
                }
            } catch (error) {
                console.log("get recipe: " + error)
                reject({
                    messageCode: 0,
                    message: 'get recipe fail!'
                })
            }
        })
    },
    resolveCreateRecipe: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let number_of_step = req.body.number_of_step;

                // CREATE TABLE RECIPE
                let createRecipe = await db.Recipe.create({
                    title: req.body.title,
                    owner_id: req.user.user_id,
                    total_views: 0,
                    short_description: req.body.short_description,
                    amount_of_people: req.body.amount_of_people,
                    is_allowed: 0,
                    cooking_time: req.body.cooking_time,
                    create_time: Date.now(),
                    last_update: Date.now(),
                    update_by: req.user.user_id
                })

                let main_image_url = req.files.filter(x => x.fieldname == 'main_image_url');
                if (main_image_url.length > 0) {
                    createRecipe.main_image_url = main_image_url[0].key;
                    await createRecipe.save();
                }


                // CREATE TABLE STEP
                for (let i = 1; i <= number_of_step; i++) {
                    let createStep = await db.Step.create({
                        recipe_id: createRecipe.id,
                        number: i,
                        content: req.body.step[i - 1]
                    })
                    let listImgae = req.files.filter(x => x.fieldname == `imagestep${i}`)
                    let numberOfImageEachStep = listImgae.length;
                    let list_key = '';
                    if (numberOfImageEachStep > 0) {
                        for (let i = 0; i < numberOfImageEachStep; i++) {
                            list_key = list_key + ' ' + listImgae[i].key
                        }
                    }
                    createStep.image_url_list = list_key;
                    await createStep.save();
                }
                //CREATE TABLE CATEGORY HAS RECIPE
                let category = req.body.category;
                let categoryLength = category.length;
                for (let i = 0; i < categoryLength; i++) {
                    let category_id = await db.Category.findOne({
                        where: { name: category[i] }
                    })
                    await db.Category_has_recipe.create({
                        recipe_id: createRecipe.id,
                        category_id: category_id.id,
                    })
                }
                //CREATE TABLE INGREDIENT and RECIPE_HAS_INGREDIENT
                let listIngredient = req.body.ingredient;
                let listIngredientLength = listIngredient.length;
                for (let i = 0; i < listIngredientLength; i++) {
                    let quantityAndIngredient = listIngredient[i].split(' ');
                    let length = quantityAndIngredient.length;
                    let quantity = quantityAndIngredient[0] + ' ' + quantityAndIngredient[1];
                    let ingredient = '';
                    for (let i = 2; i < length; i++) {
                        ingredient = ingredient + ' ' + quantityAndIngredient[i];
                    }

                    let findIngredient = await db.Ingredient.findOne({
                        where: { name: ingredient }
                    })
                    if (!findIngredient) {
                        let createIngredient = await db.Ingredient.create({
                            name: ingredient
                        })
                        let createRecipeHasIngredient = await db.Recipe_has_ingredient.create({
                            recipe_id: createRecipe.id,
                            ingredient_id: createIngredient.id,
                            quantity: quantity
                        })
                    } else {
                        let createRecipeHasIngredient = await db.Recipe_has_ingredient.create({
                            recipe_id: createRecipe.id,
                            ingredient_id: findIngredient.id,
                            quantity: quantity
                        })
                    }
                }
                resolve({
                    messageCode: 1,
                    message: 'create recipe success!'
                })

            } catch (error) {
                console.log("create recipe: " + error)
                reject({
                    messageCode: 0,
                    message: 'create recipe fail!'
                })
            }
        })
    },
    resolveGetWaitRecipe: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user_id = req.user.user_id;
                let waitRecipe = await db.Recipe.findAll({
                    where: {
                        owner_id: user_id,
                        is_allowed: 0
                    }
                })
                resolve({
                    messageCode: 1,
                    message: 'get wait recipe success!',
                    waitRecipe,
                })

            } catch (error) {
                console.log("wait recipe: " + error)
                reject({
                    messageCode: 0,
                    message: 'get wait recipe fail!'
                })
            }
        })
    },
    resolveUpdateRecipe: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let number_of_step = req.body.number_of_step;

                // UPDATE TABLE RECIPE
                let findRecipe = await db.Recipe.findOne({
                    where: { id: req.body.id }
                })
                if (findRecipe.owner_id != req.user.user_id) {
                    resolve({
                        messageCode: 2,
                        message: 'you are not allowed!'
                    })
                }
                if (req.body.title) findRecipe.title = req.body.title
                if (req.body.short_description) findRecipe.short_description = req.body.short_description
                if (req.body.amount_of_people) findRecipe.amount_of_people = req.body.amount_of_people
                if (req.body.cooking_time) findRecipe.cooking_time = req.body.cooking_time
                findRecipe.last_update = Date.now()
                findRecipe.update_by = req.user.user_id
                await findRecipe.save();

                let main_image_url = req.files.filter(x => x.fieldname == 'main_image_url');
                if (main_image_url.length > 0) {
                    findRecipe.main_image_url = main_image_url[0].key;
                    await findRecipe.save();
                }


                // CREATE TABLE STEP
                let destroyStep = await db.Step.destroy({
                    where: { recipe_id: findRecipe.id, }
                })
                for (let i = 1; i <= number_of_step; i++) {
                    let createStep = await db.Step.create({
                        recipe_id: findRecipe.id,
                        number: i,
                        content: req.body.step[i - 1]
                    })
                    let listImgae = req.files.filter(x => x.fieldname == `imagestep${i}`)
                    let numberOfImageEachStep = listImgae.length;
                    let list_key = '';
                    if (numberOfImageEachStep > 0) {
                        for (let i = 0; i < numberOfImageEachStep; i++) {
                            list_key = list_key + ' ' + listImgae[i].key
                        }
                    }
                    createStep.image_url_list = list_key;
                    await createStep.save();
                }

                // let findStep = await db.Step.findAll({
                //     where: { recipe_id: findRecipe.id, },
                // })
                // if (number_of_step >= findStep.length) {
                //     for (let i = 1; i <= number_of_step; i++) {
                //         if (i <= findStep.length) {
                //             let listImgae = req.files.filter(x => x.fieldname == `imagestep${i}`)
                //             let numberOfImageEachStep = listImgae.length;
                //             let list_key = '';
                //             if (numberOfImageEachStep > 0) {
                //                 for (let i = 0; i < numberOfImageEachStep; i++) {
                //                     list_key = list_key + ' ' + listImgae[i].key
                //                 }
                //             }
                //             let findStepByNumber = await db.Step.findOne({
                //                 where: { recipe_id: findRecipe.id, number: i },
                //             })
                //             findStepByNumber.image_url_list = list_key;
                //             if (number_of_step == 1)
                //                 findStepByNumber.content = req.body.step;
                //             else findStepByNumber.content = req.body.step[i - 1];
                //             await findStepByNumber.save();
                //         } else {
                //             let listImgae = req.files.filter(x => x.fieldname == `imagestep${i}`)
                //             let numberOfImageEachStep = listImgae.length;
                //             let list_key = '';
                //             if (numberOfImageEachStep > 0) {
                //                 for (let i = 0; i < numberOfImageEachStep; i++) {
                //                     list_key = list_key + ' ' + listImgae[i].key
                //                 }
                //             }
                //             let createNewStep = await db.Step.create({
                //                 recipe_id: findRecipe.id,
                //                 number: i,
                //                 content: req.body.step[i - 1]
                //             })
                //             createNewStep.image_url_list = list_key;
                //             await createNewStep.save();
                //         }

                //     }
                // } else {
                //     for (let i = 1; i <= findStep.length; i++) {
                //         if (i <= number_of_step) {
                //             let listImgae = req.files.filter(x => x.fieldname == `imagestep${i}`)
                //             let numberOfImageEachStep = listImgae.length;
                //             let list_key = '';
                //             if (numberOfImageEachStep > 0) {
                //                 for (let i = 0; i < numberOfImageEachStep; i++) {
                //                     list_key = list_key + ' ' + listImgae[i].key
                //                 }
                //             }
                //             let findStepByNumber = await db.Step.findOne({
                //                 where: { recipe_id: findRecipe.id, number: i },
                //             })
                //             findStepByNumber.image_url_list = list_key;
                //             if (number_of_step == 1)
                //                 findStepByNumber.content = req.body.step;
                //             else findStepByNumber.content = req.body.step[i - 1];
                //             await findStepByNumber.save();
                //         }
                //         else {
                //             let findStepDelete = await db.Step.destroy({
                //                 where: {
                //                     recipe_id: findRecipe.id,
                //                     number: i
                //                 }
                //             })
                //         }
                //     }
                // }



                //Update TABLE CATEGORY HAS RECIPE
                await db.Category_has_recipe.destroy({
                    where: { recipe_id: findRecipe.id }
                })

                let category = req.body.category;
                let categoryLength = category.length;
                for (let i = 0; i < categoryLength; i++) {
                    let category_id = await db.Category.findOne({
                        where: { name: category[i] }
                    })
                    await db.Category_has_recipe.create({
                        recipe_id: findRecipe.id,
                        category_id: category_id.id,
                    })
                }
                //UPDATE TABLE INGREDIENT and RECIPE_HAS_INGREDIENT
                await db.Recipe_has_ingredient.destroy({
                    where: { recipe_id: findRecipe.id }
                })
                let listIngredient = req.body.ingredient;
                let listIngredientLength = listIngredient.length;
                for (let i = 0; i < listIngredientLength; i++) {
                    let quantityAndIngredient = listIngredient[i].split(' ');
                    let length = quantityAndIngredient.length;
                    let quantity = quantityAndIngredient[0] + ' ' + quantityAndIngredient[1];
                    let ingredient = '';
                    for (let i = 2; i < length; i++) {
                        ingredient = ingredient + ' ' + quantityAndIngredient[i];
                    }

                    let findIngredient = await db.Ingredient.findOne({
                        where: { name: ingredient }
                    })
                    if (!findIngredient) {
                        let createIngredient = await db.Ingredient.create({
                            name: ingredient
                        })
                        let createRecipeHasIngredient = await db.Recipe_has_ingredient.create({
                            recipe_id: findRecipe.id,
                            ingredient_id: createIngredient.id,
                            quantity: quantity
                        })
                    } else {
                        let createRecipeHasIngredient = await db.Recipe_has_ingredient.create({
                            recipe_id: findRecipe.id,
                            ingredient_id: findIngredient.id,
                            quantity: quantity
                        })
                    }
                }
                resolve({
                    messageCode: 1,
                    message: 'update recipe success!'
                })

            } catch (error) {
                console.log("create recipe: " + error)
                reject({
                    messageCode: 0,
                    message: 'update recipe fail!'
                })
            }
        })
    },
    resolveDeleteRecipe: async (req) => {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                let id = req.query.id;
                let findRecipe = await db.Recipe.findOne({
                    where: { id: id }
                })
                if (findRecipe.owner_id != req.user.user_id) {
                    resolve({
                        messageCode: 2,
                        message: 'you are not allowed!'
                    })
                }

                // const transaction = await db.sequelize.transaction();

                await db.Step.destroy({
                    where: { recipe_id: id }
                }, { transaction: transaction })

                await db.Category_has_recipe.destroy({
                    where: { recipe_id: id }
                }, { transaction: transaction })

                await db.Recipe_has_ingredient.destroy({
                    where: { recipe_id: id }
                }, { transaction: transaction })

                await db.Recipe.destroy({
                    where: { id: id }
                }, { transaction: transaction })

                await transaction.commit();
                resolve({
                    messageCode: 1,
                    message: 'delete recipe success!'
                })
            } catch (error) {
                await transaction.rollback();
                console.log('err delete recipe: ' + error)
                reject({
                    messageCode: 0,
                    message: 'delete recipe fail!'
                })
            }
        })
    },
}

module.exports = recipeService;
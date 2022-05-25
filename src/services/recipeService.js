const db = require('../models/index')
const { getUrlImage } = require('../config/multer')
const requestIp = require('request-ip');
const recipeService = {
    getRecipeById: async (id) => {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {

                let recipe = await db.Recipe.findOne({
                    where: { id: id },
                })
                if (!recipe) {
                    return resolve({
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

                    const [ingredient, igde_metadata] = await db.sequelize.query(
                        `SELECT i.id, i.name, rhi.quantity  FROM recipe_has_ingredient AS rhi JOIN ingredient as i ON rhi.ingredient_id = i.id WHERE rhi.recipe_id = ${id};`
                    );

                    const [category, ctgr_metadata] = await db.sequelize.query(
                        `SELECT category.id, category.name FROM category JOIN category_has_recipe on category.id = category_has_recipe.category_id WHERE category_has_recipe.recipe_id = ${id};`
                    );



                    await transaction.commit();

                    let data = {
                        recipe,
                        step,
                        likes,
                        category,
                        ingredient,
                    }

                    return resolve({
                        messageCode: 1,
                        message: 'get recipe success!',
                        data
                    })
                }
            } catch (error) {
                console.log(error);
                await transaction.rollback();
                reject({
                    messageCode: 0,
                    message: 'get recipe fail!'
                })
            }
        })
    },
    resolveGetRecipe: async (id, req = null) => {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {

                let recipe = await db.Recipe.findOne({
                    where: { id: id }
                })
                if (!recipe) {
                    return resolve({
                        messageCode: 2,
                        message: 'recipe not found!'
                    })
                } else {
                    let ip = req.socket.remoteAddress;
                    let findIp = await db.Ip_view.findOne({
                        where: {
                            ip_address: ip,
                            recipe_id: id
                        }
                    })
                    console.log(findIp);
                    if (!findIp) {
                        let createIp = await db.Ip_view.create({
                            ip_address: ip,
                            recipe_id: id,
                            total_views: 1
                        }, { transaction })
                        recipe.total_views++;
                        await recipe.save({ transaction });
                    } else {
                        if (findIp.total_views < 3) {
                            recipe.total_views++;
                            findIp.total_views++;
                            await recipe.save({ transaction });
                            await findIp.save({ transaction });
                        } else {
                            findIp.total_views++;
                            await findIp.save({ transaction });
                        }
                    }

                    let recipeOutput = await db.Recipe.findOne({
                        where: { id: recipe.id },
                        raw: true
                    })

                    if (recipeOutput.main_image_url) recipeOutput.main_image_url = getUrlImage(recipeOutput.main_image_url);
                    let user = await db.Login_info.findOne({
                        where: { user_id: recipe.owner_id }
                    })
                    recipeOutput.user_name = user.user_name;
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

                    const [ingredient, igde_metadata] = await db.sequelize.query(
                        `SELECT i.id, i.name, rhi.quantity  FROM recipe_has_ingredient AS rhi JOIN ingredient as i ON rhi.ingredient_id = i.id WHERE rhi.recipe_id = ${id};`
                    );

                    const [category, ctgr_metadata] = await db.sequelize.query(
                        `SELECT category.id, category.name FROM category JOIN category_has_recipe on category.id = category_has_recipe.category_id WHERE category_has_recipe.recipe_id = ${id};`
                    );
                    if (req.result.user == null || req.result.user == undefined) {
                        var liked = null;
                        var checkCollection = null;
                    } else {
                        var checkLike = await db.Like.findOne({
                            where: {
                                recipe_id: id,
                                user_id: req.result.user.user_id
                            }
                        })
                        var liked = 0
                        if (checkLike) {
                            liked = 1;
                        }

                        var [checkCollection, cclt_metadata] = await db.sequelize.query(
                            `SELECT collection.id, collection.name FROM collection WHERE collection.user_id = ${req.result.user.user_id} AND collection.id in (SELECT collection_has_recipe.collection_id FROM collection_has_recipe WHERE collection_has_recipe.recipe_id = ${id});`
                        );
                    }


                    await transaction.commit();

                    let data = {
                        recipe: recipeOutput,
                        step,
                        likes,
                        category,
                        ingredient,
                        liked,
                        collections: checkCollection
                    }
                    if (req.result?.user?.role == 'admin' || (recipe.owner_id == req.result?.user?.user_id) || (recipe.is_allowed == 1)) {
                        return resolve({
                            messageCode: 1,
                            message: 'get recipe success!',
                            data
                        })
                    } else {
                        return resolve({
                            messageCode: 3,
                            message: 'you are not allowed!'
                        })
                    }



                }
            } catch (error) {
                console.log(error);
                await transaction.rollback();
                reject({
                    messageCode: 0,
                    message: 'get recipe fail!'
                })
            }
        })
    },
    resolveGetCommentOfRecipe: async (id, req = null) => {
        return new Promise(async (resolve, reject) => {
            try {
                let comment = await db.Comment.findAll({
                    where: { recipe_id: id },
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
                        let childCommentLength = childComment.length;
                        if (childCommentLength > 0) {
                            for (let j = 0; j < childCommentLength; j++) {
                                let [user_info] = await db.sequelize.query(
                                    `SELECT login_info.user_name as user_name, user.avatar_image as avatar_image FROM login_info JOIN user ON login_info.user_id = user.user_id WHERE user.user_id = ${childComment[j].user_id};`
                                );
                                childComment[j].user_name = user_info[0].user_name;
                                childComment[j].avatar_image = getUrlImage(user_info[0].avatar_image);
                            }
                        }
                        let [user_info] = await db.sequelize.query(
                            `SELECT login_info.user_name as user_name, user.avatar_image as avatar_image FROM login_info JOIN user ON login_info.user_id = user.user_id WHERE user.user_id = ${comment[i].user_id};`
                        );
                        if (req.result.user == null || req.result.user == undefined) {
                            var liked = null;
                        } else {
                            var checkLike = await db.User_like_comment.findOne({
                                where: {
                                    comment_id: comment[i].id,
                                    user_id: req.result.user.user_id
                                }
                            })
                            var liked = 0
                            if (checkLike) {
                                liked = 1;
                            }
                        }
                        comment[i].avatar_image = getUrlImage(user_info[0].avatar_image);
                        comment[i].user_name = user_info[0].user_name;
                        comment[i].image_url_list = listImgaeComment;
                        comment[i].like = likeComment;
                        comment[i].liked = liked;
                        comment[i].childComment = childComment;


                    }
                }
                return resolve({
                    messageCode: 1,
                    message: 'get comment success!',
                    comment
                })
            } catch (error) {
                console.log(error);
                reject({
                    messageCode: 0,
                    message: 'get recipe fail!'
                })
            }
        })
    },
    resolveGetMyListRecipe: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let myListRecipe = await db.Recipe.findAll({
                    where: {
                        owner_id: req.user.user_id,
                        is_allowed: 1
                    }
                })
                myListRecipe = recipeService.getUrlImageOfArrRecipe(myListRecipe)
                return resolve({
                    messageCode: 1,
                    message: 'get my list recipe success!',
                    myListRecipe,
                })

            } catch (error) {
                console.log(error)
                reject({
                    messageCode: 0,
                    message: 'get my list recipe fail!'
                })
            }
        })
    },
    resolveGetUserListRecipe: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (req.query.user_name) {
                    var userLogin = await db.Login_info.findOne({
                        where: { user_name: req.query.user_name },
                        raw: true,
                    })
                    if (userLogin) {
                        var userListRecipe = await db.Recipe.findAll({
                            where: {
                                owner_id: userLogin.user_id,
                                is_allowed: 1
                            }
                        })
                    }
                } else if (req.query.user_id) {
                    var userListRecipe = await db.Recipe.findAll({
                        where: {
                            owner_id: req.query.user_id,
                            is_allowed: 1
                        }
                    })
                }

                if (!userListRecipe) {
                    return resolve({
                        messageCode: 2,
                        message: 'user not fonnd!',
                    })
                }
                userListRecipe = recipeService.getUrlImageOfArrRecipe(userListRecipe)
                return resolve({
                    messageCode: 1,
                    message: 'get user list recipe success!',
                    userListRecipe,
                })

            } catch (error) {
                console.log(error)
                reject({
                    messageCode: 0,
                    message: 'get user list recipe fail!'
                })
            }
        })
    },
    resolveCreateRecipe: async (req) => {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {

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
                }, { transaction })

                let main_image_url = req.files.filter(x => x.fieldname == 'main_image_url');
                if (main_image_url.length > 0) {
                    createRecipe.main_image_url = main_image_url[0].key;
                    await createRecipe.save({ transaction });
                }
                // CREATE TABLE STEP
                if (typeof req.body.stepcontent == 'string') {
                    let createStep = await db.Step.create({
                        recipe_id: createRecipe.id,
                        number: 1,
                        content: req.body.stepcontent
                    }, { transaction })
                    let listImgae = req.files.filter(x => x.fieldname == `imagestep1`)
                    let numberOfImageEachStep = listImgae.length;
                    let list_key = '';
                    if (numberOfImageEachStep > 0) {
                        for (let i = 0; i < numberOfImageEachStep; i++) {
                            list_key = list_key + ' ' + listImgae[i].key
                        }
                    }
                    createStep.image_url_list = list_key;
                    await createStep.save({ transaction });
                } else {
                    for (let i = 1; i <= req.body.stepcontent.length; i++) {
                        let createStep = await db.Step.create({
                            recipe_id: createRecipe.id,
                            number: i,
                            content: req.body.stepcontent[i - 1]
                        }, { transaction })
                        let listImgae = req.files.filter(x => x.fieldname == `imagestep${i}`)
                        let numberOfImageEachStep = listImgae.length;
                        let list_key = '';
                        if (numberOfImageEachStep > 0) {
                            for (let i = 0; i < numberOfImageEachStep; i++) {
                                list_key = list_key + ' ' + listImgae[i].key
                            }
                        }
                        createStep.image_url_list = list_key;
                        await createStep.save({ transaction });
                    }
                }

                //CREATE TABLE CATEGORY HAS RECIPE
                let category = req.body.category;

                if (typeof req.body.category == 'string') {
                    let category_id = await db.Category.findOne({
                        where: { name: req.body.category }
                    })
                    await db.Category_has_recipe.create({
                        recipe_id: createRecipe.id,
                        category_id: category_id.id,
                    }, { transaction })
                } else {
                    for (let i = 0; i < category.length; i++) {
                        let category_id = await db.Category.findOne({
                            where: { name: category[i] }
                        })
                        await db.Category_has_recipe.create({
                            recipe_id: createRecipe.id,
                            category_id: category_id.id,
                        }, { transaction })
                    }
                }

                //CREATE TABLE INGREDIENT and RECIPE_HAS_INGREDIENT
                let listIngredient = req.body.ingredient;

                if (typeof listIngredient == 'string') {
                    let quantityAndIngredient = listIngredient.toLowerCase().split(' ');
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
                        }, { transaction })
                        let createRecipeHasIngredient = await db.Recipe_has_ingredient.create({
                            recipe_id: createRecipe.id,
                            ingredient_id: createIngredient.id,
                            quantity: quantity
                        }, { transaction })
                    } else {
                        let createRecipeHasIngredient = await db.Recipe_has_ingredient.create({
                            recipe_id: createRecipe.id,
                            ingredient_id: findIngredient.id,
                            quantity: quantity
                        }, { transaction })
                    }
                } else {
                    for (let i = 0; i < listIngredient.length; i++) {
                        let quantityAndIngredient = listIngredient[i].toLowerCase().split(' ');
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
                            }, { transaction })
                            let createRecipeHasIngredient = await db.Recipe_has_ingredient.create({
                                recipe_id: createRecipe.id,
                                ingredient_id: createIngredient.id,
                                quantity: quantity
                            }, { transaction })
                        } else {
                            let createRecipeHasIngredient = await db.Recipe_has_ingredient.create({
                                recipe_id: createRecipe.id,
                                ingredient_id: findIngredient.id,
                                quantity: quantity
                            }, { transaction })
                        }
                    }
                }

                await transaction.commit();
                let recipe = await recipeService.getRecipeById(createRecipe.id);
                return resolve({
                    messageCode: 1,
                    message: 'create recipe success!',
                    data: recipe
                })

            } catch (error) {
                console.log(error)
                await transaction.rollback()
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
                waitRecipe = recipeService.getUrlImageOfArrRecipe(waitRecipe);
                return resolve({
                    messageCode: 1,
                    message: 'get wait recipe success!',
                    waitRecipe,
                })

            } catch (error) {
                console.log(error)
                reject({
                    messageCode: 0,
                    message: 'get wait recipe fail!'
                })
            }
        })
    },
    resolveUpdateRecipe: async (req) => {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                // UPDATE TABLE RECIPE
                let findRecipe = await db.Recipe.findOne({
                    where: {
                        id: req.body.recipe_id,

                        is_allowed: [0, 2]


                    }
                })
                if (!findRecipe) {
                    return resolve({
                        messageCode: 3,
                        message: 'recipe invalid!'
                    })
                }
                // let findLoginInfo = await db.Login_info.findOne({
                //     where: { user_id: req.user.user_id },
                //     raw: true
                // })
                if (req.user.role != 'admin' && findRecipe.owner_id != req.user.user_id) {
                    return resolve({
                        messageCode: 2,
                        message: 'you are not allowed!'
                    })
                }
                findRecipe.title = req.body.title
                findRecipe.short_description = req.body.short_description
                findRecipe.amount_of_people = req.body.amount_of_people
                findRecipe.cooking_time = req.body.cooking_time

                findRecipe.last_update = Date.now()
                findRecipe.update_by = req.user.user_id
                await findRecipe.save({ transaction });

                let main_image_url = req.files.filter(x => x.fieldname == 'main_image_url');
                if (main_image_url.length > 0) {
                    findRecipe.main_image_url = main_image_url[0].key;
                    await findRecipe.save({ transaction });
                }


                // UPDATE TABLE STEP
                let destroyStep = await db.Step.destroy({
                    where: { recipe_id: findRecipe.id, }
                }, { transaction })
                if (typeof req.body.stepcontent == 'string') {
                    let createStep = await db.Step.create({
                        recipe_id: findRecipe.id,
                        number: 1,
                        content: req.body.stepcontent
                    }, { transaction })
                    let listImgae = req.files.filter(x => x.fieldname == `imagestep1`)
                    let numberOfImageEachStep = listImgae.length;
                    let list_key = '';
                    if (numberOfImageEachStep > 0) {
                        for (let i = 0; i < numberOfImageEachStep; i++) {
                            list_key = list_key + ' ' + listImgae[i].key
                        }
                    }
                    createStep.image_url_list = list_key;
                    await createStep.save({ transaction });
                } else {
                    for (let i = 1; i <= req.body.stepcontent.length; i++) {
                        let createStep = await db.Step.create({
                            recipe_id: findRecipe.id,
                            number: i,
                            content: req.body.stepcontent[i - 1]
                        }, { transaction })
                        let listImgae = req.files.filter(x => x.fieldname == `imagestep${i}`)
                        let numberOfImageEachStep = listImgae.length;
                        let list_key = '';
                        if (numberOfImageEachStep > 0) {
                            for (let i = 0; i < numberOfImageEachStep; i++) {
                                list_key = list_key + ' ' + listImgae[i].key
                            }
                        }
                        createStep.image_url_list = list_key;
                        await createStep.save({ transaction });
                    }
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
                }, { transaction })

                let category = req.body.category;

                if (typeof category == 'string') {
                    let category_id = await db.Category.findOne({
                        where: { name: category }
                    })

                    await db.Category_has_recipe.create({
                        recipe_id: findRecipe.id,
                        category_id: category_id.id,
                    }, { transaction })
                } else {
                    for (let i = 0; i < category.length; i++) {
                        let category_id = await db.Category.findOne({
                            where: { name: category[i] }
                        })

                        await db.Category_has_recipe.create({
                            recipe_id: findRecipe.id,
                            category_id: category_id.id,
                        }, { transaction })
                    }
                }

                //UPDATE TABLE INGREDIENT and RECIPE_HAS_INGREDIENT
                await db.Recipe_has_ingredient.destroy({
                    where: { recipe_id: findRecipe.id }
                }, { transaction })
                let listIngredient = req.body.ingredient;
                if (typeof listIngredient == 'string') {
                    let quantityAndIngredient = listIngredient.toLowerCase().split(' ');
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
                        }, { transaction })
                        let createRecipeHasIngredient = await db.Recipe_has_ingredient.create({
                            recipe_id: findRecipe.id,
                            ingredient_id: createIngredient.id,
                            quantity: quantity
                        }, { transaction })
                    } else {
                        let createRecipeHasIngredient = await db.Recipe_has_ingredient.create({
                            recipe_id: findRecipe.id,
                            ingredient_id: findIngredient.id,
                            quantity: quantity
                        }, { transaction })
                    }
                } else {
                    for (let i = 0; i < listIngredient.length; i++) {
                        let quantityAndIngredient = listIngredient[i].toLowerCase().split(' ');
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
                            }, { transaction })
                            let createRecipeHasIngredient = await db.Recipe_has_ingredient.create({
                                recipe_id: findRecipe.id,
                                ingredient_id: createIngredient.id,
                                quantity: quantity
                            }, { transaction })
                        } else {
                            let createRecipeHasIngredient = await db.Recipe_has_ingredient.create({
                                recipe_id: findRecipe.id,
                                ingredient_id: findIngredient.id,
                                quantity: quantity
                            }, { transaction })
                        }
                    }
                }

                await transaction.commit()
                let recipe = await recipeService.getRecipeById(findRecipe.id);
                return resolve({
                    messageCode: 1,
                    message: 'update recipe success!',
                    data: recipe
                })

            } catch (error) {
                console.log(error)
                await transaction.rollback()
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
                if (!findRecipe) {
                    return resolve({
                        messageCode: 3,
                        message: 'recipe not found!'
                    })
                }
                if (findRecipe.owner_id != req.user.user_id && req.user.role != 'admin') {
                    return resolve({
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
                return resolve({
                    messageCode: 1,
                    message: 'delete recipe success!'
                })
            } catch (error) {
                await transaction.rollback();
                console.log(error)
                reject({
                    messageCode: 0,
                    message: 'delete recipe fail!'
                })
            }
        })
    },
    resolveAllowedRecipe: async (req) => {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                let recipe = await db.Recipe.findOne({
                    where: { id: req.body.recipe_id },
                })
                if (!recipe) {
                    return resolve({
                        messageCode: 2,
                        message: 'recipe not found!'
                    })
                }
                recipe.is_allowed = 1
                await recipe.save({ transaction });

                let followUser = await db.Follow.findAll({
                    where: { followed_user_id: recipe.owner_id }
                })
                if (followUser) {
                    for (let i = 0; i < followUser.length; i++) {
                        await db.Notification.create({
                            type: 'đăng bài viết mới',
                            receive_user_id: followUser[i].follow_user_id,
                            recipe_id: recipe.id,
                            create_user_id: recipe.owner_id,
                            create_time: Date.now(),
                            is_viewed: 0
                        }, { transaction })
                    }
                }
                await transaction.commit()
                return resolve({
                    messageCode: 1,
                    message: 'allowed recipe success!'
                })
            } catch (error) {
                await transaction.rollback()
                console.log(error)
                reject({
                    messageCode: 0,
                    message: 'allowed recipe fail!'
                })
            }
        })
    },
    resolveGetCategory: async () => {
        return new Promise(async (resolve, reject) => {
            try {
                let categoryHasGroup = await db.Category_group.findAll({
                    attributes: ['id', 'name'],
                    raw: true
                });
                for (let i = 0; i < categoryHasGroup.length; i++) {
                    const category = await db.Category.findAll({
                        attributes: ['id', 'name'],
                        where: {
                            category_group_id: categoryHasGroup[i].id
                        }
                    })
                    categoryHasGroup[i].category = category
                }
                return resolve({
                    data: categoryHasGroup
                })
            } catch (error) {
                console.log(error);
                reject(error)
            }
        })
    },
    getUrlImageOfArrRecipe: (listRecipe) => {
        if (!listRecipe) return listRecipe;
        let length = listRecipe.length;
        for (let i = 0; i < length; i++) {
            listRecipe[i].main_image_url = getUrlImage(listRecipe[i].main_image_url)
        }
        return listRecipe
    },
    resolveGetRecipeOfCollection: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                const [listRecipe, lrc_metadata] = await db.sequelize.query(
                    `SELECT recipe.* FROM recipe JOIN collection_has_recipe ON recipe.id = collection_has_recipe.recipe_id WHERE collection_has_recipe.collection_id = ${req.query.id};`
                );
                recipeService.getUrlImageOfArrRecipe(listRecipe);
                // if (listRecipe.length != 0) {
                //     const owner_id = await db.Login_info.findOne({
                //         where: { user_id: listRecipe.owner_id }
                //     })
                //     listRecipe.user_name = owner_id.user_name;
                // }
                for (let i = 0; i < listRecipe.length; i++) {
                    const owner_id = await db.Login_info.findOne({
                        where: { user_id: listRecipe[i].owner_id }
                    })
                    listRecipe[i].user_name = owner_id.user_name;
                }
                return resolve({
                    messageCode: 1,
                    message: 'get recipe of collection success!',
                    data: listRecipe
                })
            } catch (error) {
                console.log(error);
                reject({
                    messageCode: 0,
                    message: 'get recipe of collection fail!',
                })
            }
        })
    },
    resolveGetRecipeIngerdient: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let ingerdient = req.query.ingerdient;
                const [listRecipe, lrc_metadata] = await db.sequelize.query(
                    `SELECT * FROM recipe WHERE recipe.id in (SELECT recipe_has_ingredient.recipe_id FROM recipe_has_ingredient WHERE recipe_has_ingredient.ingredient_id IN (SELECT ingredient.id FROM ingredient WHERE ingredient.name = ' ${ingerdient}')) order by recipe.create_time DESC;`
                );
                for (let i = 0; i < listRecipe.length; i++) {
                    const owner_id = await db.Login_info.findOne({
                        where: { user_id: listRecipe[i].owner_id }
                    })
                    listRecipe[i].user_name = owner_id.user_name;
                }
                recipeService.getUrlImageOfArrRecipe(listRecipe);
                return resolve({
                    messageCode: 1,
                    message: 'get recipe of category success!',
                    data: listRecipe
                })

            } catch (error) {
                console.log(error);
                reject({
                    messageCode: 0,
                    message: 'get recipe of category fail!',
                })
            }
        })
    },
    resolveGetListRecipe: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let limit = req.query.limit;
                const [listRecipe, lrc_metadata] = await db.sequelize.query(
                    `select * from recipe order by recipe.create_time DESC limit ${limit};`
                );
                for (let i = 0; i < listRecipe.length; i++) {
                    const owner_id = await db.Login_info.findOne({
                        where: { user_id: listRecipe[i].owner_id }
                    })
                    listRecipe[i].user_name = owner_id.user_name;
                }
                recipeService.getUrlImageOfArrRecipe(listRecipe);
                return resolve({
                    messageCode: 1,
                    message: 'get list recipe success!',
                    data: listRecipe
                })
            } catch (error) {
                console.log(error);
                reject({
                    messageCode: 0,
                    message: 'get list recipe fail!'
                })
            }
        })
    },
    resolveCheckLike: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                var checkLike = await db.Like.findOne({
                    where: {
                        recipe_id: req.query.recipe_id,
                        user_id: req.user.user_id
                    }
                })
                like = 0;
                if (checkLike) {
                    like = 1
                }
                return resolve({
                    messageCode: 1,
                    message: 'check like success!',
                    like
                })

            } catch (error) {
                console.log(error);
                reject({
                    messageCode: 0,
                    message: 'check like fail!',
                })
            }
        })
    },
    resolveGetTopRecipe: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let limit = req.query.limit;
                if (!limit) {
                    limit = 5;
                }
                const [listRecipe, lrc_metadata] = await db.sequelize.query(
                    `select * from recipe order by recipe.total_views DESC limit ${limit};`
                );
                for (let i = 0; i < listRecipe.length; i++) {
                    const owner_id = await db.Login_info.findOne({
                        where: { user_id: listRecipe[i].owner_id }
                    })
                    listRecipe[i].user_name = owner_id.user_name;
                }
                recipeService.getUrlImageOfArrRecipe(listRecipe);
                return resolve({
                    messageCode: 1,
                    message: 'get list recipe success!',
                    data: listRecipe
                })


            } catch (error) {
                console.log(error);
                reject({
                    messageCode: 0,
                    message: 'get list recipe fail!'
                })
            }
        })
    },
    resolveGetTopCollection: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let limit = req.query.limit;
                if (!limit) {
                    limit = 5;
                }
                const [listCollection, lcl_metadata] = await db.sequelize.query(
                    `SELECT *, COUNT(user_save_collection.user_id) AS userSaves FROM collection LEFT JOIN user_save_collection on user_save_collection.collection_id = collection.id GROUP BY user_save_collection.collection_id ORDER BY userSaves DESC LIMIT ${limit};`
                );
                return resolve({
                    messageCode: 1,
                    message: 'get list collection success!',
                    data: listCollection
                })
            } catch (error) {
                reject({
                    messageCode: 1,
                    message: 'get list collection fail!',
                })
            }
        })
    },
    resolveRejectRecipe: async (req) => {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                let queueRecipe = await db.Recipe.findOne({
                    where: {
                        id: req.body.recipe_id,
                        is_allowed: 0
                    }
                })
                if (!queueRecipe) {
                    return resolve({
                        messageCode: 2,
                        message: 'recipe invalid!',
                    })
                } else {
                    queueRecipe.is_allowed = 2;
                    await queueRecipe.save({ transaction });
                    await db.Notification.create({
                        type: 'từ chối bài viết',
                        receive_user_id: queueRecipe.owner_id,
                        recipe_id: queueRecipe.id,
                        create_user_id: req.user.user_id,
                        create_time: Date.now(),
                        is_viewed: 0,
                        reason: req.body.reason
                    }, { transaction })
                    await transaction.commit();
                    return resolve({
                        messageCode: 1,
                        message: 'reject recipe success!',
                    })
                }
            } catch (error) {
                console.log(error)
                await transaction.rollback();
                reject({
                    messageCode: 0,
                    message: 'reject recipe fail!',
                })
            }
        })
    },
    resolveAllRejectRecipe: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let allRejectRecipe = await db.Recipe.findAll({
                    where: {
                        is_allowed: 2
                    },
                    raw: true
                })
                let lengthOfAllRejectRecipe = allRejectRecipe.length;
                for (let i = 0; i < lengthOfAllRejectRecipe; i++) {
                    let [findReason] = await db.sequelize.query(
                        `SELECT * FROM notification WHERE type = 'từ chối bài viết' AND recipe_id = ${allRejectRecipe[i].id}  ORDER BY notification.create_time DESC LIMIT 1`
                    )
                    const owner_id = await db.Login_info.findOne({
                        where: { user_id: allRejectRecipe[i].owner_id }
                    })
                    allRejectRecipe[i].reason = findReason[0].reason
                    allRejectRecipe[i].user_name = owner_id.user_name;
                }

                recipeService.getUrlImageOfArrRecipe(allRejectRecipe);

                return resolve({
                    messageCode: 1,
                    message: 'get all reject recipe success!',
                    data: allRejectRecipe
                })
            } catch (error) {
                console.log(error);
                reject({
                    messageCode: 0,
                    message: 'get all reject recipe fail!',
                })
            }
        })
    },
    resolveMyRejectRecipe: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let myRejectRecipe = await db.Recipe.findAll({
                    where: {
                        owner_id: req.user.user_id,
                        is_allowed: 2
                    },
                    raw: true
                })
                let lengthOfMyRejectRecipe = myRejectRecipe.length;
                for (let i = 0; i < lengthOfMyRejectRecipe; i++) {
                    let [findReason] = await db.sequelize.query(
                        `SELECT * FROM notification WHERE type = 'từ chối bài viết' AND recipe_id = ${myRejectRecipe[i].id}  ORDER BY notification.create_time DESC LIMIT 1`
                    )
                    const owner_id = await db.Login_info.findOne({
                        where: { user_id: myRejectRecipe[i].owner_id }
                    })
                    myRejectRecipe[i].reason = findReason[0].reason
                    myRejectRecipe[i].user_name = owner_id.user_name;
                }
                recipeService.getUrlImageOfArrRecipe(myRejectRecipe);
                return resolve({
                    messageCode: 1,
                    message: 'get my reject recipe success!',
                    data: myRejectRecipe
                })
            } catch (error) {
                console.log(error);
                reject({
                    messageCode: 0,
                    message: 'get my reject recipe fail!',
                })
            }
        })
    },
}

module.exports = recipeService;
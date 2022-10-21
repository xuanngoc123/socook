const {getUrlImage} = require('../config/multer');
const db = require('../models/index');

const interacService = {
  resolveCreateComment: async (req) => {
    return new Promise(async (resolve, reject) => {
      const transaction = await db.sequelize.transaction();
      try {
        let recipe_id = req.body.recipe_id;
        let user_id = req.user.user_id;
        let count = await db.Comment.max('id');
        let findRecipe = await db.Recipe.findOne({
          where: {id: recipe_id},
        });
        if (!findRecipe) {
          return resolve({
            messageCode: 2,
            message: 'recipe not found!',
          });
        }
        let createComment = await db.Comment.create(
          {
            id: count + 1,
            user_id: user_id,
            recipe_id: recipe_id,
            content: req.body.content,
            create_time: Date.now(),
            last_update: Date.now(),
            update_by: user_id,
          },
          {transaction},
        );
        let listImgae = req.files.filter((x) => x.fieldname == 'imagecomment');
        let numberOfImageEachStep = listImgae.length;
        if (numberOfImageEachStep > 0) {
          let list_key = '';
          if (numberOfImageEachStep > 0) {
            for (let i = 0; i < numberOfImageEachStep; i++) {
              list_key = list_key + ' ' + listImgae[i].key;
            }
          }
          createComment.image_url_list = list_key;
          await createComment.save({transaction});
        }
        if (findRecipe.owner_id != req.user.user_id) {
          await db.Notification.create(
            {
              type: 'comment',
              receive_user_id: findRecipe.owner_id,
              recipe_id: findRecipe.id,
              create_user_id: req.user.user_id,
              create_time: Date.now(),
              is_viewed: 0,
            },
            {transaction},
          );
        }
        await transaction.commit();
        return resolve({
          messageCode: 1,
          message: 'create comment success!',
        });
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        reject({
          messageCode: 0,
          message: 'create comment fail!',
        });
      }
    });
  },
  resolveCreateChildComment: async (req) => {
    return new Promise(async (resolve, reject) => {
      const transaction = await db.sequelize.transaction();
      try {
        let createChildComment = await db.Child_comment.create(
          {
            parent_id: req.body.parent_id,
            user_id: req.user.user_id,
            content: req.body.content,
            create_time: Date.now(),
            last_update: Date.now(),
            update_by: req.user.user_id,
          },
          {transaction},
        );
        let findComment = await db.Comment.findOne({
          where: {id: req.body.parent_id},
          raw: true,
        });
        if (req.user.user_id != findComment.user_id) {
          await db.Notification.create(
            {
              type: 'childcomment',
              receive_user_id: findComment.user_id,
              recipe_id: findComment.recipe_id,
              child_comment_id: createChildComment.id,
              comment_id: findComment.id,
              create_user_id: req.user.user_id,
              create_time: Date.now(),
              is_viewed: 0,
            },
            {transaction},
          );
        }
        await transaction.commit();
        return resolve({
          messageCode: 1,
          message: 'create child comment success!',
        });
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        reject({
          messageCode: 0,
          message: 'create child comment fail!',
        });
      }
    });
  },
  resolveUpdateComment: async (req) => {
    return new Promise(async (resolve, reject) => {
      const transaction = await db.sequelize.transaction();
      try {
        let findComment = await db.Comment.findOne({
          where: {id: req.body.id},
        });
        if (findComment.user_id != req.user.user_id) {
          return resolve({
            messageCode: 2,
            message: 'you are not allowed!',
          });
        }
        let listImgae = req.files.filter((x) => x.fieldname == 'imagecomment');
        let numberOfImageEachStep = listImgae.length;
        findComment.content = req.body.content;
        if (numberOfImageEachStep > 0) {
          let list_key = '';
          if (numberOfImageEachStep > 0) {
            for (let i = 0; i < numberOfImageEachStep; i++) {
              list_key = list_key + ' ' + listImgae[i].key;
            }
          }
          findComment.image_url_list = list_key;
        }
        await findComment.save({transaction});
        await transaction.commit();
        return resolve({
          messageCode: 1,
          message: 'update your comment success!',
        });
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        reject({
          messageCode: 0,
          message: 'update your comment fail!',
        });
      }
    });
  },
  resolveUpdateChildComment: async (req) => {
    return new Promise(async (resolve, reject) => {
      const transaction = await db.sequelize.transaction();
      try {
        let findChildComment = await db.Child_comment.findOne({
          where: {id: req.body.child_comment_id},
        });
        if (!findChildComment) {
          return resolve({
            messageCode: 3,
            message: 'child comment not found!',
          });
        }
        if (findChildComment.user_id != req.user.user_id) {
          return resolve({
            messageCode: 2,
            message: 'you are not allowed!',
          });
        }
        findChildComment.content = req.body.content;
        findChildComment.last_update = Date.now();
        await findChildComment.save({transaction});
        await transaction.commit();
        return resolve({
          messageCode: 1,
          message: 'update your child comment success!',
        });
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        reject({
          messageCode: 0,
          message: 'update your child comment fail!',
        });
      }
    });
  },
  resolveDeleteComment: async (req) => {
    return new Promise(async (resolve, reject) => {
      const transaction = await db.sequelize.transaction();
      try {
        let findComment = await db.Comment.findOne({
          where: {id: req.query.id},
        });
        if (!findComment) {
          return resolve({
            messageCode: 3,
            message: 'comment not found!',
          });
        }
        if (req.user.user_id != findComment.user_id && req.user.role != 'admin') {
          return resolve({
            messageCode: 2,
            message: 'you are not allowed!',
          });
        }
        // var transaction = await db.sequelize.transaction();

        await db.Child_comment.destroy(
          {
            where: {parent_id: req.query.id},
          },
          {transaction: transaction},
        );
        await db.Comment.destroy(
          {
            where: {id: req.query.id},
          },
          {transaction: transaction},
        );
        await transaction.commit();
        return resolve({
          messageCode: 1,
          message: 'delete your comment success!',
        });
      } catch (error) {
        await transaction.rollback();
        console.log(error);
        reject({
          messageCode: 0,
          message: 'delete your comment fail!',
        });
      }
    });
  },
  resolveDeleteChildComment: async (req) => {
    return new Promise(async (resolve, reject) => {
      const transaction = await db.sequelize.transaction();
      try {
        let findChildComment = await db.Child_comment.findOne({
          where: {id: req.query.id},
        });
        if (!findChildComment) {
          return resolve({
            messageCode: 3,
            message: 'child comment not found!',
          });
        }
        if (req.user.user_id != findChildComment.user_id && req.user.role != 'admin') {
          return resolve({
            messageCode: 2,
            message: 'you are not allowed!',
          });
        }
        await db.Child_comment.destroy(
          {
            where: {id: req.query.id},
          },
          {transaction},
        );
        await transaction.commit();
        return resolve({
          messageCode: 1,
          message: 'delete your child comment success!',
        });
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        reject({
          messageCode: 0,
          message: 'delete your child comment fail!',
        });
      }
    });
  },
  resolveGetHistoryComment: async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        let findMyComment = await db.Comment.findAll({
          where: {user_id: req.user.user_id},
          raw: true,
        });
        let lengthComment = findMyComment.length;
        for (let i = 0; i < lengthComment; i++) {
          let findRecipe = await db.Recipe.findOne({
            where: {
              id: findMyComment[i].recipe_id,
            },
            raw: true,
          });
          findMyComment[i].title = findRecipe.title;
          findMyComment[i].main_image_url = getUrlImage(findRecipe.main_image_url);
        }

        return resolve({
          messageCode: 1,
          message: 'get history comment success!',
          data: findMyComment,
        });
      } catch (error) {
        console.log(error);
        reject({
          messageCode: 0,
          message: 'get history comment fail!',
        });
      }
    });
  },
  resolveLikeRecipe: async (req) => {
    return new Promise(async (resolve, reject) => {
      const transaction = await db.sequelize.transaction();
      try {
        let findRecipe = await db.Recipe.findOne({
          where: {
            id: req.body.recipe_id,
          },
          raw: true,
        });
        if (!findRecipe) {
          return resolve({
            messageCode: 3,
            message: 'recipe not found!',
          });
        } else {
          let find = await db.Like.findOne({
            where: {
              user_id: req.user.user_id,
              recipe_id: req.body.recipe_id,
            },
          });
          if (!find) {
            await db.Like.create(
              {
                user_id: req.user.user_id,
                recipe_id: req.body.recipe_id,
              },
              {transaction},
            );
            if (findRecipe.owner_id != req.user.user_id) {
              await db.Notification.create(
                {
                  type: 'like',
                  receive_user_id: findRecipe.owner_id,
                  recipe_id: findRecipe.id,
                  create_user_id: req.user.user_id,
                  create_time: Date.now(),
                  is_viewed: 0,
                },
                {transaction},
              );
            }
            await transaction.commit();
            return resolve({
              messageCode: 1,
              message: 'like success!',
            });
          } else {
            return resolve({
              messageCode: 2,
              message: 'you were liked!',
            });
          }
        }
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        reject({
          messageCode: 0,
          message: 'like fail!',
        });
      }
    });
  },
  resolveDisLikeRecipe: async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        let findRecipe = await db.Recipe.findOne({
          where: {
            id: req.body.recipe_id,
          },
        });
        if (!findRecipe) {
          return resolve({
            messageCode: 3,
            message: 'recipe not found!',
          });
        } else {
          let find = await db.Like.findOne({
            where: {
              user_id: req.user.user_id,
              recipe_id: req.body.recipe_id,
            },
          });
          if (find) {
            let destroyLike = await db.Like.destroy({
              where: {
                user_id: req.user.user_id,
                recipe_id: req.body.recipe_id,
              },
            });
            return resolve({
              messageCode: 1,
              message: 'dislike success!',
            });
          } else {
            return resolve({
              messageCode: 2,
              message: 'you have not liked!',
            });
          }
        }
      } catch (error) {
        console.log(error);
        reject({
          messageCode: 0,
          message: 'dislike fail!',
        });
      }
    });
  },
  resolveGetRecipeLiked: async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        let findLike = await db.Like.findAll({
          where: {user_id: req.user.user_id},
          attributes: ['recipe_id'],
          raw: true,
        });
        let arr = [];
        for (let i = 0; i < findLike.length; i++) {
          arr.push(findLike[i].recipe_id);
        }
        let findRecipeLiked = await db.Recipe.findAll({
          where: {
            id: arr,
          },
        });
        return resolve({
          messageCode: 1,
          message: 'get recipe liked success!',
          data: findRecipeLiked,
        });
      } catch (error) {
        console.log(error);
        reject({
          messageCode: 0,
          message: 'get recipe liked fail!',
        });
      }
    });
  },
  resolveFollowUser: async (req) => {
    return new Promise(async (resolve, reject) => {
      const transaction = await db.sequelize.transaction();
      try {
        let findFollow = await db.Follow.findOne({
          where: {
            followed_user_id: req.body.followed_user_id,
            follow_user_id: req.user.user_id,
          },
        });
        if (findFollow) {
          return resolve({
            messageCode: 2,
            message: 'you followed user!',
          });
        } else {
          await db.Follow.create(
            {
              followed_user_id: req.body.followed_user_id,
              follow_user_id: req.user.user_id,
              create_time: Date.now(),
            },
            {transaction: transaction},
          );

          await db.Notification.create(
            {
              type: 'follow',
              receive_user_id: req.body.followed_user_id,
              create_user_id: req.user.user_id,
              create_time: Date.now(),
              is_viewed: 0,
            },
            {transaction: transaction},
          );

          await transaction.commit();
          return resolve({
            messageCode: 1,
            message: 'follow success!',
          });
        }
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        reject({
          messageCode: 0,
          message: 'follow fail!',
        });
      }
    });
  },
  resolveUnFollowUser: async (req) => {
    return new Promise(async (resolve, reject) => {
      const transaction = await db.sequelize.transaction();
      try {
        let findFollow = await db.Follow.findOne({
          where: {
            followed_user_id: req.body.followed_user_id,
            follow_user_id: req.user.user_id,
          },
        });
        if (!findFollow) {
          return resolve({
            messageCode: 2,
            message: 'you have not followed user!',
          });
        } else {
          let destroyFollow = await db.Follow.destroy(
            {
              where: {
                followed_user_id: req.body.followed_user_id,
                follow_user_id: req.user.user_id,
              },
            },
            {transaction: transaction},
          );

          await transaction.commit();
          return resolve({
            messageCode: 1,
            message: 'unfollow success!',
          });
        }
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        reject({
          messageCode: 0,
          message: 'unfollow fail!',
        });
      }
    });
  },
  resolveGetNotification: async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        let getMyNotification = await db.Notification.findAll({
          where: {receive_user_id: req.user.user_id},
          raw: true,
        });
        if (getMyNotification) {
          for (let i = 0; i < getMyNotification.length; i++) {
            let findUserCreateNotifi = await db.Login_info.findOne({
              where: {user_id: getMyNotification[i].create_user_id},
            });
            let infoUser = await db.User.findOne({
              where: {user_id: getMyNotification[i].create_user_id},
            });
            getMyNotification[i].avatar_image = getUrlImage(infoUser.avatar_image);
            getMyNotification[i].create_user_name = findUserCreateNotifi?.user_name;
          }
        }
        return resolve({
          messageCode: 1,
          message: 'get notification success!',
          data: getMyNotification,
        });
      } catch (error) {
        console.log(error);
        reject({
          messageCode: 0,
          message: 'get notification fail!',
        });
      }
    });
  },
  resolveLikeComment: async (req) => {
    return new Promise(async (resolve, reject) => {
      const transaction = await db.sequelize.transaction();
      try {
        let findComment = await db.Comment.findOne({
          where: {
            id: req.body.comment_id,
          },
          raw: true,
        });
        if (!findComment) {
          return resolve({
            messageCode: 3,
            message: 'comment not found!',
          });
        } else {
          let userLikeComment = await db.User_like_comment.findOne({
            where: {
              user_id: req.user.user_id,
              comment_id: req.body.comment_id,
            },
          });
          let findRecipe = await db.Recipe.findOne({
            where: {
              id: findComment.recipe_id,
            },
          });
          if (userLikeComment) {
            return resolve({
              messageCode: 2,
              message: 'you were liked!',
            });
          } else {
            await db.User_like_comment.create(
              {
                user_id: req.user.user_id,
                comment_id: req.body.comment_id,
              },
              {transaction},
            );
            if (findComment.user_id != req.user.user_id) {
              await db.Notification.create(
                {
                  type: 'likeComment',
                  receive_user_id: findComment.user_id,
                  recipe_id: findRecipe.id,
                  create_user_id: req.user.user_id,
                  comment_id: findComment.id,
                  create_time: Date.now(),
                  is_viewed: 0,
                },
                {transaction},
              );
            }
            await transaction.commit();
            return resolve({
              messageCode: 1,
              message: 'like success!',
            });
          }
        }
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        reject({
          messageCode: 0,
          message: 'like fail!',
        });
      }
    });
  },
  resolveDislikeComment: async (req) => {
    return new Promise(async (resolve, reject) => {
      const transaction = await db.sequelize.transaction();
      try {
        let findComment = await db.Comment.findOne({
          where: {
            id: req.body.comment_id,
          },
          raw: true,
        });
        if (!findComment) {
          return resolve({
            messageCode: 3,
            message: 'comment not found!',
          });
        } else {
          let userLikeComment = await db.User_like_comment.findOne({
            where: {
              user_id: req.user.user_id,
              comment_id: req.body.comment_id,
            },
          });
          if (userLikeComment) {
            await db.User_like_comment.destroy(
              {
                where: {
                  user_id: req.user.user_id,
                  comment_id: req.body.comment_id,
                },
              },
              {transaction},
            );
            await transaction.commit();
            return resolve({
              messageCode: 1,
              message: 'dislike success!',
            });
          } else {
            return resolve({
              messageCode: 2,
              message: 'you have not liked!',
            });
          }
        }
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        reject({
          messageCode: 0,
          message: 'dislike fail!',
        });
      }
    });
  },
  resolveUpdateNotification: async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        let findNotification = await db.Notification.findOne({
          where: {
            id: req.body.id,
          },
        });
        if (!findNotification) {
          return resolve({
            messageCode: 2,
            message: 'notification not found!',
          });
        } else {
          if (findNotification.receive_user_id != req.user.user_id) {
            return resolve({
              messageCode: 3,
              message: 'you are not allowed!',
            });
          } else {
            findNotification.is_viewed = 1;
            await findNotification.save();
            return resolve({
              messageCode: 1,
              message: 'update notification success!',
            });
          }
        }
      } catch (error) {
        console.log(error);
        reject({
          messageCode: 0,
          message: 'update notification fail!',
        });
      }
    });
  },
  resolveUpdateAllNotification: async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        let findAllNotification = await db.Notification.findAll({
          where: {
            receive_user_id: req.user.user_id,
            is_viewed: 0,
          },
        });
        let notificationLength = findAllNotification.length;
        if (notificationLength == 0) {
          return resolve({
            messageCode: 2,
            message: 'no unseen notifications!',
          });
        }
        if (notificationLength > 0) {
          for (let i = 0; i < notificationLength; i++) {
            findAllNotification[i].is_viewed = 1;
            await findAllNotification[i].save();
          }

          return resolve({
            messageCode: 1,
            message: 'update all notification success!',
          });
        }
      } catch (error) {
        console.log(error);
        reject({
          messageCode: 0,
          message: 'update all notification fail!',
        });
      }
    });
  },
};

module.exports = interacService;

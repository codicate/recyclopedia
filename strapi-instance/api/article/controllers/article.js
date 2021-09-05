'use strict';
const { sanitizeEntity, parseMultipartData } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async findOneByName(context) {
        const {id} = context.params;
        const entity = await strapi.services.article.findOne({ name: id });

        return sanitizeEntity(entity, { model: strapi.models.article });
    },
    async addCommentByName(context) {
        const {id} = context.params;

        if (!context.is('multipart')) {
            const commentData = context.request.body;
            const newComment = await strapi.services.comment.create(commentData);
            const santiziedComment = sanitizeEntity(newComment, { model: strapi.models.comment });
            console.log(santiziedComment);

            const original = await this.findOneByName(context);
            original.comments = original.comments.concat(santiziedComment);

            const newArticleResult = await strapi.services.article.update({ name: id }, original);
            console.log(newArticleResult);
            return sanitizeEntity(newArticleResult, { model: strapi.models.article });
        }

        return {};
    }
};

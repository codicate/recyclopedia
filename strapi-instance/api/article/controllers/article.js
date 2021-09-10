'use strict';
const { sanitizeEntity, parseMultipartData } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

function findExistingVoteByUser(votes, user) {
    if (!votes) {
        return undefined;
    }

    for (let index = 0; index < votes.length; ++index) {
        if (user.id, votes[index].user) {
            return index;
        }
    }

    return undefined;
}

module.exports = {
    async create(context) {
        if (!context.is('multipart')) {
            const articleData = context.request.body;
            const existingArticle = await strapi.services.article.findOne({ name: articleData.name });

            if (existingArticle) {
                const updatedArticle = await strapi.services.article.update(
                    {
                        name: articleData.name
                    },
                    {
                        ... existingArticle,
                        content: articleData.content,
                    }
                );
                return sanitizeEntity(updatedArticle, { model: strapi.models.article });
            } else {
                const newArticle = await strapi.services.article.create(articleData);
                return sanitizeEntity(newArticle) ;
            }
        }
    },

    async findOneByName(context) {
        const {id} = context.params;
        const entity = await strapi.services.article.findOne({ name: id });

        return sanitizeEntity(entity, { model: strapi.models.article });
    },

    async addCommentByName(context) {
        const {id} = context.params;

        if (!context.is('multipart')) {
            const commentData      = context.request.body;
            const newComment       = await strapi.services.comment.create(commentData);
            const santiziedComment = sanitizeEntity(newComment, { model: strapi.models.comment });

            const original = await this.findOneByName(context);
            original.comments = original.comments.concat(santiziedComment);

            const newArticleResult = await strapi.services.article.update({ name: id }, original);
            return sanitizeEntity(newArticleResult, { model: strapi.models.article });
        }

        return {};
    },

    async voteByName(context) {
        const original = await this.findOneByName(context);
        const {id} = context.params;

        if (!context.is('multipart')) {
            const voteData      = context.request.body;

            let existingVoteId = findExistingVoteByUser(original.votes, voteData.user);
            if (existingVoteId !== undefined) {
                const voteId       = original.votes[existingVoteId].id;
                const originalVote = await strapi.query('vote').findOne({id: voteId});
                if (originalVote.type === voteData.type) {
                    originalVote.type = "none";
                } else {
                    originalVote.type = voteData.type;
                }

                await strapi.services.vote.update({id: voteId}, originalVote);
            } else {
                const newVote = await strapi.services.vote.create(voteData);
                const sanitizedVote = sanitizeEntity(newVote, { model: strapi.models.vote });

                if (!original.votes) {
                    original.votes = [];
                }

                original.votes = original.votes.concat(sanitizedVote);
            }

            const newArticleResult = await strapi.services.article.update({ name: id }, original);
            return sanitizeEntity(newArticleResult, { model: strapi.models.article });
        }

        return {};
    }
};

'use strict';
const { sanitizeEntity, parseMultipartData, VALID_REST_OPERATORS } = require('strapi-utils');

/*
    NOTE(jerry):
        While recycled articles may and should be separate at scale, for now
        for simplicity of implementation since I have school tomorrow lol, I'm
        going to "fatten" the article like previously, and keep it in the same collection.

        It isn't particularly too difficult to migrate into a separate collection and as far as
        the app is concerned, this difference doesn't exist, so feel free to fix this when not lazy.

    NOTE(jerry):
        All API routes will explicitly not search for recycled articles by default
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
        let entity;

        const proposedName = id.replace(/_+/g, " ");
        console.log("rp: ", id, proposedName);
        entity = await strapi.services.article.findOne({ name: proposedName });

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
    },

    async deleteByName(context) {
        const {id} = context.params;

        if (!context.is('multipart')) {
            const original = await this.findOneByName(context);

            if (!original.recycled) {
                original.recycled = true;
                original.daysUntilDeletion = 30;

                const sanitized = sanitizeEntity(original, { model: strapi.models.article });
                await strapi.services.article.update({ name: id }, sanitized);

                return sanitized;
            } else {
                await strapi.query('article').delete({name: original.name});
            }
        }

        return {};
    },

    async findPublished(context) {
        const articles = await strapi.services.article.find();
        return articles.filter(
            ({recycled}) => !recycled
        );
    },

    async findRecycled(context) {
        const articles = await strapi.services.article.find();
        return articles.filter(
            ({recycled}) => recycled
        );
    },

    async restoreByName(context) {
        console.log(context);
        const original = await this.findOneByName(context);

        console.log("restore me!");
        if (!context.is('multipart')) {
            original.recycled = false;
            original.daysUntilDeletion = 0;

            const newArticleResult = await strapi.services.article.update({ name: original.name }, original);
            console.log(original, newArticleResult);
            return sanitizeEntity(newArticleResult, { model: strapi.models.article });
        }

        return {};
    }
};

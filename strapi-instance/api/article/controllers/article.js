'use strict';
const { sanitizeEntity, parseMultipartData } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

function sameUser(userA, userB) {
    if (userA.username === userB.username && userA.email === userB.email) {
        return true;
    }

    return false;
}
function findExistingVoteByUser(votes, user) {
    if (!votes) {
        return undefined;
    }

    for (let index = 0; index < votes.length; ++index) {
        if (sameUser(user, votes[index].user)) {
            return index;
        }
    }

    return undefined;
}

module.exports = {
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
            console.log(santiziedComment);

            const original = await this.findOneByName(context);
            original.comments = original.comments.concat(santiziedComment);

            const newArticleResult = await strapi.services.article.update({ name: id }, original);
            console.log(newArticleResult);
            return sanitizeEntity(newArticleResult, { model: strapi.models.article });
        }

        return {};
    },

    async voteByName(context) {
        const original = await this.findOneByName(context);
        const {id} = context.params;

        if (!context.is('multipart')) {
            const voteData      = context.request.body;
            console.log(voteData.user);

            let existingVoteId = findExistingVoteByUser(original.votes, voteData.user);
            if (existingVoteId !== undefined) {
                if (original.votes[existingVoteId].type === voteData.type) {
                    original.votes[existingVoteId].type = "none";
                } else {
                    original.votes[existingVoteId].type = voteData.type;
                }
            } else {
                const newVote = await strapi.services.vote.create(voteData);
                const sanitizedVote = sanitizeEntity(newVote, { model: strapi.models.vote });

                if (!original.votes) {
                    original.votes = [];
                }

                original.votes = original.votes.concat(sanitizedVote);
            }


            const newArticleResult = await strapi.services.article.update({ name: id }, original);
            console.log(newArticleResult);
            return sanitizeEntity(newArticleResult, { model: strapi.models.article });
        }

        return {};
    }
};

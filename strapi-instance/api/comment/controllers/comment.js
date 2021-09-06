'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

// copied from `/controllers/article.js`
// coalasce this somewhere.
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

// as extremely evident...
// this is copied and pasted from `/controllers/article.js` because
// they work identically.
module.exports = {
	async vote(context) {
		const {id} = context.params;
		console.log(id);
		const original = await strapi.query('comment').findOne({id});

		if (!context.is("multipart")) {
			const voteData = context.request.body;
			console.log(voteData.user);

			let existingVoteId = findExistingVoteByUser(original.votes, voteData.user);

			if (existingVoteId !== undefined) {
				const voteId = original.votes[existingVoteId].id;
				const originalVote = await strapi.query('vote').findOne({ id: voteId });
				if (originalVote.type === voteData.type) {
					originalVote.type = "none";
				} else {
					originalVote.type = voteData.type;
				}
				console.log("change vote");

				await strapi.services.vote.update({ id: voteId }, originalVote);
			} else {
				const newVote = await strapi.services.vote.create(voteData);
				const sanitizedVote = sanitizeEntity(newVote, { model: strapi.models.vote });

				if (!original.votes) {
					original.votes = [];
				}

				original.votes = original.votes.concat(sanitizedVote);
			}

			const newArticleResult = await strapi.services.comment.update({ id }, original);
			return sanitizeEntity(newArticleResult, { model: strapi.models.article });
		}

		return {};
	}
};

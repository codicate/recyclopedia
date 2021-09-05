'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async findOneByName(context) {
        const {id} = context.params;
        const entity = await strapi.services.article.findOne({ name: id });

        console.log(entity);

        return sanitizeEntity(entity, { model: strapi.models.article });
    }
};

const { body } = require('express-validator');

// Validation rules for creating or updating a sale (auction or private sale)
exports.validateSale = (method) => {
    switch (method) {
        case 'createSale': {
            return [
                body('title', 'Title is required').exists().isString().trim().isLength({ min: 3 }),
                body('titleEN', 'TitleEN is required').exists().isString().trim().isLength({ min: 3 }),
                body('description', 'Description is required').exists().isString().trim().isLength({ max: 300 }),
                body('descriptionEN', 'DescriptionEN is required').exists().isString().trim().isLength({ max: 300 }),
                body('picture', 'Picture is required').optional().isString().trim(),
                body('saleType', 'SaleType is required and should be either auction or private_sale').exists().isIn(['auction', 'private_sale']),
                body().custom((value, { req }) => {
                    if (req.body.saleType === 'auction') {
                        // Validate fields specific to auctions
                        if (!req.body.start || !req.body.end || !req.body.commission) {
                            throw new Error('Start, end, and commission are required for auctions');
                        }
                    } else if (req.body.saleType === 'private_sale') {
                        // Validate fields specific to private sales
                        if (!req.body.subtitle) {
                            throw new Error('Subtitle is required for private sales');
                        }
                    }
                    return true;
                })
            ];
        }
        case 'updateSale': {
            return [
                body('title', 'Title is required').optional().isString().trim().isLength({ min: 3 }),
                body('titleEN', 'TitleEN is required').optional().isString().trim().isLength({ min: 3 }),
                body('description', 'Description is required').optional().isString().trim().isLength({ max: 300 }),
                body('descriptionEN', 'DescriptionEN is required').optional().isString().trim().isLength({ max: 300 }),
                body('picture', 'Picture is required').optional().isString().trim(),
               // body('saleType', 'SaleType is required and should be either auction or private_sale').optional().isIn(['auction', 'private_sale']),
                body().custom((value, { req }) => {
                    if (req.body.saleType === 'auction') {
                        // Validate fields specific to auctions
                        if (!req.body.start || !req.body.end || !req.body.commission) {
                            throw new Error('Start, end, and commission are required for auctions');
                        }
                    } else if (req.body.saleType === 'private_sale') {
                        // Validate fields specific to private sales
                        if (!req.body.subtitle) {
                            throw new Error('Subtitle is required for private sales');
                        }
                    }
                    return true;
                })
            ];
        }
        default:
            return [];
    }
};

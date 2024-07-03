const mongoose = require('mongoose');
const { isDate } = require('validator');

const auctionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            minLength: 3,
            trim: true
        },
        titleEN: {
            type: String,
            required: true,
            minLength: 3,
            trim: true
        },
        subtitle: {
            type: String,
            minLength: 3,
            trim: true,
            validate: {
                validator: function (value) {
                    return this.saleType === 'private_sale' ? value && value.length >= 3 : true;
                },
                message: 'Subtitle is required and should be at least 3 characters for private sales.'
            }
        },
        start: {
            type: Date,
            validate: [isDate, 'Invalid start date'],
            required: function () {
                return this.saleType === 'auction';
            },
        },
        end: {
            type: Date,
            validate: [isDate, 'Invalid end date'],
            required: function () {
                return this.saleType === 'auction';
            },
        },
        commission: {
            type: String,
            required: function () {
                return this.saleType === 'auction';
            },
        },
        picture: {
            type: String,
            //required: true,
        },
        description: {
            type: String,
            required: true,
            maxLength: 300,
            trim: true
        },
        descriptionEN: {
            type: String,
            required: true,
            maxLength: 300,
            trim: true
        },
        catalogue: {
            type: [String],
        },
        closed: {
            type: Boolean,
            required: true,
        },
        sales: {
            type: [String]
        },
        saleType: {
            type: String,
            enum: ['auction', 'private_sale'],
            default: 'auction' // Default value is auction
        }
    },
    {
        timestamps: true,
    }
);

const AuctionModel = mongoose.model('auction', auctionSchema);

module.exports = AuctionModel;

const AuctionModel = require("../models/auction.model");
const { LotModel } = require("../models/lot.model");
const { SaleModel } = require("../models/sale.model");
const { UserModel } = require("../models/user.model");

module.exports.createSale = async (userId, lot, bid) => {
    const user = await UserModel.findById(userId);
    if (user === null) throw new Error('User not found');

    if (bid === null) throw new Error('Bid not found');

    try {
        const body = {
            userId: user._id,
            lot: lot,
            bid: bid,
        }
        const sale = await SaleModel.create(body);
        const auction = await AuctionModel.findById(lot.auction);
        auction.sales.push(sale._id);
        await auction.save();
    } catch (err) {
        console.log(err);
        throw new Error(err);
    }
}

module.exports.generateSalesOfAuction = async (auction) => {
    try{
        auction.catalogue.forEach(async (lotId) => {
            const lot = await LotModel.findById(lotId);
            if (lot.lastBid) {
                await this.createSale(lot.lastBid.bidderId, lot, lot.lastBid)
            }
        })
    } catch(err) {
        console.log(err);
        throw new Error(err);
    }
}


module.exports.getSales = async (req, res) => {
    try {
        const sales = await SaleModel.find().select('-__v -updatedAt');
        res.status(200).json(sales);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

module.exports.getNumSaleSameDay = async (req, res) => {
    try {
        const thisSale = await SaleModel.findById(req.params.id);
        const sales = await SaleModel.find({ updatedAt: { $eq: thisSale.updatedAt } });
        var numSaleToday = 0;
        sales.slice().forEach((sale) => {
            numSaleToday++;
        })
        res.status(200).json(numSaleToday);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}
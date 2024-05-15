const AuctionModel = require('../models/auction.model');
const { LotModel } = require('../models/lot.model');
const ObjectID = require('mongoose').Types.ObjectId;
const moment = require('moment');
const fs = require('fs')
const path = require('path');
const saleController = require('./sale.controller');
const { SaleModel } = require('../models/sale.model');
const { UserModel } = require('../models/user.model');
const { BidModel } = require('../models/bid.model');


module.exports.createAuction = async (req, res) => {
    try {
        const newAuction = new AuctionModel(req.body);
        newAuction.closed = false;

        if (req.file) {
            newAuction.picture = req.file.path.split("uploads/").pop();
        }

        await newAuction.save();
        res.status(201).json("Auction created");
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err)
    }
}

module.exports.getAuctions = async (req, res) => {
    try {
        const auctions = await AuctionModel.find().select('-updatedAt -__v');
        res.status(200).json(auctions);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}


module.exports.getAuction = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) // Test si l'id est connu
        return res.status(400).json('ID unknown : ' + req.params.id)

    try {
        const auction = await AuctionModel.findById(req.params.id).select('-createdAt -updatedAt -__v');
        res.status(200).json(auction);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}


module.exports.auctionLots = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) // Test si l'id est connu
        return res.status(400).json('ID unknown : ' + req.params.id)

    try {
        const auction = await AuctionModel.findById(req.params.id);

        if (auction) {
            if (auction.catalogue.length === 0) return res.status(204).json()
            var lots = [];
            var index = 0;
            auction.catalogue.forEach(async (lotId) => {
                const lot = await LotModel.findById(lotId);
                index++;
                lots.push(lot);
                if (index === auction.catalogue.length) {
                    res.status(200).json(lots)
                }
            })
        } else {
            res.status(204).json();
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}


module.exports.updateAuction = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).json('ID unknown : ' + req.params.id);

    try {
        const auction = await AuctionModel.findById(req.params.id);
        auction.title = req.body.title;
        auction.titleEN = req.body.titleEN;
        auction.start = req.body.start;
        auction.end = req.body.end;
        auction.commission = req.body.commission;
        auction.description = req.body.description;
        auction.descriptionEN = req.body.descriptionEN;

        if (req.file) {
            if (auction.picture) {
                fs.unlinkSync('uploads/' + auction.picture);
            }
            auction.picture = req.file.path.split("uploads/").pop();
        }

        await auction.save();

        auction.catalogue.forEach((lotId) => {
            LotModel.findById(lotId)
                .then((lot) => {
                    lot.start = req.body.start;
                    lot.end = moment(req.body.end).add(2 * (lot.number - 1), 'minutes');
                    lot.save();
                })
        })

        res.status(200).json("Auction : '" + req.params.id + "' Successfully updated.")
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};


module.exports.deleteAuction = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) // Test si l'id est connu
        return res.status(400).json('ID unknown : ' + req.params.id);

    try {
        const auction = await AuctionModel.findById(req.params.id);
        auction.catalogue.forEach(async (lotId) => {
            const lot = await LotModel.findByIdAndDelete(lotId);
            // TODO: SUPPRIMER DOCUMENTS DU LOT
            if (lot) {
                // Suppression des enchères et des ventes si il y en a
                const bids = await BidModel.find({ lotId: lotId });
                if (bids.length > 0) {
                    bids.forEach(async (bid) => {
                        await BidModel.findByIdAndDelete(bid._id);
                    })
                    await SaleModel.deleteOne({ 'lot._id': lotId });
                }

                // Supression dans les favoris 
                const followers = await UserModel.find({ followedLot: { $eq: lot._id } });
                if (followers.length > 0) {
                    followers.forEach(async (follower) => {
                        follower.followedLot = follower.followedLot.filter((lot) => lot !== lotId);
                        await follower.save();
                    })
                }
            }
        });
        if (auction.picture) {
            fs.unlink(`uploads/${auction.picture}`, (err) => {
                if (err) throw err;
            });
        }
        auction.delete();
        res.status(200).json("Auction : '" + req.params.id + "' Successfully deleted.")
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}


module.exports.currentAuctionWithLots = async (req, res) => {
    try {
        const auctions = await AuctionModel.find({ closed: false });

        const sortedAuctions = auctions.sort((a, b) => moment(a.start).diff(moment(b.start)));
        const currentAuction = sortedAuctions[0];

        if (currentAuction) {
            var lots = [];
            var i = 0;
            while (i < currentAuction.catalogue.length) {
                await LotModel.findById(currentAuction.catalogue[i])
                    .then((lot) => {
                        lots.push(lot);
                        i++;
                    })
            }
            res.status(200).json({ currentAuction, lots });
        } else { res.status(204).json()}
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

module.exports.closeAuction = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) // Test si l'id est connu
        return res.status(400).json('ID auction unknown : ' + req.params.id);

    try {
        const auction = await AuctionModel.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { closed: true } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        )

        if (auction === null) {
            res.status(404).json("Auction not found");
        }

        const dir = path.join(__dirname, '..', 'uploads', 'billings');
        fs.mkdir(path.join(dir, auction._id.toString()), { recursive: true }, async (err) => {
            if (!err) {
               await saleController.generateSalesOfAuction(auction)
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}


module.exports.getAllAuctionsWithSales = async (req, res) => {
    try {
        const auctions = await AuctionModel.find();
        var auctionsWithSales = [];
        var index = 0;
        var sales = [];
        while (index < auctions.length) {
            sales = await getSalesAuctionWithUser(auctions[index])
            auctionsWithSales.push({ auction: auctions[index], sales: sales });
            index++;
        }
        res.status(200).json(auctionsWithSales);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

}

getSalesAuctionWithUser = async (auction) => {
    if (auction.sales !== undefined) {
        if (auction.sales.length) {
            var index = 0;
            var sales = [];
            var saleId;
            while (index < auction.sales.length) {
                saleId = auction.sales[index];
                await SaleModel.findById(saleId)
                    .then(async (sale) => {
                        await UserModel.findById(sale.userId)
                            .then((user) => {
                                sales.push({
                                    sale: sale,
                                    user: user,
                                })
                                index++;
                            })
                            .catch((err) => console.log(err))
                    })
                    .catch((err) => console.log(err))
            }
            return sales;
        }
        return [];
    }
    return [];
}

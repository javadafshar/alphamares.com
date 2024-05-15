//const { io } = require('../server');  Import io instance
const {io} = require ('../server')
const AuctionModel = require('../models/auction.model');
const {
    BidModel
} = require('../models/bid.model');
const {
    LotModel
} = require('../models/lot.model');
const {
    UserModel
} = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;
const moment = require('moment');



module.exports.createBid = async (req, res) => {
    async function saveBid(user, lot, auction, bidData) {
        try {
            bidData.lotInfos = `Lot ${lot.number} - ${lot.title}`;
            bidData.auctionInfos = auction.title;
            const bid = new BidModel(bidData);
            await bid.save();
            user.bids.push(bid._id);
            lot.lastBid = bid;
            lot.bids.push(bid);

            // If within the last 5 minutes of the auction, extend it by 3 minutes
            if (2 > moment(lot.end).diff(moment(), 'minutes')) {
                lot.end = moment(lot.end).add(3, 'minutes');
            }
            await lot.save();
            await user.save();

            io.emit('dataSaved'); // Emit the event
            res.status(201).json("Bid created");
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: err });
        }
    }

    function isValidBid(lot, amount) {
        if (lot.lastBid === undefined) {
            const basePrice = lot.price;
            if (basePrice < 1000) return (amount - basePrice) % 100 === 0;
            if (basePrice >= 1000 && basePrice < 20000) return (amount - basePrice) % 500 === 0;
            if (basePrice >= 20000 && basePrice < 50000) return (amount - basePrice) % 1000 === 0;
            if (basePrice >= 50000) return (amount - basePrice) % 2000 === 0;
        } else {
            const lastBidAmount = lot.lastBid.amount;
            if (lastBidAmount < 1000) return (amount - lastBidAmount) % 100 === 0;
            if (lastBidAmount >= 1000 && lastBidAmount < 20000) return (amount - lastBidAmount) % 500 === 0;
            if (lastBidAmount >= 20000 && lastBidAmount < 50000) return (amount - lastBidAmount) % 1000 === 0;
            if (lastBidAmount >= 50000) return (amount - lastBidAmount) % 2000 === 0;
        }
        return false;
    }

    try {
        const { bidderId, lotId, auctionId, amount } = req.body;
        const user = await UserModel.findById(bidderId);
        const lot = await LotModel.findById(lotId);
        const auction = await AuctionModel.findById(auctionId);

        if (!user || !lot || !auction) {
            return res.status(404).json("User, Lot or Auction not found");
        }

        if (!user.verified) {
            return res.status(403).json("Unverified account");
        }

        if (moment(lot.end).isBefore()) {
            return res.status(400).send("Lot closed");
        }

        if (!isValidBid(lot, amount)) {
            return res.status(400).json("Invalid bid");
        }

        saveBid(user, lot, auction, req.body);
    } catch (err) {
        console.log(err);
        res.status(500).send({ err });
    }
}


module.exports.getBids = async (req, res) => {
    try {
        const bids = await BidModel.find();
        res.status(200).json(bids);
    } catch (err) {
        console.log(err);
        res.status(500).send({
            err
        });
    }
}



module.exports.getBid = (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id)

    try {
        const bid = BidModel.findById(req.params.id);
        res.status(200).json(bid);
    } catch (err) {
        console.log(err);
        res.status(500).send({
            err
        });
    }
}

module.exports.deleteBid = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id);

    try {
        const bid = await BidModel.findByIdAndDelete(req.params.id) // Remove and return
        const lot = await LotModel.findById(bid.lotId)
        const user = await UserModel.findById(bid.bidderId)

        // Replace the last bid in lot
        lot.lastBid = lot.bids[lot.bids.length - 2];
        // Remove the last bidId in lot
        lot.bids.pop();

        // Remove the bidId in bids of the user
        user.bids = user.bids.filter(bidId => bidId != req.params.id);
        user.save();

        lot.save();

        res.status(200).json({
            message: "Bid : '" + req.params.id + "' Successfully deleted. "
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err
        });
    }
}
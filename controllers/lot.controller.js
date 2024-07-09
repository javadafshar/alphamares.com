const { LotModel } = require('../models/lot.model');
const { SaleModel } = require('../models/sale.model');
const { UserModel } = require('../models/user.model');
const AuctionModel = require('../models/auction.model');
const ObjectID = require('mongoose').Types.ObjectId;
const moment = require('moment');
const fs = require('fs');
const { BidModel } = require('../models/bid.model');


module.exports.createLot = async (req, res) => {
    try {
        const newLot = new LotModel(req.body);
        newLot.closed = false;
        newLot.candidacyAccepted = true;

        // Handle file uploads
        if (req.files['pictures']) {
            const pictures = req.files['pictures'];
            pictures.forEach(function (picture) {
                newLot.pictures.push(picture.path.replace('\\', '/').split("uploads/").pop());
            });
        }
        if (req.files['pictureMother']) {
            const pictureMother = req.files['pictureMother'][0];
            newLot.pictureMother = pictureMother.path.replace('\\', '/').split("uploads/").pop();
        }
        if (req.files['pictureFather']) {
            const pictureFather = req.files['pictureFather'][0];
            newLot.pictureFather = pictureFather.path.replace('\\', '/').split("uploads/").pop();
        }
        if (req.files['veterinaryDocuments']) {
            const veterinaryDocuments = req.files['veterinaryDocuments'];
            veterinaryDocuments.forEach(function (doc) {
                newLot.veterinaryDocuments.push(doc.path.replace('\\', '/').split("uploads/").pop());
            });
        }
        if (req.files['blackType']) {
            const blackType = req.files['blackType'][0];
            newLot.blackType = blackType.path.replace('\\', '/').split("uploads/").pop();
        }

        // Get auction details and set lot times
        const auction = await AuctionModel.findById(newLot.auction);
        const defaultEndTime = moment().add(1, 'day'); // Default end time if invalid

        // Validate auction dates
        const auctionStart = auction && moment(auction.start).isValid() ? auction.start : moment().toDate();
        const auctionEnd = auction && moment(auction.end).isValid() ? auction.end : defaultEndTime;

        newLot.start = auctionStart;
        newLot.end = moment(auctionEnd).add(2 * (newLot.number - 1), 'minutes').toDate();

        // Update lots numbers
        if (auction) {
            auction.catalogue.forEach(async (lotId) => {
                const lot = await LotModel.findById(lotId);
                if (lot.number >= newLot.number) {
                    lot.number += 1;
                    lot.end = moment(auctionEnd).add(2 * (lot.number - 1), 'minutes').toDate();
                    await lot.save();
                }
            });
        }

        await newLot.save();
        await AuctionModel.findByIdAndUpdate(
            newLot.auction,
            { $addToSet: { catalogue: newLot._id.toString() } },
            { new: true, upsert: true }
        );

        res.status(201).json("Lot created");
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};


module.exports.getLots = async (req, res) => {
    try {
        const lots = await LotModel.find().sort({ createdAt: -1 });
        res.status(200).json(lots)
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}


module.exports.getLot = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).json('ID unknown : ' + req.params.id + "Return")

    try {
        const lot = await LotModel.findById(req.params.id);
        res.status(200).json(lot);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

// module.exports.lotAndAuction = async (req, res) => {
//     if (!ObjectID.isValid(req.params.id))
//         return res.status(400).json('ID unknown : ' + req.params.id)

//     try {
//         const lot = await LotModel.findById(req.params.id);
//         const auction = await AuctionModel.findById(lot.auction);
//         res.status(200).json({ lot, auction });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json(err);
//     }
// }


module.exports.updateLot = async (req, res) => {
    const { id } = req.params;

    /* if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid lot ID.' });
    } */

    try {
        const lot = await LotModel.findById(id);
        if (!lot) {
            return res.status(404).json({ message: 'Lot not found.' });
        }

        // Check if auction exists
        const auction = await AuctionModel.findById(lot.auction);
        if (!auction) {
            return res.status(404).json({ message: 'Associated auction not found.' });
        }

        const { saleType } = auction;

        // Update lot fields
        lot.number = req.body.number;
        lot.title = req.body.title;
        lot.titleEN = req.body.titleEN;
        lot.type = req.body.type;
        lot.sexe = req.body.sexe;
        lot.location = req.body.location;
        lot.reproduction = req.body.reproduction;
        lot.sellerNationality = req.body.sellerNationality;
        lot.sellerType = req.body.sellerType;
        lot.pedigree.gen1.father = req.body["pedigree.gen1.father"];
        lot.pedigree.gen1.mother = req.body["pedigree.gen1.mother"];
        lot.pedigree.gen2.GFPaternal = req.body["pedigree.gen2.GFPaternal"];
        lot.pedigree.gen2.GMPaternal = req.body["pedigree.gen2.GMPaternal"];
        lot.pedigree.gen2.GFMaternal = req.body["pedigree.gen2.GFMaternal"];
        lot.pedigree.gen2.GMMaternal = req.body["pedigree.gen2.GMMaternal"];
        lot.pedigree.gen3.GGFPF = req.body["pedigree.gen3.GGFPF"];
        lot.pedigree.gen3.GGMPF = req.body["pedigree.gen3.GGMPF"];
        lot.pedigree.gen3.GGFPM = req.body["pedigree.gen3.GGFPM"];
        lot.pedigree.gen3.GGMPM = req.body["pedigree.gen3.GGMPM"];
        lot.pedigree.gen3.GGFMF = req.body["pedigree.gen3.GGFMF"];
        lot.pedigree.gen3.GGMMF = req.body["pedigree.gen3.GGMMF"];
        lot.pedigree.gen3.GGFMM = req.body["pedigree.gen3.GGFMM"];
        lot.pedigree.gen3.GGMMM = req.body["pedigree.gen3.GGMMM"];
        lot.dueDate = req.body.dueDate;
        lot.birthDate = req.body.birthDate;
        lot.race = req.body.race;
        lot.size = req.body.size;
        lot.productionDate = req.body.productionDate;
        lot.carrierSize = req.body.carrierSize;
        lot.carrierAge = req.body.carrierAge;
        lot.bondCarrier = req.body.bondCarrier;
        lot.carrierForSale = req.body.carrierForSale;
        lot.fatherFoal = req.body.fatherFoal;
        lot.commentFR = req.body.commentFR;
        lot.commentEN = req.body.commentEN;
        lot.video = req.body.video;

        // Update price only if auction saleType is 'auction'
        if (saleType === 'auction') {
            lot.price = req.body.price;
            lot.tva = req.body.tva;
        }

        // Handle file uploads
        if (req.files['pictures']) {
            // Delete old pictures if they exist
            if (lot.pictures.length > 0) {
                lot.pictures.forEach(picture => fs.unlinkSync('uploads/' + picture));
                lot.pictures = [];
            }

            // Add new pictures
            const pictures = req.files['pictures'];
            pictures.forEach(picture => {
                lot.pictures.push(picture.path.replace('\\', '/').split('uploads/').pop());
            });
        }

        // Handle other file uploads similarly (pictureMother, pictureFather, veterinaryDocuments, blackType)

        // Save updated lot
        await lot.save();

        // Success response
        res.status(200).json({ message: `Lot ${id} updated successfully.` });
    } catch (error) {
        console.error('Error updating lot:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


module.exports.deleteLot = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).json('ID unknown : ' + req.params.id);

    try {
        const lotId = req.params.id;
        const lot = await LotModel.findByIdAndDelete(lotId);
        if (lot) {

            // Mise à jour de l'enchère
            const auction = await AuctionModel.findById(lot.auction);
            auction.catalogue = auction.catalogue.filter((lot) => lot !== lotId);
            auction.save();

            // Décalage des numéro des lots
            const lotsAfter = await LotModel.find({ auction: auction._id, number: { $gt: lot.number } });
            lotsAfter.forEach(async (lotAfter) => {
                lotAfter.number = lotAfter.number - 1;
                await lotAfter.save();
            })

            // Suppression des enchères et des ventes si il y en a
            const bids = await BidModel.find({ lotId: lotId });
            if (bids.length > 0) {
                bids.forEach(async (bid) => await BidModel.findByIdAndDelete(bid._id))
                await SaleModel.deleteOne({ 'lot._id': lotId });
            }

            // Supression dans les favoris 
            const followers = await UserModel.find({ followedLot: { $elemMatch: { $eq: lot._id } } });
            if (followers) {
                followers.forEach(async (follower) => {
                    follower.followedLot = follower.followedLot.filter((lot) => lot !== lotId);
                    await follower.save();
                })
            }

            // Suppression des fichiers
            deleteFilesOfLot(lot);
            res.status(200).json("Lot : '" + req.params.id + "' Successfully deleted.")
        }

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}


module.exports.extend = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).json('ID unknown : ' + req.params.id);

    try {
        const lot = await LotModel.findById(req.params.id)
        lot.end = moment(lot.end).add(req.body.extendOf, 'minutes')
        lot.save()
        res.status(200).json();
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

const deleteFilesOfLot = (lot) => {
    try {
        if (lot.pictures[0]) {
            lot.pictures.forEach((picture) => fs.unlinkSync('uploads/' + picture))
        }
        if (lot.pictureMother) {
            fs.unlinkSync('uploads/' + lot.pictureMother);
        }
        if (lot.pictureFather) {
            fs.unlinkSync('uploads/' + lot.pictureFather);
        }
        if (lot.veterinaryDocuments[0]) {
            lot.veterinaryDocuments.forEach((doc) => fs.unlinkSync('uploads/' + doc))
        }
        if (lot.blackType) {
            fs.unlinkSync('uploads/' + lot.blackType);
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports.deleteFilesOfLot = deleteFilesOfLot;
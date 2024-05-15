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

        if (req.files['pictures']) {
            const pictures = req.files['pictures'];
            pictures.forEach(function (picture) {
                newLot.pictures.push(picture.path.replace('\\','/').split("uploads/").pop());
            })
        }
        if (req.files['pictureMother']) {
            const pictureMother = req.files['pictureMother'][0];
            newLot.pictureMother = pictureMother.path.replace('\\','/').split("uploads/").pop();
        }
        if (req.files['pictureFather']) {
            const pictureFather = req.files['pictureFather'][0];
            newLot.pictureFather = pictureFather.path.replace('\\','/').split("uploads/").pop();
        }
        if (req.files['veterinaryDocuments']) {
            const veterinaryDocuments = req.files['veterinaryDocuments'];
            veterinaryDocuments.forEach(function (doc) {
                newLot.veterinaryDocuments.push(doc.path.replace('\\','/').split("uploads/").pop());
            })
        }
        if (req.files['blackType']) {
            const blackType = req.files['blackType'][0];
            newLot.blackType = blackType.path.replace('\\','/').split("uploads/").pop();
        }

        // Update lots numbers
        const auction = await AuctionModel.findById(newLot.auction);
        newLot.start = auction.start;
        newLot.end = moment(auction.end).add(2 * (newLot.number - 1), 'minutes');
        auction.catalogue.forEach(async (lotId) => {
            const lot = await LotModel.findById(lotId);
            if (lot.number >= newLot.number) {
                lot.number += 1;
                lot.end = moment(auction.end).add(2 * (lot.number - 1), 'minutes');
                lot.save();
            }
        })

        await newLot.save();
        await AuctionModel.findByIdAndUpdate(newLot.auction,
            { $addToSet: { catalogue: newLot._id.toString() } },
            { new: true, upsert: true }
        )
        res.status(201).json("Lot created")
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}


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
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).json('ID unknown : ' + req.params.id);

    try {
        const lot = await LotModel.findById(req.params.id);
        const oldNumber = lot.number;
        const newNumber = req.body.number;
        if (newNumber !== oldNumber) {
            lot.number = newNumber;
            const auction = await AuctionModel.findById(lot.auction);
            auction.catalogue.forEach(async (lotId) => {
                const otherLot = await LotModel.findById(lotId);
                if (otherLot.number <= newNumber && otherLot.number > oldNumber) {
                    otherLot.number -= 1;
                    otherLot.end = moment(auction.end).add(2 * (otherLot.number - 1), 'minutes');
                    otherLot.save();
                }
                if (otherLot.number >= newNumber && otherLot.number < oldNumber) {
                    otherLot.number += 1;
                    otherLot.end = moment(auction.end).add(2 * (otherLot.number - 1), 'minutes');
                    otherLot.save();
                }
            })
        }
        lot.name = req.body.name;
        lot.title = req.body.title;
        lot.titleEN = req.body.titleEN;
        lot.name = req.body.name;
        lot.type = req.body.type;
        lot.race = req.body.race;
        lot.sexe = req.body.sexe;
        lot.location = req.body.location;
        lot.price = req.body.price;
        lot.tva = req.body.tva;
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
        lot.reproduction = req.body.reproduction;
        lot.sellerNationality = req.body.sellerNationality;
        lot.sellerType = req.body.sellerType;
        lot.dueDate = req.body.dueDate;
        lot.birthDate = req.body.birthDate;
        lot.productionDate = req.body.productionDate;
        lot.size = req.body.size;
        lot.carrierSize = req.body.carrierSize;
        lot.carrierAge = req.body.carrierAge;
        lot.bondCarrier = req.body.bondCarrier;
        lot.carrierForSale = req.body.carrierForSale;
        lot.fatherFoal = req.body.fatherFoal;
        lot.commentFR = req.body.commentFR;
        lot.commentEN = req.body.commentEN;
        lot.video = req.body.video;


        if (req.files['pictures']) {
            if (lot.pictures[0]) {
                lot.pictures.forEach((picture) => fs.unlinkSync('uploads/' + picture))
                lot.pictures = [];
            }
            const pictures = req.files['pictures'];
            pictures.forEach((picture) => lot.pictures.push(picture.path.replace('\\','/').split("uploads/").pop()))
        }
        if (req.files['pictureMother']) {
            if (lot.pictureMother) {
                fs.unlinkSync('uploads/' + lot.pictureMother);
            }
            const pictureMother = req.files['pictureMother'][0];
            lot.pictureMother = pictureMother.path.replace('\\','/').split("uploads/").pop();
        }
        if (req.files['pictureFather']) {
            if (lot.pictureFather) {
                fs.unlinkSync('uploads/' + lot.pictureFather);
            }
            const pictureFather = req.files['pictureFather'][0];
            lot.pictureFather = pictureFather.path.replace('\\','/').split("uploads/").pop();
        }
        if (req.files['veterinaryDocuments']) {
            if (lot.veterinaryDocuments[0]) {
                lot.veterinaryDocuments.forEach((doc) => fs.unlinkSync('uploads/' + doc))
                lot.veterinaryDocuments = [];
            }
            const veterinaryDocuments = req.files['veterinaryDocuments'];
            veterinaryDocuments.forEach((doc) => lot.veterinaryDocuments.push(doc.path.replace('\\','/').split("uploads/").pop()))
        }

        if (req.files['blackType']) {
            if (lot.blackType) {
                fs.unlinkSync('uploads/' + lot.blackType);
            }
            const blackType = req.files['blackType'][0];
            lot.blackType = blackType.path.replace('\\','/').split("uploads/").pop();
        }
        await lot.save();
        res.status(200).json("Lot : '" + req.params.id + "' Successfully updated.")
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
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
const AuctionModel = require("../models/auction.model");
const { LotModel } = require("../models/lot.model");
const { SaleModel } = require("../models/sale.model");
const { UserModel } = require("../models/user.model");
const { BidModel } = require("../models/bid.model");
const ObjectID = require("mongoose").Types.ObjectId;
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const saleController = require("./sale.controller");

// Function to create a new auction or private sale
module.exports.createAuction = async (req, res) => {
  try {
    const {
      title,
      titleEN,
      subtitle,
      description,
      descriptionEN,
      saleType,
      start,
      end,
      commission,
    } = req.body;

    // Create auction object based on sale type
    const auctionData = {
      title,
      titleEN,
      description,
      descriptionEN,
      saleType,
      closed: false, // Assuming new auctions are not closed
    };

    if (saleType === "auction") {
      auctionData.start = start;
      auctionData.end = end;
      auctionData.commission = commission;
    } else if (saleType === "private_sale") {
      auctionData.subtitle = subtitle;
    }

    if (req.file) {
      auctionData.picture = req.file.path; // Adjust based on your file handling setup
    }

    const newAuction = new AuctionModel(auctionData);
    await newAuction.save();
    res.status(201).json({ message: "Auction created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Function to get all auctions
module.exports.getAuctions = async (req, res) => {
  try {
    const auctions = await AuctionModel.find().select("-updatedAt -__v");
    res.status(200).json(auctions);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

// Function to get a specific auction by ID
module.exports.getAuction = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    // Check if the ID is valid
    return res.status(400).json("ID unknown : " + req.params.id);

  try {
    const auction = await AuctionModel.findById(req.params.id).select(
      "-createdAt -updatedAt -__v"
    );
    res.status(200).json(auction);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

// Function to get lots associated with an auction
module.exports.auctionLots = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    // Check if the ID is valid
    return res.status(400).json("ID unknown : " + req.params.id);

  try {
    const auction = await AuctionModel.findById(req.params.id);

    if (auction) {
      if (auction.catalogue.length === 0) return res.status(204).json();

      const lots = await LotModel.find({ _id: { $in: auction.catalogue } });
      res.status(200).json(lots);
    } else {
      res.status(204).json();
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

// Function to update an auction or private sale
module.exports.updateAuction = async (req, res) => {
  const { id } = req.params;
  const { saleType, title, titleEN, subtitle, description, descriptionEN, start, end, commission } = req.body;

  try {
    if (!ObjectID.isValid(id)) {
      return res.status(400).json({ message: "Invalid auction ID." });
    }

    let auction = await AuctionModel.findById(id);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found." });
    }

    // Update fields based on saleType
    if (saleType === "auction") {
      if (!title || !titleEN || !description || !descriptionEN || !start || !end || !commission) {
        return res.status(400).json({ message: "All fields are required for updating auction." });
      }

      auction.title = title;
      auction.titleEN = titleEN;
      auction.description = description;
      auction.descriptionEN = descriptionEN;
      auction.start = start;
      auction.end = end;
      auction.commission = commission;
    } else if (saleType === "private_sale") {
      if (!title || !titleEN || !subtitle || !description || !descriptionEN) {
        return res.status(400).json({ message: "All fields are required for updating private sale." });
      }

      auction.title = title;
      auction.titleEN = titleEN;
      auction.subtitle = subtitle;
      auction.description = description;
      auction.descriptionEN = descriptionEN;
      auction.start = null;
      auction.end = null;
      auction.commission = null;
    } else {
      return res.status(400).json({ message: "Invalid saleType specified." });
    }

    // Handle picture update if available
    if (req.file) {
      if (auction.picture) {
        fs.unlinkSync(path.join(__dirname, "..", "uploads", "auctionPictures", auction.picture));
      }
      auction.picture = req.file.path; // Assuming correct path handling
    }

    await auction.save();
    res.status(200).json({ message: "Auction updated successfully.", auction });
  } catch (err) {
    console.error("Error updating auction:", err);
    res.status(500).json({ message: "Internal server error.", error: err.message });
  }
};


// Function to delete an auction and its associated lots, bids, and sales
const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    }
  });
};
module.exports.deleteAuction = async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).json("ID unknown : " + req.params.id);
  }

  try {
    const auction = await AuctionModel.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found." });
    }

    await Promise.all(
      auction.catalogue.map(async (lotId) => {
        const lot = await LotModel.findByIdAndDelete(lotId);
        if (lot) {
          const bids = await BidModel.find({ lotId: lotId });
          await Promise.all(
            bids.map(async (bid) => {
              await BidModel.findByIdAndDelete(bid._id);
            })
          );

          const sales = await SaleModel.find({ "lot._id": lotId });
          await Promise.all(
            sales.map(async (sale) => {
              await SaleModel.findByIdAndDelete(sale._id);
            })
          );

          const followers = await UserModel.find({
            followedLot: { $eq: lotId },
          });
          await Promise.all(
            followers.map(async (follower) => {
              follower.followedLot = follower.followedLot.filter(
                (lot) => lot !== lotId
              );
              await follower.save();
            })
          );
        }
      })
    );

    if (auction.picture) {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        "auctionPictures",
        auction.picture
      );
      deleteFile(filePath);
    }

    await auction.delete();
    res.status(200).json(`Auction '${req.params.id}' successfully deleted.`);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

// Function to fetch the current auction with associated lots
module.exports.currentAuctionWithLots = async (req, res) => {
  try {
    const auctions = await AuctionModel.find({ closed: false });

    const sortedAuctions = auctions.sort((a, b) =>
      moment(a.start).diff(moment(b.start))
    );
    const currentAuction = sortedAuctions[0];

    if (currentAuction) {
      const lots = await LotModel.find({
        _id: { $in: currentAuction.catalogue },
      });
      res.status(200).json({ currentAuction, lots });
    } else {
      res.status(204).json();
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

// Function to close an auction
module.exports.closeAuction = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    // Check if the ID is valid
    return res.status(400).json("ID auction unknown : " + req.params.id);

  try {
    const auction = await AuctionModel.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { closed: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!auction) {
      res.status(404).json("Auction not found");
    }

    const dir = path.join(__dirname, "..", "uploads", "billings");
    fs.mkdir(
      path.join(dir, auction._id.toString()),
      { recursive: true },
      async (err) => {
        if (!err) {
          await saleController.generateSalesOfAuction(auction);
        }
      }
    );

    res.status(200).json({ message: "Auction closed successfully.", auction });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

// Function to fetch all auctions with associated sales and users
module.exports.getAllAuctionsWithSales = async (req, res) => {
  try {
    const auctions = await AuctionModel.find();
    const auctionsWithSales = [];

    for (let i = 0; i < auctions.length; i++) {
      const sales = await getSalesAuctionWithUser(auctions[i]);
      auctionsWithSales.push({ auction: auctions[i], sales });
    }

    res.status(200).json(auctionsWithSales);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

// Helper function to fetch sales associated with an auction along with user details
async function getSalesAuctionWithUser(auction) {
  try {
    const sales = [];
    for (let i = 0; i < auction.sales.length; i++) {
      const saleId = auction.sales[i];
      const sale = await SaleModel.findById(saleId);
      if (sale) {
        const user = await UserModel.findById(sale.userId);
        sales.push({ sale, user });
      }
    }
    return sales;
  } catch (err) {
    console.log(err);
    return [];
  }
}

const { UserModel } = require("../models/user.model");
const { LotModel } = require("../models/lot.model");
const { BidModel } = require("../models/bid.model");
const AuctionModel = require("../models/auction.model");
const { SaleModel } = require("../models/sale.model");
const bcrypt = require("bcrypt");
const ObjectID = require("mongoose").Types.ObjectId;


module.exports.getUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};


module.exports.getUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    const user = await UserModel.findById(req.params.id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};


module.exports.updateUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    if (req.body.password !== undefined) {
      const salt = await bcrypt.genSalt(); // 'salage' du mot de passe
      await bcrypt
        .hash(req.body.password, salt)
        .then(async (passwordCrypted) => {
          await UserModel.findOneAndUpdate(
            { _id: req.params.id },
            {
              $set: {
                name: req.body.name,
                surname: req.body.surname,
                email: req.body.email,
                password: passwordCrypted,
                phoneNumber: req.body.phoneNumber,
                adress: req.body.adress,
                adressCity: req.body.adressCity,
                adressCountry: req.body.adressCountry,
                gender: req.body.gender,
                language: req.body.language,
                birthDate: req.body.birthDate,
                type: req.body.type,
                job: req.body.job,
                tvaNumber: req.body.tvaNumber,
                companyName: req.body.companyName,
              },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
          )
            .then(() => res.status(200).json('User updated'))
            .catch((err) => res.status(500).send({ message: err }));
        });
    } else {
      await UserModel.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            password: this.password,
            phoneNumber: req.body.phoneNumber,
            adress: req.body.adress,
            adressCity: req.body.adressCity,
            adressCountry: req.body.adressCountry,
            gender: req.body.gender,
            language: req.body.language,
            birthDate: req.body.birthDate,
            type: req.body.type,
            job: req.body.job,
            tvaNumber: req.body.tvaNumber,
            companyName: req.body.companyName,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )
        .then(() => res.status(200).json('User updated'))
        .catch((err) => res.status(500).send({ message: err }));
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};


module.exports.deleteUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    await UserModel.deleteOne({ _id: req.params.id }).exec();
    res.status(200).json({
      message: "User : '" + req.params.id + "' Successfully deleted. ",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};


module.exports.followLot = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  if (!ObjectID.isValid(req.body.idToFollow))
    return res.status(400).send("ID to follow unknown : " + req.body.idToFollow);

  try {
    // Ajoute à la liste followedLot
    await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { followedLot: req.body.idToFollow } },
      { new: true, upsert: true }
    )
    // Ajoute aux followers du lot
    await LotModel.findByIdAndUpdate(
      req.body.idToFollow,
      { $addToSet: { followers: req.params.id } },
      { new: true, upsert: true }
    )
    res.status(200).json("Lot followed");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};


exports.unfollowLot = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  if (!ObjectID.isValid(req.body.idToUnFollow))
    return res.status(400).send("ID to unfollow unknown : " + req.body.idToUnFollow);

  try {
    // Retire de la liste followedLot
    await UserModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { followedLot: req.body.idToUnFollow } },
      { new: true, upsert: true }
    )
    // Retire aux followers du lots
    await LotModel.findByIdAndUpdate(
      req.body.idToUnFollow,
      { $pull: { followers: req.params.id } },
      { new: true, upsert: true }
    )
    res.status(200).json("Lot unfollowed");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

module.exports.followedLots = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    const user = await UserModel.findById(req.params.id)
    var lots = [];
    if (user.followedLot.length > 0) {
      var index = 0;
      user.followedLot.forEach(async (lotId) => {
        const lot = await LotModel.findById(lotId);
        index++;
        lots.push(lot);
        if (index === user.followedLot.length) {
          res.status(200).json(lots);
        }
      });
    } else {
      res.status(200).json(lots);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
};

module.exports.followedLotsInfos = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    const user = await UserModel.findById(req.params.id)
    var lots = [];
    if (user.followedLot.length > 0) {
      var index = 0;
      user.followedLot.forEach(async (lotId) => {
        const lot = await LotModel.findById(lotId);
        if (lot) {
          const auction = await AuctionModel.findById(lot.auction);
          lots.push({ lot, auction });
        }
        index++;
        if (index === user.followedLot.length) {
          res.status(200).json(lots);
        }
      })
    } else {
      res.status(200).json(lots);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
};

module.exports.bids = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    const user = await UserModel.findById(req.params.id)
    var bids = [];
    if (user.bids.length > 0) {
      var index = 0;
      user.bids.forEach(async (bidId) => {
        const bid = await BidModel.findById(bidId);
        if (bid) {
          const win = await SaleModel.findOne({ "bid._id": bid._id });
          if (win) {
            bids.push({ ...bid._doc, win: true });
          } else {
            bids.push(bid);
          }
        }
        index++;
        if (index === user.bids.length) {
          return res.status(200).json(bids);
        }
      })
    } else {
      res.status(200).json(bids);
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err });
  }
};

module.exports.receiveBill = async (req, res) => {
  if (!ObjectID.isValid(req.body.saleId))
    return res.status(400).send("ID unknown : " + req.body.saleId);

  try {
    const sale = await SaleModel.findByIdAndUpdate(
      { _id: req.body.saleId },
      {
        $set: {
          bill: req.file.path.split("uploads/").pop(),
          isBillSent: true,
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    await UserModel.findByIdAndUpdate(
      { _id: req.body.userId },
      { $push: { previousSales: sale._id } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    res.status(200).json("Bill received")
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err });
  }
};

module.exports.modifyBill = async (req, res) => {
  if (!ObjectID.isValid(req.body.saleId))
    return res.status(400).send("ID unknown : " + req.body.saleId);

  try {
    await SaleModel.findByIdAndUpdate(
      { _id: req.body.saleId },
      { $set: { bill: req.file.path.split("uploads/").pop() } },
      { setDefaultsOnInsert: true }
    )
    res.status(200).json("Bill modified")
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err });
  }

};

module.exports.getSales = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    const user = await UserModel.findById(req.params.id);
    var sales = [];
    if (user.previousSales.length > 0) {
      var index = 0;
      user.previousSales.forEach(async (saleId) => {
        const sale = await SaleModel.findById(saleId);
        index++;
        sales.push(sale);
        if (index === user.previousSales.length) {
          return res.status(200).json(sales);
        }
      })
    } else {
      res.status(200).json(sales);
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err });
  }
};

module.exports.updateBlocked = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { blocked: req.body.blocked } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    res.status(200).json("User updated");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

module.exports.verifyUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { verified: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    res.status(200).json("User verified");
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

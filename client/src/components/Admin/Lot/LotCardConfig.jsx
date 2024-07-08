import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import { Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { isEmbryo, isEmpty, numberWithPoint } from "../../../utils/Utils";
import moment from "moment";
import { useTranslation } from "react-i18next";
import FollowLotHandler from "../../Auction/FollowLotHandler";
import UpdateLot from "./UpdateLot";
import EditIcon from "@mui/icons-material/Edit";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import axios from "axios";
import { Chrono, whenFunction } from "../../Chrono";

function LotCardConfig(props) {
  const [openLot, setOpenLot] = useState(false);
  const lot = props.lot;
  const auction = props.auction;
  const [extendOf, setExtendOf] = useState(0);

  const [t, i18n] = useTranslation();

  const handleClickLot = (event) => {
    event.preventDefault();
    setOpenLot(true);
  };

  const handleClose = () => {
    if (openLot) setOpenLot(false);
  };

  async function extendTime() {
    if (extendOf > 0) {
      if (moment(lot.end).isAfter()) {
        await axios
          .put(
            `${process.env.REACT_APP_API_URL}api/lot/extend/${props.lot._id}`,
            { extendOf: extendOf }
          )
          .then(() => alert(`Lot ${lot.number} : rallongé de ${extendOf}min.`))
          .catch((err) => console.log(err.message));
      } else
        alert(`Lot ${lot.number} déjà cloturé, impossible de le rallonger.`);
    }
    setExtendOf(0);
  }

  async function deleteLot() {
    await axios
      .delete(`${process.env.REACT_APP_API_URL}api/lot/${lot._id}`)
      .then(() => props.fetchLots())
      .catch((err) => console.log(err.message));
  }

  const [when, setWhen] = useState();

  useEffect(() => {
    if (lot) {
      const interval = setInterval(() => {
        setWhen(whenFunction(lot.start, lot.end));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lot]);

  return (
    <div className="card">
      {!isEmpty(lot) && (
        <div>
          <Card>
            {isEmbryo(lot) && (
              <CardMedia>
                <div className="split-image-container">
                  <img
                    src={`${process.env.REACT_APP_API_URL}uploads/${lot.pictureFather}`}
                    alt="Father"
                    className="left"
                  />
                  <img
                    src={`${process.env.REACT_APP_API_URL}uploads/${lot.pictureMother}`}
                    alt="Mother"
                    className="right"
                  />
                  <div>
                    <div className="border" />
                  </div>
                </div>
                <FollowLotHandler lotId={lot._id} />
              </CardMedia>
            )}
            {!isEmbryo(lot) && (
              <CardMedia>
                <div>
                  <img
                    src={`${process.env.REACT_APP_API_URL}${lot.pictures[0]}`}
                    alt="Lot"
                  />
                </div>
                <FollowLotHandler lotId={lot._id} />
              </CardMedia>
            )}
            <div className="parents-or-name">
              {isEmbryo(lot) ? (
                <>
                  {" "}
                  <p>{lot.pedigree.gen1.father}</p> X{" "}
                  <p>{lot.pedigree.gen1.mother}</p>
                </>
              ) : (
                <p>{lot.name}</p>
              )}
            </div>
            <CardContent>
              <h2>
                Lot {lot.number} - {t("Lot." + lot.type)}
              </h2>
              <hr />
              <h1>{i18n.language === "fr-FR" ? lot.title : lot.titleEN}</h1>
              <hr />
              <h2>
                {lot.pedigree.gen1.father} X {lot.pedigree.gen2.GFMaternal}
              </h2>
              <br />
              {when === "now" && (
                <div className="chrono-price">
                  <h1 style={{ textAlign: "" }}>
                    <Chrono start={lot.start} end={lot.end} />
                  </h1>
                  <div className="">|</div>
                  {isEmpty(lot.lastBid) ? (
                    <h1>{numberWithPoint(lot.price)} €</h1>
                  ) : (
                    <h1>{numberWithPoint(lot.lastBid.amount)}€</h1>
                  )}
                </div>
              )}
            </CardContent>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5%",
                width: "80%",
                margin: "auto",
                marginBottom: "1vw",
              }}
            >
              {moment(lot.end).isAfter() && (
                <div style={{ display: "flex", gap: "5%" }}>
                  <input
                    type="number"
                    style={{
                      border: "1px solid black",
                      borderRadius: 10,
                      margin: 0,
                      flex: 1,
                    }}
                    min={0}
                    name="extendOf"
                    value={extendOf}
                    onChange={(e) => setExtendOf(e.target.value)}
                  />
                  <p style={{ margin: "auto", marginLeft: "-10px" }}>min</p>
                  <Button
                    variant="contained"
                    sx={{
                      gap: "5%",
                      alignContent: "center",
                      flex: 1,
                      fontSize: "0.9vw",
                    }}
                    disabled={extendOf === 0}
                    onClick={extendTime}
                  >
                    Rallonger <MoreTimeIcon sx={{ width: "1.5vw" }} />
                  </Button>
                </div>
              )}
              <br />
              <div style={{ display: "flex", width: "100%", gap: "5%" }}>
                <Button
                  variant="contained"
                  sx={{ gap: "5%", flex: "3" }}
                  onClick={handleClickLot}
                >
                  Éditer <EditIcon />
                </Button>
                <IconButton
                  aria-label="delete"
                  sx={{ flex: "1" }}
                  onClick={deleteLot}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            </div>
          </Card>
          <UpdateLotDialog
            open={openLot}
            onClose={handleClose}
            auction={auction}
            lot={lot}
          />
        </div>
      )}
    </div>
  );
}

export default LotCardConfig;

function UpdateLotDialog(props) {
  const { open, onClose, auction, lot } = props;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { padding: "0 4% 0 4%", width: "85%" } }}
    >
      <DialogTitle>Modifier un Lot</DialogTitle>
      <UpdateLot
        onClose={onClose}
        auctionId={auction._id}
        nbLots={auction.catalogue.length}
        lot={lot}
      />
    </Dialog>
  );
}

import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import FollowLotHandler from "../Auction/FollowLotHandler";
import { NavLink } from "react-router-dom";
import { isEmbryo, isEmpty, numberWithPoint } from "../../utils/Utils";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { UidContext } from "../AppContext";
import { Chrono, whenFunction } from "../Chrono";

function LotCard(props) {
  const lot = props.lot;
  const { uid } = useContext(UidContext);
  const [t, i18n] = useTranslation();

  const [when, setWhen] = useState();

  useEffect(() => {
    if (lot) {
      // Custom function to determine auction status
      const determineStatus = () => {
        if (!lot.start || !lot.end) {
          return "amiable"; // No valid date, consider as "amiable"
        }

        return whenFunction(lot.start, lot.end); // Calculate using existing logic
      };

      setWhen(determineStatus());
      const interval = setInterval(() => {
        setWhen(determineStatus());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lot]);

  return (
    <div className="card">
      {!isEmpty(props) && (
        <NavLink to={`/lot/${lot._id}`}>
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
                  <div className="border" />
                </div>
                <FollowLotHandler lotId={lot._id} />
              </CardMedia>
            )}
            {!isEmbryo(lot) && (
              <CardMedia>
                <div>
                  <img
                    src={`${process.env.REACT_APP_API_URL}uploads/${lot.pictures[0]}`}
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
                  <p>{lot.pedigree.gen1.father}</p> <div className="x">X</div>{" "}
                  <p>{lot.pedigree.gen1.mother}</p>
                </>
              ) : (
                <p>{lot.name}</p>
              )}
            </div>
            <CardContent>
              <h2>
                Lot {lot.number} - {t("Lot." + lot.type)} -{" "}
                {t(/* "Lot."  */ lot.sexe)}
              </h2>{" "}
              <hr />
              <p className="lot-title">
                {i18n.language === "fr-FR" ? lot.title : lot.titleEN}
              </p>
              <hr />
              <p className="vs">
                {lot.pedigree.gen1.father} <span className="xLot">X</span>{" "}
                {lot.pedigree.gen2.GFMaternal}
              </p>
              <br />
              {/*  {when === "now" && (
                <div className="chrono-price">
                  <h1>
                    <Chrono start={lot.start} end={lot.end} />
                  </h1>
                  <div className="sep">|</div>
                  {isEmpty(lot.lastBid) ? (
                    <h1 className="price">{numberWithPoint(lot.price)} €</h1>
                  ) : (
                    <h1 className="price">
                      {numberWithPoint(lot.lastBid.amount)} €
                    </h1>
                  )}
                </div>
              )} */}
            </CardContent>
            <div className="Action">
              {when === "now" && (
                <div className="open">
                  {!isEmpty(lot.lastBid) && lot.lastBid.bidderId === uid ? (
                    <h1 className="holder">{t("informationd")}</h1>
                  ) : (
                    <h1>{t("Auction.Bid")}</h1>
                  )}
                </div>
              )}
              {when === "passed" && (
                <div className="closed">
                  {isEmpty(lot.lastBid) ? (
                    <h1>{t("informationd")}</h1>
                  ) : lot.lastBid.bidderId === uid ? (
                    <h1 className="you-won">{t("Auction.Won")}</h1>
                  ) : (
                    <h1>{t("informationd")}</h1>
                  )}
                </div>
              )}
              {when === "coming" && (
                <div className="coming">
                  <h1>
                    {t("Auction.In")} <Chrono start={lot.start} end={lot.end} />
                  </h1>
                </div>
              )}
              {when === "amiable" && (
                <div className="closed">
                  <h4>{t("information")}</h4>
                </div>
              )}
            </div>
          </Card>
        </NavLink>
      )}
    </div>
  );
}

export default LotCard;

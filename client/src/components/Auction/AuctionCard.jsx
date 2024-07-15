import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { Chrono, whenFunction } from "../Chrono";

export default function AuctionCard({ auction }) {
  const [t, i18n] = useTranslation();
  const [when, setWhen] = useState();

  useEffect(() => {
    if (auction) {
      const updateWhen = () =>
        setWhen(whenFunction(auction.start, auction.end));
      updateWhen();
      const interval = setInterval(updateWhen, 1000);
      return () => clearInterval(interval);
    }
  }, [auction]);

  return (
    <div className="card">
      {when === "now" && (
        <div className="info live-auction">
          <p>{t("Home.Presented-Auction.In-Progress")}</p>
          <div className="live-container">
            <div className="dot"></div>
            <p className="live title">LIVE</p>
          </div>
        </div>
      )}
      {when === "coming" && (
        <div className="info">
          <p>{t("Home.Presented-Auction.To-come")}</p>
        </div>
      )}
      <Card>
        <NavLink to={`/auction/${auction._id}`}>
          <CardMedia>
            <img
              src={`${process.env.REACT_APP_API_URL}${auction.picture}`}
              alt="Auction"
            />
            <Typography variant="h6" component="p">
              {i18n.language === "fr-FR" ? auction.title : auction.titleEN}
            </Typography>
          </CardMedia>
          <CardContent sx={{ paddingBottom: "0!important", padding: 0 }}>
            <div className="content-container">
              <Typography gutterBottom variant="body1" component="div">
                {moment(auction.start).format("L")} -{" "}
                {moment(auction.end).format("L")}
              </Typography>
              <hr className="hr2" />
              {auction.saleType === "private_sale" ? (
                <Typography>{auction.subtitle}</Typography>
              ) : (
                <Typography gutterBottom variant="h6" component="div">
                  {when === "now" && (
                    <div>
                      {t("Auction-Card.End-In")}{" "}
                      <Chrono start={auction.start} end={auction.end} />
                    </div>
                  )}
                  {when === "coming" && (
                    <div>
                      {t("Auction-Card.In")}{" "}
                      <Chrono start={auction.start} end={auction.end} />
                    </div>
                  )}
                  {when === "passed" && (
                    <div>
                      {t("Auction-Card.Closed")}{" "}
                      {moment(auction.end).format("L")}
                    </div>
                  )}
                </Typography>
              )}
              <hr className="hr2" />
              <Typography className="sub-title">
                {i18n.language === "fr-FR"
                  ? auction.description
                  : auction.descriptionEN}
              </Typography>
            </div>
          </CardContent>
        </NavLink>
      </Card>
    </div>
  );
}

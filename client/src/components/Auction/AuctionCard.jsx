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
  console.log("info", auction.Data);
  return (
    <div className="card">
      {/* Only show "LIVE" for public auctions when they are live (when === "now") */}
      {when === "now" && auction.saleType !== "private_sale" && (
        <div className="info live-auction">
          <p>{t("Home.Presented-Auction.In-Progress")}</p>
          <div className="live-container">
            <div className="dot"></div>
            <p className="live title">LIVE</p>
          </div>
        </div>
      )}

      {/* Only show "To-come" message for public auctions that are upcoming */}
      {when === "coming" && auction.saleType !== "private_sale" && (
        <div className="info">
          <p>{t("Home.Presented-Auction.To-come")}</p>
        </div>
      )}

      {/* For private sales, display the private sale message */}
      {auction.saleType === "private_sale" && (
        <div className="info live-auction">
          <p>{t("Home.Presented-Auction.vent")}</p>
          <div className="live-container">
            <p className="live title" style={{ color: "white" }}></p>
          </div>
        </div>
      )}

      <Card>
        <NavLink to={`/auction/${auction._id}`}>
          <CardMedia>
            <img
              src={`${process.env.REACT_APP_API_URL}${auction.picture}`}
              alt="Auction"
            />
            <Typography
              variant="h6"
              component="p"
              style={{ fontFamily: "Arapey" }}
            >
              {i18n.language === "fr-FR" ? auction.title : auction.titleEN}
            </Typography>
          </CardMedia>

          <CardContent
            sx={{
              paddingBottom: "0!important",
              padding: 0,
              fontFamily: "Arapey",
            }}
          >
            <div className="content-container">
              {auction.saleType !== "private_sale" ? (
                <Typography gutterBottom variant="body1" component="div">
                  {auction.start
                    ? moment(auction.start).format("L")
                    : moment().format("L")}{" "}
                  -{" "}
                  {auction.end
                    ? moment(auction.end).format("L")
                    : moment().format("L")}
                </Typography>
              ) : (
                <Typography
                  gutterBottom
                  variant="body1"
                  component="div"
                  style={{ opacity: 0 }}
                >
                  {moment().format("L LT")}
                  {/* Current date and time with transparency */}
                </Typography>
              )}

              <hr className="hr2" />

              {auction.saleType === "private_sale" ? (
                <Typography>{auction.subtitle}</Typography>
              ) : (
                <Typography gutterBottom variant="h6" component="div">
                  {when === "now" && (
                    <div className="arapey-font">
                      {t("Auction-Card.End-In")}{" "}
                      <Chrono
                        start={auction.start || moment()}
                        end={auction.end || moment()}
                      />
                    </div>
                  )}
                  {when === "coming" && (
                    <div className="arapey-font">
                      {t("Auction-Card.In")}{" "}
                      <Chrono
                        start={auction.start || moment()}
                        end={auction.end || moment()}
                      />
                    </div>
                  )}
                  {when === "passed" && (
                    <div className="arapey-font">
                      {t("Auction-Card.Closed")}{" "}
                      {auction.end
                        ? moment(auction.end).format("L")
                        : moment().format("L")}
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

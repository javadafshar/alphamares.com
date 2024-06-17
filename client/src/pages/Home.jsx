import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { NavLink } from "react-router-dom";
import { isEmpty } from "../utils/Utils";
import PresentedAuction from "../components/Home/PresentedAuction";
import { useTranslation } from "react-i18next";
import { Tiles } from "../components/Home/Tiles";
import clooney from "../assets/img/home/clooney.webp";
import killerQueen from "../assets/img/home/Killer-Queen.webp";

const Home = () => {
  const [displayedAuction, setDisplayedAuction] = useState();
  const [t] = useTranslation();

  let prevAuction;

  async function getAuctions() {
    await axios
      .get(`${process.env.REACT_APP_API_URL}api/auction/`)
      .then((res) => {
        if (
          res.data &&
          JSON.stringify(prevAuction) !== JSON.stringify(res.data)
        ) {
          prevAuction = res.data;
          getCurrentAuction(res.data);
        }
      })
      .catch((err) => console.log(err));
  }

  function getCurrentAuction(auctions) {
    var now = moment();
    var auctionsInProgress = [];
    var auctionsToCome = [];
    var previousAuctions = [];
    auctions.forEach((auction) => {
      if (
        moment(auction.start).isSameOrBefore(now) &&
        moment(auction.end).isAfter(now)
      ) {
        auctionsInProgress.push(auction);
      }
      if (moment(auction.start).isAfter(now)) {
        auctionsToCome.push(auction);
      }
      if (moment(auction.end).isBefore(now)) {
        previousAuctions.push(auction);
      }
    });
    if (auctionsInProgress.length > 0) {
      setDisplayedAuction(auctionsInProgress[0]);
    } else if (auctionsToCome.length > 0) {
      if (auctionsToCome.length === 1) {
        setDisplayedAuction(auctionsToCome[0]);
      } else {
        auctionsToCome.sort((a, b) => moment(a.start).diff(moment(b.start)));
        setDisplayedAuction(auctionsToCome[0]);
      }
    } else if (previousAuctions.length > 0) {
      setDisplayedAuction(previousAuctions.pop());
    }
  }

  useEffect(() => {
    getAuctions();
    const interval = setInterval(() => getAuctions(), 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <div className="Home">
        <div className="img-presentedAuction">
          <img
            className="horse-logo"
            src="/img/horse-logo.jpg"
            alt="Logo Alpha-Mares"
          />
          {!isEmpty(displayedAuction) && (
            <PresentedAuction displayedAuction={displayedAuction} />
          )}
        </div>
        <br />
        <hr />
        <br />

        <br />
        <Tiles />
        <br />
        <h2 style={{ whiteSpace: "pre-wrap" }}>{t("Home.intro4")}</h2>
        {/*    <br /> */}
        <hr className="hrupbtn" />
        {/*  <br /> */}

        <div className="btn-and-images">
          <div className="col">
            <NavLink className="btn-Home" to="/buy">
              {t("Home.HowToBuy")}
            </NavLink>
            <img className="none" src={clooney} alt="Clooney" />
          </div>
          <div className="col">
            <NavLink className="btn-Home" to="/sell">
              {t("Home.HowToSell")}
            </NavLink>
            <img src={killerQueen} alt="Killer Queen" className="none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

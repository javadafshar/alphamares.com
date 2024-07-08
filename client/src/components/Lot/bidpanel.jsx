import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { isEmpty } from "../../utils/Utils";
import { UidContext } from "../AppContext";
import { Chrono, whenFunction } from "../Chrono";
import { io } from "socket.io-client";

const socket = io(`${process.env.REACT_APP_API_URL}`);

const BidPanel = (props) => {
  const { user, lot, fetchLot } = props;
  const { uid } = useContext(UidContext);
  const [terms, setTerms] = useState(false);
  const [step, setStep] = useState(0);
  const [bidPlus, setBidPlus] = useState(0);
  const [notBidderAnymore, setNotBidderAnymore] = useState(false);
  const [t, i18n] = useTranslation();
  const [when, setWhen] = useState();

  useEffect(() => {
    if (lot) {
      stepCalcul();
      wasBidder(lot, uid);
    }
  }, [lot, uid]);

  useEffect(() => {
    if (lot) {
      const interval = setInterval(() => {
        setWhen(whenFunction(lot.start, lot.end));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lot]);

  function stepCalcul() {
    let stepVar = 0;
    if (isEmpty(lot.lastBid)) {
      if (lot.price < 1000) stepVar = 100;
      else if (lot.price >= 1000 && lot.price < 20000) stepVar = 500;
      else if (lot.price >= 20000 && lot.price < 50000) stepVar = 1000;
      else stepVar = 2000;
    } else {
      const lastBidAmount = lot.lastBid?.amount || 0; // Use optional chaining to avoid null/undefined errors
      if (lastBidAmount < 1000) stepVar = 100;
      else if (lastBidAmount >= 1000 && lastBidAmount < 20000) stepVar = 500;
      else if (lastBidAmount >= 20000 && lastBidAmount < 50000) stepVar = 1000;
      else stepVar = 2000;
    }
    setStep(stepVar);
    setBidPlus(stepVar);
  }

  function subBid() {
    if (bidPlus > step) {
      setBidPlus(bidPlus - step);
    }
  }

  function addBid() {
    setBidPlus(step + bidPlus);
  }

  function handleTerms(event) {
    setTerms(event.target.checked);
  }

  const sendBid = async () => {
    try {
      socket.emit("bid", lot._id);
      console.log("Bid event emitted");
    } catch (error) {
      console.error("Socket emit error:", error);
    }

    if (terms && bidPlus >= step) {
      setTerms(false);
      const bid = {
        bidderId: user._id,
        auctionId: lot.auction,
        lotId: lot._id,
        amount: isEmpty(lot.lastBid)
          ? lot.price + bidPlus
          : lot.lastBid.amount + bidPlus,
      };
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}api/bid`, bid);
        fetchLot();
      } catch (error) {
        console.log(error);
      }
    }
  };

  function numberWithPoint(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function wasBidder(lot, uid) {
    if (!isEmpty(lot.bids)) {
      lot.bids.forEach((bid) => {
        if (bid.bidderId === uid) {
          setNotBidderAnymore(true);
        }
      });
    } else {
      setNotBidderAnymore(false);
    }
  }

  useEffect(() => {
    if (lot) {
      setWhen(whenFunction(lot.start, lot.end));
    }
  }, [lot]);

  if (!lot) {
    return null; // or loading indicator if needed
  }

  return (
    <div className="bidPanel">
      {lot.price ? ( // Check if lot.price exists
        <div className="bidPanel-container">
          <div className="blob">
            <h1>{t("Lot.Panel.Current-Auction")}</h1>
            {isEmpty(lot.lastBid) ? (
              <h1 className="moove">{numberWithPoint(lot.price)} €</h1>
            ) : (
              <h1 className="moove">{numberWithPoint(lot.lastBid.amount)} €</h1>
            )}
          </div>
          <h2>
            {t("Lot.Panel.Ends-In")} <br />{" "}
            <strong>
              <Chrono start={lot.start} end={lot.end} />
            </strong>
          </h2>
          <div className="bid-controls">
            <button onClick={subBid}>-</button>
            <span>{numberWithPoint(bidPlus)} €</span>
            <button onClick={addBid}>+</button>
            <button
              onClick={sendBid}
              disabled={!terms || bidPlus < step || notBidderAnymore}
              style={{
                backgroundColor: "#007bff",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "5px",
                fontSize: "16px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              {t("Lot.Panel.Bid")}
            </button>
            <label style={{ fontSize: "16px", marginTop: "10px" }}>
              <input type="checkbox" checked={terms} onChange={handleTerms} />
              {t("Lot.Panel.I-Accept")}{" "}
              <a
                href={`${process.env.REACT_APP_API_URL}legals/CGU.pdf`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("Lot.Panel.CGU")}
              </a>
              .
            </label>
          </div>
        </div>
      ) : (
        <div className="terms-container">
          <p
            style={{
              color: "#686e7c",
              fontSize: "1.5rem",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            {i18n.language === "fr"
              ? t("Ask for the price")
              : "Demander le prix par téléphone"}
          </p>
          <p
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            +33 6 33 34 66 54
          </p>
          <p
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {i18n.language === "fr"
              ? t("Appel ou Whatsapp")
              : "Appel ou Whatsapp"}
          </p>
        </div>
      )}
    </div>
  );
};

export default BidPanel;

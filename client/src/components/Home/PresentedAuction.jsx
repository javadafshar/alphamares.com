import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Chrono, whenFunction } from "../Chrono";

export default function PresentedAuction(props) {
  const start = props.displayedAuction.start;
  const end = props.displayedAuction.end;
  const saleType = props.displayedAuction.saleType; // Assuming saleType is fetched from the displayedAuction

  const [t, i18n] = useTranslation();
  const [when, setWhen] = useState();

  useEffect(() => {
    setWhen(whenFunction(start, end));
    const interval = setInterval(() => {
      setWhen(whenFunction(start, end));
    }, 1000);
    return () => clearInterval(interval);
  }, [start, end]);

  // Determine if auction saleType is not 'auction'
  const isNotAuction = saleType !== "auction";

  return (
    <div className="presented-auction">
      {isNotAuction && <h1 className="title"></h1>}
      {isNotAuction && <h1 className="title">Vente Amiable</h1>}
      {!isNotAuction && when === "coming" && (
        <h1 className="title">{t("Home.Presented-Auction.To-come")}</h1>
      )}
      {!isNotAuction && when === "passed" && (
        <h1 className="title">{t("Home.Presented-Auction.Closed")}</h1>
      )}
      {!isNotAuction && when === "now" && (
        <div className="live-auction">
          <h1 className="title">{t("Home.Presented-Auction.In-Progress")}</h1>
          <div className="live-container">
            <div className="dot"></div>
            <p className="live title">LIVE</p>
          </div>
        </div>
      )}
      <div className="card-auction">
        <NavLink to={`/auction/${props.displayedAuction._id}`}>
          <h2 style={{ fontWeight: "800" }}>
            {i18n.language === "en-EN"
              ? props.displayedAuction.titleEN
              : props.displayedAuction.title}
          </h2>
          {when === "now" && (
            <h3>
              {t("Home.Presented-Auction.End")}{" "}
              <Chrono start={start} end={end} />
            </h3>
          )}
          {when === "coming" && (
            <h3>
              {t("Home.Presented-Auction.In")}{" "}
              <Chrono start={start} end={end} />
            </h3>
          )}
          {when === "passed" && (
            <h3>
              <Chrono start={start} end={end} />
            </h3>
          )}
          <button className="btn activate">
            {t("Home.Presented-Auction.See-Catalog")}
          </button>
        </NavLink>
      </div>
    </div>
  );
}

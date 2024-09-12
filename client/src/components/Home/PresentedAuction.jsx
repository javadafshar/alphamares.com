import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Chrono, whenFunction } from "../Chrono";
import moment from "moment";

export default function PresentedAuction(props) {
  const { displayedAuction } = props;
  const { start, end, saleType, createdAt, subtitle } = displayedAuction;

  const [t, i18n] = useTranslation();
  const [when, setWhen] = useState();

  useEffect(() => {
    if (start && end) {
      setWhen(whenFunction(start, end));
      const interval = setInterval(() => {
        setWhen(whenFunction(start, end));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setWhen(null);
    }
  }, [start, end]);

  const isNotAuction = saleType !== "auction";

  return (
    <div className="presented-auction">
      {isNotAuction && <h1 className="title">{t("Home.Private-Sale")}</h1>}
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
        <NavLink to={`/auction/${displayedAuction._id}`}>
          <h2 style={{ fontWeight: "800" }}>
            {i18n.language === "en-EN"
              ? displayedAuction.titleEN
              : displayedAuction.title}
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
          {isNotAuction && !when && (
            <h3 style={{ marginTop: "-5px" }}>
              {/*  {t(subtitle)} <span>{moment(createdAt).fromNow()}</span> */}
            </h3>
          )}
          <button className="btn activate">
            {t("Home.Presented-Auction.See-Catalog")}
          </button>
        </NavLink>
        {/*  */}
      </div>
    </div>
  );
}

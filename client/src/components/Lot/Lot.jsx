import React, { useContext, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { gold } from "../../App";
import LaunchIcon from "@mui/icons-material/Launch";
import {
  isImplantedEmbryo,
  isEmpty,
  isFrozenEmbryo,
  isFoal,
  isBroodmareEmpty,
  isYearling,
  isBroodmareFull,
} from "../../utils/Utils";
import { useSelector } from "react-redux";
import Slider from "./Slider";
import { UidContext } from "../AppContext";
import { Dialog } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Chrono, whenFunction } from "../Chrono";
import { io } from "socket.io-client";
//import BidPanel from "./bidpanel";
const socket = new io(`${process.env.REACT_APP_API_URL}`);

export default function Lot() {
  const [lot, setLot] = useState();
  let params = useParams();
  const user = useSelector((state) => state.userReducer);
  const [t, i18n] = useTranslation();

  let prevLot;
  function fetchLot() {
    axios
      .get(`${process.env.REACT_APP_API_URL}api/lot/${params.id}`)
      .then((res) => {
        if (res.data && JSON.stringify(prevLot) !== JSON.stringify(res.data)) {
          setLot(res.data);
          prevLot = res.data;
        }
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    fetchLot();
    const interval = setInterval(() => fetchLot(), 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page page-lot">
      {!isEmpty(lot) && (
        <div className="lot">
          <div className="presentation">
            <div className="left">
              <NavLink to={`/auction/${lot.auction}`}>
                <button className="btn">{t("Lot.Back-Catalog")}</button>
              </NavLink>
              <br />
              <h3>
                Lot {lot.number} - {t("Lot." + lot.type)}
              </h3>
              <br />
              <h2>{i18n.language === "fr-FR" ? lot.title : lot.titleEN}</h2>
            </div>
            <div>
              {!lot.commission ? ( // Conditionally render BidPanel based on lot.commission
                <BidPanel lot={lot} user={user} fetchLot={fetchLot} />
              ) : (
                <p>0751272799</p>
              )}
            </div>
          </div>
          <br />
          <div className="images-and-pedigree">
            <Slider lot={lot} />
            <Pedigree lot={lot} />
          </div>
          <br />
          <LotInfos lot={lot} />
        </div>
      )}
    </div>
  );
}

function Pedigree(props) {
  const lot = props.lot;
  return (
    <div className="pedigree">
      <div className="pedigree-container">
        <div className="row">
          <div className="col">
            <h4>{lot.pedigree.gen1.father}</h4>
          </div>
          <div className="col">
            <h4>{lot.pedigree.gen2.GFPaternal}</h4>
            <hr />
            <h4>{lot.pedigree.gen2.GMPaternal}</h4>
          </div>
          <div className="col" id="col3">
            <h4>{lot.pedigree.gen3.GGFPF}</h4>
            <hr />
            <h4>{lot.pedigree.gen3.GGMPF}</h4>
            <div>
              <hr className="hrmid" />
            </div>
            <h4>{lot.pedigree.gen3.GGFMF}</h4>
            <hr />
            <h4>{lot.pedigree.gen3.GGMMF}</h4>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col">
            <h4>{lot.pedigree.gen1.mother}</h4>
          </div>
          <div className="col">
            <h4>{lot.pedigree.gen2.GFMaternal}</h4>
            <hr />
            <h4>{lot.pedigree.gen2.GMMaternal}</h4>
          </div>
          <div className="col">
            <h4>{lot.pedigree.gen3.GGFPM}</h4>
            <hr />
            <h4>{lot.pedigree.gen3.GGMPM}</h4>
            <hr />
            <h4>{lot.pedigree.gen3.GGFMM}</h4>
            <hr />
            <h4>{lot.pedigree.gen3.GGMMM}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BidPanel(props) {
  const userData = props.user;
  const lot = props.lot;
  const [terms, setTerms] = useState(false);
  const [step, setStep] = useState(0);
  const [bidPlus, setBidPlus] = useState(0);
  const [notBidderAnymore, setNotBidderAnymore] = useState(false);
  const { uid } = useContext(UidContext);
  const [t] = useTranslation();

  function stepCalcul() {
    var stepVar;
    if (isEmpty(lot.lastBid)) {
      if (lot.price < 1000) stepVar = 100;
      if (lot.price >= 1000 && 20000 > lot.price) stepVar = 500;
      if (lot.price >= 20000 && 50000 > lot.price) stepVar = 1000;
      if (50000 <= lot.price) stepVar = 2000;
    } else {
      if (lot.lastBid.amount < 1000) stepVar = 100;
      if (lot.lastBid.amount >= 1000 && 20000 > lot.lastBid.amount)
        stepVar = 500;
      if (lot.lastBid.amount >= 20000 && 50000 > lot.lastBid.amount)
        stepVar = 1000;
      if (50000 <= lot.lastBid.amount) stepVar = 2000;
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
        bidderId: userData._id,
        auctionId: lot.auction,
        lotId: lot._id,
        amount: isEmpty(lot.lastBid)
          ? lot.price + bidPlus
          : lot.lastBid.amount + bidPlus,
      };
      await axios
        .post(`${process.env.REACT_APP_API_URL}api/bid`, bid)
        .then(() => props.fetchLot())
        .catch((err) => console.log(err));
    }
  };

  function numberWithPoint(x) {
    if (x === null || x === undefined) {
      return "";
    }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => stepCalcul(), [step, lot.lastBid, lot.price]);
  useEffect(() => {
    wasBidder(lot, uid);
  }, [lot, uid]);

  const [when, setWhen] = useState();

  useEffect(() => {
    if (lot) {
      setWhen(whenFunction(lot.start, lot.end));
      const interval = setInterval(() => {
        setWhen(whenFunction(lot.start, lot.end));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lot]);

  return lot.price ? (
    <div className="bidPanel">
      {when === "now" && !isEmpty(uid) && userData.blocked && (
        <div className="bidPanel-container">
          <div className="blob">
            <h1>{t("Lot.Panel.Current-Auction")}</h1>
            {isEmpty(lot.lastBid) ? (
              <h1 className="moove">{numberWithPoint(lot.price || 0)} €</h1>
            ) : (
              <h1 className="moove">
                {numberWithPoint(lot.lastBid.amount || 0)} €
              </h1>
            )}
          </div>
          <h2>
            {t("Lot.Panel.Ends-In")} <br />{" "}
            <strong>
              <Chrono start={lot.start} end={lot.end} />
            </strong>
          </h2>
          <h2>{t("Lot.Panel.Blocked-Account")}</h2>
        </div>
      )}
      {when === "now" && !isEmpty(uid) && !userData.blocked && (
        <div className="bidPanel-container">
          {!isEmpty(lot.lastBid) ? (
            lot.lastBid.bidderId === uid ? (
              <div className="YouFirst">{t("Lot.Panel.You-Are-Holder")}</div>
            ) : notBidderAnymore ? (
              <div className="YouFirst">
                {t("Lot.Panel.You-Are-Not-Holder-Anymore")}
              </div>
            ) : (
              <></>
            )
          ) : (
            <></>
          )}
          <div className="blob">
            <h1>{t("Lot.Panel.Current-Auction")}</h1>
            {isEmpty(lot.lastBid) ? (
              <h1 className="moove">{numberWithPoint(lot.price || 0)} €</h1>
            ) : (
              <h1 className="moove">
                {numberWithPoint(lot.lastBid.amount || 0)} €
              </h1>
            )}
          </div>
          <h2>
            {t("Lot.Panel.Ends-In")}
            <br />{" "}
            <strong>
              <Chrono start={lot.start} end={lot.end} />
            </strong>
          </h2>

          <div className="terms-container">
            <input
              type="checkbox"
              id="terms"
              onChange={handleTerms}
              value={terms}
              checked={terms}
            />
            <label htmlFor="terms">
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
          <div className="btn-container">
            <div className="btn-add-sub">
              <div className="btna" onClick={subBid}>
                -
              </div>
              {isEmpty(lot.lastBid) ? (
                <h3>{numberWithPoint((lot.price || 0) + bidPlus)} €</h3>
              ) : (
                <h3>
                  {numberWithPoint((lot.lastBid.amount || 0) + bidPlus)} €
                </h3>
              )}
              <div className="btna" onClick={addBid}>
                +
              </div>
            </div>
            <div className="btn-lot">
              <button disabled={!terms || bidPlus === 0} onClick={sendBid}>
                {t("Lot.Panel.Bid")}{" "}
              </button>
            </div>
          </div>
        </div>
      )}
      {when === "now" && isEmpty(uid) && !userData.blocked && (
        <div className="bidPanel-container">
          <div className="blob">
            <h1>{t("Lot.Panel.Current-Auction")}</h1>
            {isEmpty(lot.lastBid) ? (
              <h1 className="moove">{numberWithPoint(lot.price || 0)} €</h1>
            ) : (
              <h1 className="moove">
                {numberWithPoint(lot.lastBid.amount || 0)} €
              </h1>
            )}
          </div>
          <h2>
            {t("Lot.Panel.Ends-In")} <br />{" "}
            <strong>
              <Chrono start={lot.start} end={lot.end} />
            </strong>
          </h2>
          <div className="btn-container">
            <NavLink className="btn" to="/profil" state={"sign-up"}>
              {t("Lot.Panel.Create-Account")}
            </NavLink>
          </div>
        </div>
      )}
      {when === "coming" && isEmpty(uid) && (
        <div className="bidPanel-container">
          <div className="blob">
            <h1 style={{ whiteSpace: "nowrap" }}>
              {t("Lot.Panel.Start-Auction")}
            </h1>
            <h1>{numberWithPoint(lot.price || 0)}€</h1>
          </div>
          <div>
            <h5 style={{ fontWeight: "100" }}>{t("Lot.Panel.In")}</h5>
            <h5>
              <Chrono start={lot.start} end={lot.end} />
            </h5>
          </div>
          <div className="btn-container">
            <NavLink className="btn" to="/profil" state={"sign-up"}>
              {t("Lot.Panel.Create-Account")}
            </NavLink>
          </div>
        </div>
      )}
      {when === "coming" && !isEmpty(uid) && (
        <div className="bidPanel-container">
          <div className="blob">
            <h1 style={{ whiteSpace: "nowrap" }}>
              {t("Lot.Panel.Start-Auction")}
            </h1>
            <h1>{numberWithPoint(lot.price || 0)}€</h1>
          </div>
          <div>
            <h5 style={{ fontWeight: "100" }}>{t("Lot.Panel.In")}</h5>
            <h5>
              <Chrono start={lot.start} end={lot.end} />
            </h5>
          </div>
        </div>
      )}
      {when === "passed" && (
        <div className="bidPanel-container">
          {!isEmpty(lot.lastBid) && lot.lastBid.bidderId === uid && (
            <div className="YouFirst">{t("Lot.Panel.You-Are-Winner")}</div>
          )}
          <div className="blob">
            <h1>{t("Lot.Panel.Last-Auction")}</h1>
            {isEmpty(lot.lastBid) ? (
              <h1>{numberWithPoint(lot.price || 0)} €</h1>
            ) : (
              <h1>{numberWithPoint(lot.lastBid.amount || 0)}€</h1>
            )}
          </div>
          <div>
            <h5 style={{ fontWeight: "100" }}>{t("Lot.Panel.Finished")}</h5>
          </div>
        </div>
      )}
    </div>
  ) : (
    <>
      <div
        className="terms-container"
        style={{ margin: "5rem 1rem 1rem 3rem" }}
      >
        <p
          style={{
            color: "#2d374d",
            fontSize: "1.5rem",
            /*      marginBottom: "10px", */
            textAlign: "center",
          }}
        >
          {t("Lot.Panel.AskForPrice")}
        </p>
        <p
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            textAlign: "center",
            color: "##0d0f17",
          }}
        >
          +33 6 33 34 66 54
        </p>
      </div>
      <p
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          textAlign: "center",
          color: "#efc16d",
          marginTop: "-10px",
        }}
      >
        {t("Lot.Panel.CallOrWhatsapp")}
      </p>
    </>
  );
}
function LotInfos(props) {
  const [index, setIndex] = useState(0);
  const lot = props.lot;
  const [openTVA, setOpenTVA] = React.useState(false);
  const { t, i18n } = useTranslation();

  const handleClickOpen = () => {
    setOpenTVA(true);
  };

  const handleClose = () => {
    setOpenTVA(false);
  };

  const handleChange = (event, newIndex) => {
    setIndex(newIndex);
  };
  const renderComment = (comment) => {
    return comment.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };
  function Info() {
    return (
      <div>
        {isFrozenEmbryo(lot) && (
          <div className="row">
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Type")}</strong> {t("Lot." + lot.type)}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Production-Date")}</strong>{" "}
                {moment(lot.productionDate).format("LL")}
              </h4>
            </div>
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Sexe")}</strong> {t("Lot." + lot.sexe)}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Seller")}</strong>{" "}
                {i18n.language === "en-EN"
                  ? lot.sellerNationality
                  : t("Nation." + lot.sellerNationality)}{" "}
                ({t("Lot." + lot.sellerType)})
              </h4>
            </div>
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Location")}</strong> {lot.location}
              </h4>
              <h4>
                <strong>{t("Lot.Field.TVA")}</strong> {lot.tva} %{" "}
                <p onClick={handleClickOpen} className="calcul-TVA">
                  {t("Lot.Field.Calculs-TVA")}
                </p>
              </h4>
            </div>
          </div>
        )}

        {isImplantedEmbryo(lot) && (
          <div className="row">
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Type")}</strong> {t("Lot." + lot.type)}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Location")}</strong> {lot.location}
              </h4>
              {lot.reproduction === "ICSI" ||
              lot.reproduction === "Transfer" ? (
                <h4>
                  <strong>{t("Lot.Field.Age-Carrier")}</strong> {lot.carrierAge}{" "}
                  {t("Lot.Field.Years")}
                </h4>
              ) : (
                <h4 style={{ whiteSpace: "normal", textAlign: "justify" }}>
                  {t("Lot.Field.Carrier-Infos")}
                </h4>
              )}
              {(lot.reproduction === "ICSI" ||
                lot.reproduction === "Transfer") && (
                <h4>
                  <strong>{t("Lot.Field.Carrier-Deposit")}</strong>{" "}
                  {lot.carrierForSale ? lot.bondCarrier : ""} €
                </h4>
              )}
            </div>
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Sexe")}</strong> {t("Lot." + lot.sexe)}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Reproduction-Type")}</strong>{" "}
                {lot.reproduction}
              </h4>
              {(lot.reproduction === "ICSI" ||
                lot.reproduction === "Transfer") && (
                <>
                  <h4>
                    <strong>{t("Lot.Field.Carrier-Size")}</strong>{" "}
                    {lot.carrierSize} cm
                  </h4>
                  <h4>
                    <strong>{t("Lot.Field.Carrier-For-Sale")}</strong>{" "}
                    {lot.carrierForSale === "Yes"
                      ? t("Lot.Field.Yes")
                      : t("Lot.Field.No")}
                  </h4>
                </>
              )}
            </div>
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Seller")}</strong>{" "}
                {i18n.language === "en-EN"
                  ? lot.sellerNationality
                  : t("Nation." + lot.sellerNationality)}{" "}
                ({t("Lot." + lot.sellerType)})
              </h4>
              <h4>
                <strong>{t("Lot.Field.Due-Date")}</strong>{" "}
                {moment(lot.dueDate).format("LL")}{" "}
              </h4>
              <h4>
                <strong>{t("Lot.Field.TVA")}</strong> {lot.tva} %{" "}
                <p onClick={handleClickOpen} className="calcul-TVA">
                  {t("Lot.Field.Calculs-TVA")}
                </p>
              </h4>
            </div>
          </div>
        )}

        {isFoal(lot) && (
          <div className="row">
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Type")}</strong> {t("Lot." + lot.type)}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Location")}</strong> {lot.location}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Reproduction-Type")}</strong>{" "}
                {lot.reproduction}
              </h4>
            </div>
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Sexe")}</strong> {t("Lot." + lot.sexe)}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Seller")}</strong>{" "}
                {i18n.language === "en-EN"
                  ? lot.sellerNationality
                  : t("Nation." + lot.sellerNationality)}{" "}
                ({t("Lot." + lot.sellerType)})
              </h4>
              <h4>
                <strong>{t("Lot.Field.Race")}</strong> {lot.race}
              </h4>
            </div>
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Birthdate")}</strong>{" "}
                {moment(lot.birthDate).format("LL")}
              </h4>
              <h4>
                <strong>{t("Lot.Field.TVA")}</strong> {lot.tva} %{" "}
                <p onClick={handleClickOpen} className="calcul-TVA">
                  {t("Lot.Field.Calculs-TVA")}
                </p>
              </h4>
            </div>
          </div>
        )}

        {isBroodmareEmpty(lot) && (
          <div className="row">
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Type")}</strong> {t("Lot." + lot.type)}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Location")}</strong> {lot.location}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Race")}</strong> {lot.race}
              </h4>
            </div>
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Birthdate")}</strong>{" "}
                {moment(lot.birthDate).format("LL")}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Seller")}</strong>{" "}
                {i18n.language === "en-EN"
                  ? lot.sellerNationality
                  : t("Nation." + lot.sellerNationality)}{" "}
                ({t("Lot." + lot.sellerType)})
              </h4>
            </div>
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Size")}</strong>{" "}
                {lot.size ? lot.size : "-"} cm
              </h4>
              <h4>
                <strong>{t("Lot.Field.TVA")}</strong> {lot.tva} %{" "}
                <p onClick={handleClickOpen} className="calcul-TVA">
                  {t("Lot.Field.Calculs-TVA")}
                </p>
              </h4>
            </div>
          </div>
        )}

        {isBroodmareFull(lot) && (
          <div className="row">
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Type")}</strong> {t("Lot." + lot.type)}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Birthdate")}</strong>{" "}
                {moment(lot.birthDate).format("LL")}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Seller")}</strong>{" "}
                {i18n.language === "en-EN"
                  ? lot.sellerNationality
                  : t("Nation." + lot.sellerNationality)}{" "}
                ({t("Lot." + lot.sellerType)})
              </h4>
              <h4>
                <strong>{t("Lot.Field.Due-Date")}</strong>{" "}
                {moment(lot.dueDate).format("LL")}{" "}
              </h4>
            </div>
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Sexe")}</strong> {t("Lot." + lot.sexe)}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Location")}</strong> {lot.location}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Race")}</strong> {lot.race}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Selected-Stallion")}</strong>{" "}
                {lot.fatherFoal}
              </h4>
            </div>
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Size")}</strong>{" "}
                {lot.size ? lot.size : "-"} cm
              </h4>

              <h4>
                <strong>{t("Lot.Field.TVA")}</strong> {lot.tva} %{" "}
                <p onClick={handleClickOpen} className="calcul-TVA">
                  {t("Lot.Field.Calculs-TVA")}
                </p>
              </h4>
            </div>
          </div>
        )}

        {isYearling(lot) && (
          <div className="row">
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Type")}</strong> {t("Lot." + lot.type)}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Location")}</strong> {lot.location}
              </h4>
            </div>
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Birthdate")}</strong>{" "}
                {moment(lot.birthDate).format("LL")}
              </h4>
              <h4>
                <strong>{t("Lot.Field.Seller")}</strong>{" "}
                {i18n.language === "en-EN"
                  ? lot.sellerNationality
                  : t("Nation." + lot.sellerNationality)}{" "}
                ({t("Lot." + lot.sellerType)})
              </h4>
            </div>
            <div className="col">
              <h4>
                <strong>{t("Lot.Field.Race")}</strong> {lot.race}
              </h4>
              <h4>
                <strong>{t("Lot.Field.TVA")}</strong> {lot.tva} %{" "}
                <p onClick={handleClickOpen} className="calcul-TVA">
                  {t("Lot.Field.Calculs-TVA")}
                </p>
              </h4>
            </div>
          </div>
        )}
        <br />

        {!isEmpty(lot.commentFR) && !isEmpty(lot.commentEN) && (
          <div className="comment">
            <h4>
              <strong>{t("Lot.Field.Comment")}</strong>
            </h4>
            <h4>
              {i18n.language === "en-EN"
                ? renderComment(lot.commentEN)
                : renderComment(lot.commentFR)}
            </h4>
          </div>
        )}

        <br />
        <div className="insurance">
          <h3>{t("Lot.Insurer1")}</h3>
          <h3>
            {t("Lot.Insurer2")}
            <a href="tel:+33633346654">+33 6 33 34 66 54</a>
          </h3>
        </div>
        <br />
        <TVADialog open={openTVA} onClose={handleClose} />
      </div>
    );
  }

  const BlackType = React.memo(() => {
    return (
      lot.blackType && (
        <object
          data={`${process.env.REACT_APP_API_URL}${lot.blackType}`}
          width="100%"
          height="1000vh"
          type="application/pdf"
        >
          <a
            href={`${process.env.REACT_APP_API_URL}${lot.blackType}`}
            style={{ textDecoration: "underline" }}
          >
            Pedigree Black Type
          </a>
        </object>
      )
    );
  });

  function VetDocs() {
    return (
      <div>
        <h2>{t("Lot.Vet-Doc")} :</h2>
        <br />
        <div className="veterinaryDocs">
          {!isEmpty(lot.veterinaryDocuments) &&
            lot.veterinaryDocuments.map((doc) => {
              return (
                <div key={doc} className="doc">
                  <a
                    href={`${process.env.REACT_APP_API_URL}${doc}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                  >
                    <div className="doc-title">
                      {doc
                        .split(".pdf")[0]
                        .split("Lot_")
                        .pop()
                        .split("_")
                        .slice(1)}
                    </div>
                    <LaunchIcon />
                  </a>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  return (
    <div className="lot-infos">
      <Tabs
        value={index}
        onChange={handleChange}
        sx={{
          "& .MuiTabs-indicator": { backgroundColor: "transparent" },
          "& .MuiTab-root": {
            color: "white",
            border: "3px solid",
            borderColor: gold,
            borderRadius: "15px",
            margin: "1vw",
          },
          "& .Mui-selected": { color: "black", backgroundColor: gold },
        }}
        centered
      >
        <Tab label={t("Lot.General-Info")} />
        <Tab label={t("Lot.Black-Type")} />
        <Tab label={t("Lot.Vet-Doc")} />
      </Tabs>
      <hr />
      <br />
      {index === 0 && <Info />}
      {index === 1 && <BlackType />}
      {index === 2 && <VetDocs />}
    </div>
  );
}

function TVADialog(props) {
  const { open, onClose } = props;
  const { t } = useTranslation();

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open} className="dialog-TVA">
      <div className="dialog-TVA">
        <h2>{t("Lot.Dialog-TVA.Title")}</h2>
        <br />
        <ol>
          <li>{t("Lot.Dialog-TVA.1")}</li>
          <li>{t("Lot.Dialog-TVA.2")}</li>
          <li>{t("Lot.Dialog-TVA.3")}</li>
          <li>{t("Lot.Dialog-TVA.4")}</li>
          <li>{t("Lot.Dialog-TVA.5")}</li>
        </ol>
      </div>
    </Dialog>
  );
}

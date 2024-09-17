import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Button } from "@mui/material";
import moment from "moment";
import { NavLink } from "react-router-dom";
import i18next from "i18next";
import io from "socket.io-client";

const socket = io(`${process.env.REACT_APP_API_URL}`);

const fetchData = async (setLots, setBids) => {
  try {
    const lotData = await axios.get(`${process.env.REACT_APP_API_URL}api/lot`);
    setLots(lotData.data);
    const bidData = await axios.get(`${process.env.REACT_APP_API_URL}api/bid`);
    setBids(bidData.data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const BidCard = (props) => {
  const loggedInUserId = useSelector((state) => state.userReducer._id);
  const [userBids, setUserBids] = useState([]);
  const [lots, setLots] = useState([]);
  const [bids, setBids] = useState([]);
  const [selectedBid, setSelectedBid] = useState("");
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    setUserBids(bids.filter((bid) => bid.bidderId === loggedInUserId));
  }, [bids, loggedInUserId]);

  useEffect(() => {
    fetchData(setLots, setBids);
  }, []);

  useEffect(() => {
    const handleBidReceived = () => {
      fetchData(setLots, setBids); // Fetch lots and bids to refresh data
    };

    // Listen for 'bidReceived' event from server
    socket.on("bidReceived", () => {
      console.log("Received bidReceived event from server");
      handleBidReceived();
    });

    // Clean up function to remove event listener when component unmounts
    return () => {
      socket.off("bidReceived", handleBidReceived);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleBidSelect = (event) => {
    setSelectedBid(event.target.value);
  };

  const calculateRemainingTime = (endTime) => {
    const now = currentTime;
    const end = moment(endTime);
    const duration = moment.duration(end.diff(now));

    if (duration.asSeconds() <= 0) {
      return i18next.language === "fr-FR" ? "Terminé" : "Ended";
    }

    return `${duration.days()}d ${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`;
  };

  const formatNumber = (number) => {
    return number.toLocaleString("fr-FR").replace(/,/g, " ");
  };

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        marginTop: "1rem",
        padding: "1rem",
      }}
    >
      <>
        <div style={{ padding: "20px" }}>
          <table
            style={{
              minWidth: "98%",
              borderCollapse: "separate",
              borderSpacing: "0 10px",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    borderBottom: "2px solid #ddd",
                  }}
                >
                  {i18next.language === "fr-FR" ? "N° du lot" : "Lot Number"}
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    borderBottom: "2px solid #ddd",
                  }}
                >
                  {i18next.language === "fr-FR" ? "Type de Lot" : "Type"}
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    borderBottom: "2px solid #ddd",
                  }}
                >
                  {i18next.language === "fr-FR" ? "Pedigree" : "Pedigree"}
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    borderBottom: "2px solid #ddd",
                  }}
                >
                  {i18next.language === "fr-FR"
                    ? "Temps restant"
                    : "Remaining time"}
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    borderBottom: "2px solid #ddd",
                  }}
                >
                  {i18next.language === "fr-FR"
                    ? "Enchère actuelle"
                    : "Current highest bid"}
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    borderBottom: "2px solid #ddd",
                  }}
                >
                  {i18next.language === "fr-FR" ? "Votre Enchère" : "Your Bid"}
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    borderBottom: "2px solid #ddd",
                  }}
                >
                  {i18next.language === "fr-FR" ? "Actions" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {lots
                .filter(
                  (lot) =>
                    !lot.closed && moment(lot.start).isBefore(currentTime)
                ) // Filter out closed lots and show only started auctions
                .sort((a, b) => a.number - b.number) // Sort by lot number
                .map((lot) => {
                  const lotBids = bids.filter((bid) => bid.lotId === lot._id);
                  const bidderCount = new Set(lotBids.map((b) => b.bidderId))
                    .size;
                  const topBidByUser = userBids.filter(
                    (bid) => bid.lotId === lot._id
                  );
                  const userTopBid =
                    topBidByUser.length > 0
                      ? Math.max(...topBidByUser.map((bid) => bid.amount))
                      : null;
                  const topBidAmount =
                    lotBids.length > 0
                      ? Math.max(...lotBids.map((bid) => bid.amount))
                      : null;

                  const isAuctionEnded = moment(lot.end).isBefore(currentTime);

                  // Determine bid status message based on auction status and user's bid
                  let bidStatusMessage = "";
                  if (!isAuctionEnded) {
                    if (userTopBid === topBidAmount) {
                      bidStatusMessage =
                        i18next.language === "fr-FR"
                          ? "vous tenez l’enchère"
                          : "You are the highest bidder";
                    } else {
                      console.log("Entering else block for ongoing auction");
                      bidStatusMessage =
                        i18next.language === "fr-FR"
                          ? "vous ne tenez plus l’enchère"
                          : "You are no longer the highest bidder";
                    }
                  } else {
                    if (userTopBid === topBidAmount) {
                      bidStatusMessage =
                        i18next.language === "fr-FR"
                          ? "vous avez gagné"
                          : "You won";
                    } else {
                      bidStatusMessage =
                        i18next.language === "fr-FR"
                          ? "vous avez perdu"
                          : "You lost";
                    }
                  }

                  console.log("Final bidStatusMessage:", bidStatusMessage);

                  // Display bid status message only if user has placed a bid
                  const showBidStatus =
                    userTopBid !== null &&
                    (isAuctionEnded || userTopBid === topBidAmount);

                  return (
                    <React.Fragment key={lot._id}>
                      <tr
                        style={{
                          backgroundColor: "hsl(0, 0%, 90%)",
                          color: "black",
                          marginBottom: "10px",
                          borderBottom: "10px solid transparent", // Add space between rows
                        }}
                      >
                        <td
                          style={{
                            textAlign: "center",
                            padding: "5px",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          <strong>{lot.number}</strong>
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            padding: "8px",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          <strong>{lot.type}</strong>
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            padding: "8px",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          {lot.pedigree.gen1.father}
                          <br />
                          <span>X</span>
                          <br />
                          {lot.pedigree.gen1.mother}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            padding: "8px",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          {lot.end ? calculateRemainingTime(lot.end) : "N/A"}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            padding: "8px",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          {topBidAmount
                            ? `${formatNumber(topBidAmount)} €`
                            : "N/A"}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            padding: "8px",
                            borderBottom: "1px solid #ddd",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {userTopBid ? (
                            <span>
                              {formatNumber(userTopBid)} €
                              {userTopBid === topBidAmount ? (
                                <span>&nbsp;&nbsp;&nbsp;</span>
                              ) : (
                                <span>&nbsp;&nbsp;&nbsp;</span>
                              )}
                            </span>
                          ) : (
                            "N/A"
                          )}
                          <br />
                          {showBidStatus && (
                            <span
                              style={{
                                color: isAuctionEnded
                                  ? userTopBid === topBidAmount
                                    ? "green"
                                    : "red"
                                  : userTopBid === topBidAmount
                                  ? "green"
                                  : "red",
                              }}
                            >
                              {bidStatusMessage}
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            padding: "8px",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          <NavLink to={`/lot/${lot._id}`}>
                            <Button
                              variant="contained"
                              color="primary"
                              disabled={isAuctionEnded}
                            >
                              {i18next.language === "fr-FR"
                                ? "ENCHERIR"
                                : "BID"}
                            </Button>
                          </NavLink>
                        </td>
                      </tr>
                      <tr
                        style={{
                          backgroundColor: "hsl(0, 0%, 90%)",
                          height: "2px",
                        }}
                      >
                        <td colSpan="7" style={{ padding: 0 }}></td>
                      </tr>
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </>
    </div>
  );
};

export default BidCard;

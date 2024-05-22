import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { TableRow, TableCell, Select, MenuItem, Button } from "@mui/material";
import moment from "moment";
import { NavLink } from "react-router-dom";
import { CheckCircle, Cancel } from "@mui/icons-material"; // Import Material-UI icons
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

export default function BidCard(props) {
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

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        marginTop: "1rem",
        padding: "1rem",
      }}
    >
      <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                borderBottom: "1px solid #ddd",
              }}
            >
              {i18next.language === "fr-FR" ? "Photo" : "Photo"}
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                borderBottom: "1px solid #ddd",
              }}
            >
              {i18next.language === "fr-FR" ? "N°de Lot" : "Type"}
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                borderBottom: "1px solid #ddd",
              }}
            >
              {i18next.language === "fr-FR" ? "Pedigree" : "Pedigree"}
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                borderBottom: "1px solid #ddd",
              }}
            >
              {i18next.language === "fr-FR"
                ? "Temps restant"
                : "Remaining time"}
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                borderBottom: "1px solid #ddd",
              }}
            >
              {i18next.language === "fr-FR"
                ? "Enchère actuelle"
                : "Current highest bid"}
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                borderBottom: "1px solid #ddd",
              }}
            >
              {i18next.language === "fr-FR" ? "Votre Enchère" : "Your Bid"}
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                borderBottom: "1px solid #ddd",
              }}
            >
              {i18next.language === "fr-FR" ? "Précédent" : "Previous"}
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                borderBottom: "1px solid #ddd",
              }}
            >
              {i18next.language === "fr-FR" ? "Actions" : "Actions"}
            </th>
          </tr>
        </thead>
        <tbody>
          {lots
            .filter((lot) => !lot.closed) // Filter out closed lots
            .map((lot) => {
              const lotBids = bids.filter((bid) => bid.lotId === lot._id);
              const bidderCount = new Set(lotBids.map((b) => b.bidderId)).size;
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

              return (
                <tr key={lot._id}>
                  <td
                    style={{
                      textAlign: "left",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    {lot.pictures && lot.pictures.length > 0 && (
                      <img
                        src={`${process.env.REACT_APP_API_URL}${lot.pictures[0]}`}
                        alt={`Photo of ${lot.name}`}
                        style={{
                          width: "100px",
                          height: "auto",
                          borderRadius: "10%",
                        }}
                      />
                    )}
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <strong>{lot.type}</strong>
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    {lot.pedigree.gen1.father}
                    <br></br>
                    <span
                      style={{
                        textAlign: "center",
                        paddingLeft: "30%",
                      }}
                    >
                      X
                    </span>
                    <br></br>
                    {lot.pedigree.gen1.mother}
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    {lot.end ? calculateRemainingTime(lot.end) : "N/A"}
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    {topBidAmount ? `${topBidAmount} €` : "N/A"}
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                      /*       color: userTopBid === topBidAmount ? "green" : "red", */
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {userTopBid ? (
                      <span>
                        {userTopBid} €
                        {userTopBid === topBidAmount ? (
                          <>
                            <span>&nbsp;&nbsp;&nbsp;</span>
                            <CheckCircle
                              sx={{
                                color: "green",
                                background: "white",
                                borderRadius: "50%",
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <span>&nbsp;&nbsp;&nbsp;</span>
                            <Cancel
                              sx={{
                                color: "red",
                                background: "white",
                                borderRadius: "50%",
                              }}
                            />
                          </>
                        )}
                      </span>
                    ) : (
                      "N/A"
                    )}
                    <br />
                    {userTopBid === topBidAmount ? (
                      <span>
                        {i18next.language === "fr-FR"
                          ? "Vous ne tenez plus l’enchère"
                          : "You are no longer the highest bidder"}
                      </span>
                    ) : (
                      <span>
                        {i18next.language === "fr-FR"
                          ? "Vous tenez l’enchère"
                          : "You are the highest bidder"}
                      </span>
                    )}
                  </td>
                  <td
                    className="selectTD"
                    style={{
                      textAlign: "left",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                      color:
                        topBidAmount === userTopBid && topBidAmount !== null
                          ? "green"
                          : "gray",
                    }}
                  >
                    <Select
                      className="select"
                      value={selectedBid}
                      onChange={handleBidSelect}
                      style={{ color: "white" }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            color: "white",
                            bgcolor: "gray",
                            "& .MuiMenuItem-root": { padding: "8px" }, // Adjust padding
                            "& .MuiListItem-root": { borderRadius: "8px" }, // Adjust border radius
                            "& .MuiListItem-root:hover": {
                              background: "#333",
                            }, // Hover effect
                          },
                        },
                      }}
                    >
                      {userBids
                        .filter((bid) => bid.lotId === lot._id)
                        .map((bid) => (
                          <MenuItem
                            key={bid._id}
                            value={bid._id}
                            style={{
                              color: "white",
                              border: "1px solid white",
                              borderRadius: "8px",
                            }}
                          >
                            {`${bid.amount} € - ${moment(bid.createdAt).format(
                              "LLL"
                            )}`}
                          </MenuItem>
                        ))}
                    </Select>
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <NavLink to={`/lot/${lot._id}`}>
                      <Button variant="contained" color="primary">
                        {i18next.language === "fr-FR" ? "ench +" : "bid +"}
                      </Button>
                    </NavLink>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { TableRow, TableCell, Select, MenuItem, Button } from "@mui/material";
import moment from "moment";
import { NavLink } from "react-router-dom";
import { CheckCircle, Cancel } from "@mui/icons-material"; // Import Material-UI icons
import i18next from "i18next";
import io from 'socket.io-client';


const socket = io(`${process.env.REACT_APP_API_URL}`);

const fetchLots = async (setLots) => {
  try {
    const lotData = await axios.get(`${process.env.REACT_APP_API_URL}api/lot`);
    setLots(lotData.data);
  } catch (error) {
    console.error("Error fetching lots:", error);
  }
};


export default function BidCard(props) {
  const bids = props.bids;
  const loggedInUserId = useSelector((state) => state.userReducer._id);
  const [userBids, setUserBids] = useState([]);
  const [lots, setLots] = useState([]);
  const [selectedBid, setSelectedBid] = useState("");

  useEffect(() => {
    setUserBids(bids.filter((bid) => bid.bidderId === loggedInUserId));
  }, [bids, loggedInUserId]);

  useEffect(() => {
    fetchLots(setLots); 
  }, []);

  useEffect(() => {
    const handleDataSaved = () => {
      fetchLots(setLots); // Fetch lots to refresh data
    };

    // Listen for 'dataSaved' event from server
    socket.on('dataSaved', () => {
      console.log('Received dataSaved event from server');
      handleDataSaved();
    });
    

    // Clean up function to remove event listener when component unmounts
    return () => {
      socket.off('dataSaved', handleDataSaved);
    };
  }, []);

  const handleBidSelect = (event) => {
    setSelectedBid(event.target.value);
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
              {i18next.language === "fr-FR" ? "Titre" : "Title"}
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                borderBottom: "1px solid #ddd",
              }}
            >
              {i18next.language === "fr-FR" ? "Nb Enchérisseurs" : "Bidders"}
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                borderBottom: "1px solid #ddd",
              }}
            >
              {i18next.language === "fr-FR" ? "Enchère Max" : "Max Bid"}
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
                    <strong>{lot.title}</strong>
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    {bidderCount}
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
                      color: userTopBid === topBidAmount ? "green" : "red",
                    }}
                  >
                    {userTopBid ? (
                      <span>
                        {userTopBid} €
                        {userTopBid === topBidAmount ? (
                          <CheckCircle sx={{ color: "green" }} />
                        ) : (
                          <Cancel sx={{ color: "red" }} />
                        )}
                      </span>
                    ) : (
                      "N/A"
                    )}
                    <br />
                    {userTopBid === topBidAmount ? (
                      <span>
                        {i18next.language === "fr-FR"
                          ? "Votre offre est la plus élevée"
                          : "Your offer is the highest"}
                      </span>
                    ) : (
                      <span>
                        {i18next.language === "fr-FR"
                          ? "Votre offre n'est pas la plus élevée"
                          : "Your offer is not the highest"}
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

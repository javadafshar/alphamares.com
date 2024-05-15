import React, { useEffect, useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import UpdateProfil from "../../components/Profil/UpdateProfil";
import Follows from "../../components/Profil/Follows";
import Bills from "../../components/Profil/Bills";
import { useTranslation } from "react-i18next";
import AuctionsList from "../../components/Admin/Auction/AuctionsList";
import BidCard from "../../components/Bid/BidCard";
import axios from "axios";

const Profil = () => {
  const [index, setIndex] = React.useState(0);
  const [t] = useTranslation();
  const [bids, setBids] = useState([]);

  useEffect(() => {
    const storedIndex = parseInt(sessionStorage.getItem("activeTab"));
    if (!isNaN(storedIndex) && storedIndex >= 0 && storedIndex <= 3) {
      setIndex(storedIndex);
    }
  }, []);

  //
  useEffect(() => {
    // Fetch bid data
    axios
      .get(`${process.env.REACT_APP_API_URL}api/bid`)
      .then((response) => {
        setBids(response.data);
      })
      .catch((error) => {
        console.error("Error fetching bids:", error);
      });
  }, []);

  const handleChange = (event, newIndex) => {
    setIndex(newIndex);
    sessionStorage.setItem("activeTab", newIndex.toString());
  };

  return (
    <div>
      <div className="subNavBar">
        <Tabs
          value={index}
          onChange={handleChange}
          textColor="inherit"
          indicatorColor="primary"
          centered
        >
          <Tab label={t("Infos.My-Infos")} />
          <Tab label={t("Followed.My-Follows")} />
          <Tab label={t("Mes enchères en cours")} />
          <Tab label={t("Bill.Bills")} />
        </Tabs>
        {index === 0 && <UpdateProfil />}
        {index === 1 && <Follows />}
        {index === 2 && <BidCard bids={bids} />}
        {index === 3 && <Bills />}
      </div>
    </div>
  );
};

export default Profil;

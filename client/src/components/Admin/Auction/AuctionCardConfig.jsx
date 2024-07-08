import React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import moment from "moment";
import axios from "axios";
import { NavLink } from "react-router-dom";
import ConfirmDialog from "../ConfirmDialog";
import { useTranslation } from "react-i18next";
import { whenFunction } from "../../Chrono";

export default function AuctionCardConfig(props) {
  const auction = props.auction;
  const [open, setOpen] = React.useState(false);
  const { i18n } = useTranslation();

  async function deleteAuction() {
    await axios
      .delete(`${process.env.REACT_APP_API_URL}api/auction/${auction._id}`)
      .then((res) => alert(`${auction.title} : supprimée`))
      .catch((err) => console.log(err));
    setOpen(false);
  }

  return (
    <>
      <Card className="card">
        <CardMedia
          component="img"
          alt="Auction pictures"
          image={`${process.env.REACT_APP_API_URL}${auction.picture}`}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {i18n.language === "fr-FR" ? auction.title : auction.titleEN}
          </Typography>
          <Typography gutterBottom variant="h5" component="div">
            {whenFunction(auction.start, auction.end) === "now" && "EN COURS"}
            {whenFunction(auction.start, auction.end) === "coming" && "A VENIR"}
            {whenFunction(auction.start, auction.end) === "passed" && "FINIT"}
          </Typography>
          <Typography gutterBottom variant="h7" component="div">
            {moment(auction.start).calendar()}
          </Typography>
          <Typography gutterBottom variant="h7" component="div">
            {moment(auction.end).calendar()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {i18n.language === "fr-FR"
              ? auction.description
              : auction.descriptionEN}
          </Typography>
        </CardContent>
        <CardActions sx={{ display: "flex", justifyContent: "center" }}>
          <NavLink to={`/admin/auction/${auction._id}`}>
            <Button variant="contained">Configuration</Button>
          </NavLink>
          <IconButton aria-label="delete" onClick={() => setOpen(true)}>
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>
      <ConfirmDialog
        message="supprimer la vente"
        open={open}
        yesFunction={deleteAuction}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

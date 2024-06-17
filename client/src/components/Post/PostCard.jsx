import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import { CardActions } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";
import moment from "moment/moment";
import ConfirmDialog from "./../Admin/ConfirmDialog";
import axios from "axios";
import EditPost from "./EditPost";

export default function PostCard({ post, inAdmin, fetchPosts }) {
  const [t, i18n] = useTranslation();
  const [openConfirmDeletePost, setOpenConfirmDeletePost] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  async function deletePost() {
    setOpenConfirmDeletePost(false);
    await axios
      .delete(`${process.env.REACT_APP_API_URL}api/post/${post._id}`)
      .then(() => fetchPosts())
      .catch((err) => alert(err));
  }

  function handleDeletePost(event) {
    event.preventDefault();
    setOpenConfirmDeletePost(true);
  }

  function handleEditPost(event) {
    event.preventDefault();
    setOpenEditDialog(true);
  }

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const messagePreview =
    i18n.language === "en-EN"
      ? truncateText(post.messageEN, 120)
      : truncateText(post.messageFR, 120);

  return (
    <div className="postCard">
      <NavLink to={`/media/${post._id}`}>
        <Card>
          <CardMedia
            component={post.picture !== "" ? "img" : "iframe"}
            alt="Picture of post"
            image={
              post.picture !== ""
                ? `${process.env.REACT_APP_API_URL}${post.picture}`
                : post.video
            }
          />
          <CardContent className="cardcontent">
            <div className="title">
              <h1>{i18n.language === "en-EN" ? post.titleEN : post.titleFR}</h1>
              <p
                dangerouslySetInnerHTML={{
                  __html:
                    i18n.language === "en-EN" ? post.messageEN : post.messageFR,
                }}
              />
            </div>
            <br />
            <div className="datee">
              <h2 className="date">{`${t("Media.PublishedOn")} ${moment(
                post.createdAt
              ).format("L")}`}</h2>
            </div>
          </CardContent>
          <CardActions className="CardActions" sx={{ marginRight: "auto" }}>
            {inAdmin && (
              <>
                <IconButton
                  sx={{ marginTop: "auto" }}
                  aria-label="edit"
                  onClick={handleEditPost}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  sx={{ marginTop: "auto" }}
                  aria-label="delete"
                  onClick={handleDeletePost}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </CardActions>
        </Card>
      </NavLink>
      <ConfirmDialog
        message="supprimer ce post"
        yesFunction={deletePost}
        open={openConfirmDeletePost}
        onClose={() => setOpenConfirmDeletePost(false)}
      />
      <EditPost
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        fetchPosts={fetchPosts}
        post={post}
      />
    </div>
  );
}

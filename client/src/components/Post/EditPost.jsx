import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { isEmpty } from "../../utils/Utils";

var Font = ReactQuill.Quill.import("formats/font");
Font.whitelist = ["arapey", "arial", "georgia", "helvetica", "times-new-roman"];
ReactQuill.Quill.register(Font, true);

const EditPost = ({ onClose, open, fetchPosts, post }) => {
  const [formData, setFormData] = useState({
    titleFR: "",
    titleEN: "",
    video: "",
    picture: "",
  });
  const [postPicture, setPostPicture] = useState("");
  const [textFR, setTextFR] = useState("");
  const [textEN, setTextEN] = useState("");

  useEffect(() => {
    if (post) {
      setFormData({
        titleFR: post.titleFR,
        titleEN: post.titleEN,
        video: post.video,
        picture: post.picture,
      });
      setTextFR(post.messageFR);
      setTextEN(post.messageEN);
      setPostPicture(post.picture);
    }
  }, [open, post]);

  const handlePicture = (e) => {
    setFormData({ ...formData, video: "" });
    setPostPicture(e.target.files[0]);
  };

  const handleVideo = (e) => {
    const embed = e.target.value.replace("watch?v=", "embed/");
    setFormData({ ...formData, video: embed.split("&")[0] });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTextFRChange = (content, delta, source, editor) => {
    setTextFR(editor.getHTML()); // Update textFR state with HTML content
  };

  const handleTextENChange = (content, delta, source, editor) => {
    setTextEN(editor.getHTML()); // Update textEN state with HTML content
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Submitting form data:", formData);

    const data = new FormData();
    data.append("titleFR", formData.titleFR);
    data.append("titleEN", formData.titleEN);
    data.append("messageFR", textFR); // Include updated textFR
    data.append("messageEN", textEN); // Include updated textEN
    data.append("picture", postPicture);
    data.append("video", formData.video);

    try {
      console.log("Sending request to server...");
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}api/post/${post._id}`,
        data
      );
      console.log("Server response:", response.data);
      fetchPosts();
      onClose();
    } catch (err) {
      console.error("Error updating post:", err);
      onClose();
      alert(
        err.response.data === "LIMIT_FILE_SIZE"
          ? "Erreur : le fichier est trop volumineux (8Mo max)"
          : "Une erreur s'est produite lors de la mise à jour du post. Veuillez réessayer."
      );
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      [{ font: Font.whitelist }],
      ["bold", "italic", "underline", "strike"],
      [
        { align: "" },
        { align: "center" },
        { align: "right" },
        { align: "justify" },
      ],
    ],
  };

  const formats = [
    "header",
    "font",
    "bold",
    "italic",
    "underline",
    "strike",
    "align",
  ];

  useEffect(() => {
    const editor = document.querySelector(".ql-editor");
    if (editor) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            // Handle added nodes if necessary
          }
        });
      });
      observer.observe(editor, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, []);

  return (
    <Dialog onClose={onClose} open={open} className="edit-post-dialog">
      <DialogTitle>
        Modifier le post
        <Button
          onClick={onClose}
          sx={{ position: "absolute", right: 10, top: 10 }}
        >
          &#10005;
        </Button>
      </DialogTitle>
      <DialogContent>
        <form className="form-containerEditpost" onSubmit={handleSubmit}>
          <div>
            <div className="field">
              <img src="./img/icons/french_flag.svg" alt="french flag" />
              <label>Titre:</label>
              <input
                type="text"
                name="titleFR"
                value={formData.titleFR}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={30}
              />
            </div>
            <div className="preview-editor">
              <ReactQuill
                value={textFR}
                modules={modules}
                formats={formats}
                placeholder="Message en français..."
                onChange={handleTextFRChange}
              />
            </div>
          </div>
          <br />
          <hr />
          <br />
          <div>
            <div className="field">
              <img src="./img/icons/UK_flag.svg" alt="UK flag" />
              <label>Titre:</label>
              <input
                type="text"
                name="titleEN"
                value={formData.titleEN}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={30}
              />
            </div>
            <div className="preview-editor">
              <ReactQuill
                value={textEN}
                modules={modules}
                formats={formats}
                placeholder="Message en anglais..."
                onChange={handleTextENChange}
              />
            </div>
          </div>
          <div>
            {isEmpty(postPicture) && (
              <div className="field">
                <label>
                  Lien d'une vidéo (notez bien que c'est soit une video soit une
                  image) :
                </label>
                <input
                  type="text"
                  name="video"
                  value={formData.video}
                  onChange={handleVideo}
                />
              </div>
            )}
            {isEmpty(formData.video) && (
              <div className="field">
                <label>Charger une image :</label>
                <input
                  type="file"
                  id="file-upload"
                  name="file"
                  accept=".jpg, .jpeg, .png"
                  onChange={handlePicture}
                />
              </div>
            )}
          </div>
          <br />
          <button type="submit">Modifier le post</button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPost;

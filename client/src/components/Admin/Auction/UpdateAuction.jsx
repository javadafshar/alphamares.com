import React, { useState } from "react";
import axios from "axios";
import moment from "moment";

export default function UpdateAuction(props) {
  const [formData, setFormData] = useState({
    title: props.auction.title,
    titleEN: props.auction.titleEN,
    start: props.auction.start,
    end: props.auction.end,
    commission: props.auction.commission,
    description: props.auction.description,
    descriptionEN: props.auction.descriptionEN,
  });

  const [file, setFile] = useState();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("titleEN", formData.titleEN);
    data.append("description", formData.description);
    data.append("descriptionEN", formData.descriptionEN);
    data.append("picture", file);

    if (props.auction.saleType === "auction") {
      data.append("start", formData.start);
      data.append("end", formData.end);
      data.append("commission", formData.commission);
    }

    axios
      .put(
        `${process.env.REACT_APP_API_URL}api/auction/${props.auction._id}`,
        data
      )
      .then(() => props.onClose())
      .catch((err) => {
        alert(
          err.response.data === "LIMIT_FILE_SIZE"
            ? "Erreur : le fichier est trop VOLUMINEUX (8Mo max)"
            : err.response.data
        );
      });
  };

  return (
    <div style={{ margin: "5% 1%", padding: "5%" }}>
      <form>
        <label>
          Titre :
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            minLength={3}
            maxLength={30}
            style={{ border: "1px solid" }}
          />
        </label>
        <br />
        <label>
          Titre en anglais :
          <input
            type="text"
            name="titleEN"
            value={formData.titleEN}
            onChange={handleChange}
            minLength={3}
            maxLength={30}
            style={{ border: "1px solid" }}
          />
        </label>
        <br />
        {props.auction.saleType === "auction" && (
          <>
            <label>
              Début :
              <input
                type="datetime-local"
                name="start"
                value={moment(formData.start).format("YYYY-MM-DDTHH:mm")}
                onChange={handleChange}
                style={{ border: "1px solid" }}
              />
            </label>
            <br />
            <label>
              Fin :
              <input
                type="datetime-local"
                name="end"
                value={moment(formData.end).format("YYYY-MM-DDTHH:mm")}
                onChange={handleChange}
                style={{ border: "1px solid" }}
              />
            </label>
            <br />
            <label>
              Commission acheteur (en %):
              <input
                type="number"
                name="commission"
                step={0.1}
                value={formData.commission}
                onChange={handleChange}
                required
                style={{ border: "1px solid" }}
              />
            </label>
            <br />
          </>
        )}
        <label>
          Description:
          <textarea
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            minLength={3}
            maxLength={300}
            style={{ border: "1px solid" }}
          />
        </label>
        <br />
        <label>
          Description en anglais :
          <textarea
            type="text"
            name="descriptionEN"
            value={formData.descriptionEN}
            onChange={handleChange}
            minLength={3}
            maxLength={300}
            style={{ border: "1px solid" }}
          />
        </label>
        <label htmlFor="file">Charger une image</label>
        <input
          type="file"
          id="file"
          name="file"
          accept=".jpg, .jpeg, .png"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <br />
        <button onClick={handleSubmit}>Éditer la vente</button>
      </form>
    </div>
  );
}

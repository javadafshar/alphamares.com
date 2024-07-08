import React, { useState } from "react";
import axios from "axios";
import moment from "moment";

export default function UpdateAuction(props) {
  const [formData, setFormData] = useState({
    title: props.auction.title,
    titleEN: props.auction.titleEN,
    start: moment(props.auction.start).format("YYYY-MM-DDTHH:mm"),
    end: moment(props.auction.end).format("YYYY-MM-DDTHH:mm"),
    commission: props.auction.commission,
    description: props.auction.description,
    descriptionEN: props.auction.descriptionEN,
    subtitle: props.auction.subtitle || "",
  });

  const [file, setFile] = useState();

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "start" || name === "end") {
      const formattedDate = moment(value).format("YYYY-MM-DDTHH:mm");
      setFormData({ ...formData, [name]: formattedDate });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("titleEN", formData.titleEN);
      data.append("description", formData.description);
      data.append("descriptionEN", formData.descriptionEN);

      if (file) {
        data.append("picture", file);
      }

      if (props.auction.saleType === "auction") {
        data.append("start", formData.start);
        data.append("end", formData.end);
        data.append("commission", formData.commission);
        data.append("saleType", "auction");
      } else if (props.auction.saleType === "private_sale") {
        data.append("subtitle", formData.subtitle);
        data.append("saleType", "private_sale");
      }

      await axios.put(
        `${process.env.REACT_APP_API_URL}api/auction/${props.auction._id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      props.onClose();
    } catch (err) {
      console.error("Error updating auction:", err);
      alert(
        err.response.data === "LIMIT_FILE_SIZE"
          ? "Error: File size exceeds limit (8MB max)"
          : err.response.data
      );
    }
  };

  return (
    <div style={{ margin: "5% 1%", padding: "5%" }}>
      <form onSubmit={handleSubmit}>
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
            required
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
            required
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
                value={formData.start}
                onChange={handleChange}
                style={{ border: "1px solid" }}
                required
              />
            </label>
            <br />
            <label>
              Fin :
              <input
                type="datetime-local"
                name="end"
                value={formData.end}
                onChange={handleChange}
                style={{ border: "1px solid" }}
                required
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
        {props.auction.saleType === "private_sale" && (
          <>
            <label>
              Sous-titre :
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                minLength={3}
                maxLength={50}
                style={{ border: "1px solid" }}
                required
              />
            </label>
            <br />
          </>
        )}
        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            minLength={3}
            maxLength={300}
            style={{ border: "1px solid" }}
            required
          />
        </label>
        <br />
        <label>
          Description en anglais :
          <textarea
            name="descriptionEN"
            value={formData.descriptionEN}
            onChange={handleChange}
            minLength={3}
            maxLength={300}
            style={{ border: "1px solid" }}
            required
          />
        </label>
        <br />
        <label htmlFor="file">Charger une image</label>
        <input
          type="file"
          id="file"
          name="file"
          accept=".jpg, .jpeg, .png"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <br />
        <button type="submit">Éditer la vente</button>
      </form>
    </div>
  );
}

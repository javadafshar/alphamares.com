import React, { useState } from "react";
import axios from "axios";

function CreateAuction(props) {
  const [formData, setFormData] = useState({
    title: "",
    titleEN: "",
    start: "",
    end: "",
    description: "",
    descriptionEN: "",
    commission: "",
    saleType: "auction", // Default saleType is auction
    subtitle: "", // Subtitle field for private sale
  });

  const [file, setFile] = useState();
  const [isAuction, setIsAuction] = useState(true); // Boolean to track auction vs private sale

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = () => {
    setIsAuction(!isAuction); // Toggle between auction and private sale
    setFormData({
      ...formData,
      saleType: isAuction ? "private_sale" : "auction",
      start: "", // Clear start and end dates for private sale
      end: "",
      commission: "", // Clear commission for private sale
      subtitle: "", // Clear subtitle when switching to auction
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("titleEN", formData.titleEN);
    data.append("description", formData.description);
    data.append("descriptionEN", formData.descriptionEN);
    data.append("saleType", formData.saleType);

    // Append auction-specific fields if it's an auction
    if (formData.saleType === "auction") {
      data.append("start", formData.start);
      data.append("end", formData.end);
      data.append("commission", formData.commission);
    } else if (formData.saleType === "private_sale") {
      data.append("subtitle", formData.subtitle); // Include subtitle for private sale
    }

    data.append("picture", file);

    axios
      .post(`${process.env.REACT_APP_API_URL}api/auction/register`, data)
      .then((res) => {
        props.onClose();
        console.log(res.data);
      })
      .catch((err) => {
        alert(
          err.response.data === "LIMIT_FILE_SIZE"
            ? "Erreur : le fichier est trop VOLUMINEUX (8Mo max)"
            : err.response.data
        );
      });
  };

  return (
    <div
      style={{
        margin: "5% 1%",
        padding: "5%",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <label style={{ marginBottom: "10px" }}>
          Titre :
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            minLength={3}
            style={{ border: "1px solid", padding: "5px", marginTop: "5px" }}
          />
        </label>
        <label style={{ marginBottom: "10px" }}>
          Titre en anglais :
          <input
            type="text"
            name="titleEN"
            value={formData.titleEN}
            onChange={handleChange}
            required
            minLength={3}
            style={{ border: "1px solid", padding: "5px", marginTop: "5px" }}
          />
        </label>
        <label
          className="checkbox-container"
          style={{ marginBottom: "10px", alignItems: "center" }}
        >
          Vente à l'amiable &nbsp;{"    "}
          <input
            type="checkbox"
            checked={!isAuction}
            onChange={handleCheckboxChange}
            style={{
              cursor: "pointer",
              width: "20px",
              height: "20px",
              marginRight: "10px",
              boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.3)",
            }}
          />
        </label>
        {formData.saleType === "private_sale" && (
          <label style={{ marginBottom: "10px" }}>
            Sous-titre :
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              required
              minLength={3}
              style={{ border: "1px solid", padding: "5px", marginTop: "5px" }}
            />
          </label>
        )}
        {isAuction && (
          <>
            <label style={{ marginBottom: "10px" }}>
              Début :
              <input
                type="datetime-local"
                name="start"
                value={formData.start}
                onChange={handleChange}
                required={formData.saleType === "auction"}
                style={{
                  border: "1px solid",
                  padding: "5px",
                  marginTop: "5px",
                }}
              />
            </label>
            <label style={{ marginBottom: "10px" }}>
              Fin :
              <input
                type="datetime-local"
                name="end"
                value={formData.end}
                onChange={handleChange}
                required={formData.saleType === "auction"}
                style={{
                  border: "1px solid",
                  padding: "5px",
                  marginTop: "5px",
                }}
              />
            </label>
            <label style={{ marginBottom: "10px" }}>
              Commission acheteur (en %) :
              <input
                type="number"
                name="commission"
                step={0.1}
                value={formData.commission}
                onChange={handleChange}
                required={formData.saleType === "auction"}
                style={{
                  border: "1px solid",
                  padding: "5px",
                  marginTop: "5px",
                }}
              />
            </label>
          </>
        )}
        <label style={{ marginBottom: "10px" }}>
          Description :
          <textarea
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={300}
            style={{
              border: "1px solid",
              padding: "5px",
              marginTop: "5px",
              resize: "vertical",
            }}
          />
        </label>
        <label style={{ marginBottom: "10px" }}>
          Description en anglais :
          <textarea
            type="text"
            name="descriptionEN"
            value={formData.descriptionEN}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={300}
            style={{
              border: "1px solid",
              padding: "5px",
              marginTop: "5px",
              resize: "vertical",
            }}
          />
        </label>
        <label style={{ marginBottom: "10px" }} htmlFor="file">
          Charger une image :
          <input
            type="file"
            id="file"
            name="file"
            accept=".jpg, .jpeg, .png"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginTop: "5px" }}
          />
        </label>
        <button
          type="submit"
          onClick={handleSubmit}
          style={{
            marginTop: "10px",
            padding: "10px",
            cursor: "pointer",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Créer la vente
        </button>
      </form>
    </div>
  );
}

export default CreateAuction;

import React, { useEffect, useState } from "react";
import { UidContext } from "./components/AppContext";
import Index from "./pages/Routes";
import axios from "axios";
import { useDispatch } from "react-redux";
import { getUser } from "./actions/user.actions";
import { getUsers } from "./actions/users.actions";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import i18n from "./i18n";
export const gold = "rgb(239, 193, 109)";
export const green = "#0c3c3c";

function App() {
  const [uid, setUid] = useState(null);

  const dispatch = useDispatch();

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const fetchToken = async () => {
      await axios({
        method: "get",
        url: `${process.env.REACT_APP_API_URL}api/jwtid`,
        withCredentials: true,
      })
        .then((res) => setUid(res.data))
        .catch((err) => console.log("No token"));
    };
    fetchToken();

    if (uid) dispatch(getUser(uid));
    dispatch(getUsers());
  }, [uid, dispatch]); // à chaque fois que le uid change il refait "useEffect"

  moment.locale(i18n.language);

  return (
    <UidContext.Provider value={{ uid, setUid }}>
      {" "}
      {/*Permet d'avoir UId dans le context */}
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Index />
      </LocalizationProvider>
    </UidContext.Provider>
  );
}

export default App;

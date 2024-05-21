const express = require("express");
const http = require("http");
const {
    initializeSocket
} = require("./socket");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");

const userRoutes = require("./routes/user.routes");
const lotRoutes = require("./routes/lot.routes");
const postRoutes = require("./routes/post.routes");
const auctionRoutes = require("./routes/auction.routes");
const utilsRoutes = require("./routes/utils.routes");
const bidRoutes = require("./routes/bid.routes");
const verificationRoutes = require("./routes/verification.routes");
const proposalRoutes = require("./routes/proposal.routes");
const saleRoutes = require("./routes/sale.routes");
const passwordRoutes = require("./routes/password.routes");
const {
    requireAuth,
    checkUserForBilling,
    checkUserForProposal
} = require("./middleware/auth.middleware");
const {
    connectDBWithRetry
} = require("./config/db");

if (!process.env.NODE_ENV) {
    require("dotenv").config({
        path: "./config/dev.env"
    });
}

const app = express();
const server = http.createServer(app);

const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    allowedHeaders: ["sessionId", "Content-Type"],
    exposeHeaders: ["sessionId"],
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    preflightContinue: false,
};

app.use(cors(corsOptions));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.json({
    limit: "10mb"
}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: "10mb"
}));
app.use(cookieParser());
app.use(checkUserForBilling, checkUserForProposal);

app.get("/api/jwtid", requireAuth, (req, res) => res.status(200).send(res.locals.userId));
app.use("/api/user", userRoutes);
app.use("/api/lot", lotRoutes);
app.use("/api/post", postRoutes);
app.use("/api/auction", auctionRoutes);
app.use("/api/utils", utilsRoutes);
app.use("/api/bid", bidRoutes);
app.use("/api/verif", verificationRoutes);
app.use("/api/proposal", proposalRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/password", passwordRoutes);




initializeSocket(server).then((io) => {
    app.locals.io = io;


    server.listen(process.env.PORT, async () => {
        console.log("\u001b[32;1m");
        console.log(`Listening on port ${process.env.PORT}`);
        console.log("Environment:", process.env.NODE_ENV);

        await connectDBWithRetry(process.env.MONGO_DB_ADDRESS);

        if (process.env.NODE_ENV === "development") {
            console.log("\u001b[36;1m");
            console.log("Request analysis :\n\u001b[0m");
        }
    });
}).catch((error) => {
    console.error("Error initializing socket:", error);
});
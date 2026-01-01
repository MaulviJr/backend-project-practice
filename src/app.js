import cookieParser from 'cookie-parser';
import express from 'express'
import cors from "cors"
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({
    limit: "20kb",

}));
app.use(express.urlencoded({extended:true, limit:"20kb"}));
app.use(express.static("public"));
app.use(cookieParser())

import router from './routes/user.route.js';
import videoRouter  from './routes/video.route.js';
import tweetRouter  from './routes/tweet.route.js';
import subscriptionRouter from "./routes/subscription.route.js";

app.use("/api/v1/users",router);
app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/tweets",tweetRouter);
app.use("/api/v1/subscription",subscriptionRouter);


export {app};
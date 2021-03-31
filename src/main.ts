import express from "express";
import { auth, requiresAuth } from "express-openid-connect";

const app = express();
const port = 8080;

app.use(
    auth({
        issuerBaseURL: process.env.OIDC_ISSUER,
        baseURL: process.env.OIDC_BASE_URL,
        clientID: process.env.OIDC_CLIENT_ID,
        secret: process.env.OIDC_SECRET,
        authRequired: false
    })
);

app.get("/profile", requiresAuth(), (req, res) => {
    console.log((req as any).oidc.user);
    res.send(`Hello ${(req as any).oidc.user.name}`);
});

app.get("/", (req, res) => {
    res.send(`Hello world`);
});

app.listen(port, () => {
    console.log(
        `Stackoverflow Light backend started at http://localhost:${port}`
    );
});

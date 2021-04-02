import app from "./api/api";

const port = 8080;

app.listen(port, () => {
    console.log(
        `Stackoverflow Light backend started at http://localhost:${port}`
    );
});

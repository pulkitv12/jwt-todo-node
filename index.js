const app = require("./app");
const { API_PORT } = process.env;

const PORT = process.env.PORT || API_PORT;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
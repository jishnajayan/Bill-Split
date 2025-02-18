const express = require('express')
const app = express();

app.get('/', (req, res) => {
    res.send('Hello, World!'); // Sends the response to the client
});

app.listen(8000, () => {
    console.log(`Server listening at http://localhost:8000`);
});

console.log("Hello, World!");

// Hello, World API
const express = require('express');
const app = express();
const port = 3000;


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/api/top', (req, res) => {
    res.send('/api/top');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
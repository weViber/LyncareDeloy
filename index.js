const express = require('express')
const cors = require("cors");
const path = require('path');
const mongo = require('./src/mongo')

const app = express()
const PORT = 4000

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const apiRouter = require('./src/routes/index');

app.use(express.static(path.join(__dirname, 'src/build')));
app.use(express.static(path.join(__dirname, '/public')));

mongo
    .connectToDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`API listening on PORT ${PORT}`)
        })

    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error)
        throw error
    })

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/build', 'index.html'));
});

app.use('/api', apiRouter)

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/build', 'index.html'));
});


// Export the Express API
module.exports = app
require('dotenv').config()

const express = require('express')
const cors = require("cors");
const path = require('path');
const mongo = require('./src/mongo')

const app = express()
const PORT = 8080

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const apiRouter = require('./src/routes/index');

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

app.use('/api', apiRouter)

module.exports = app
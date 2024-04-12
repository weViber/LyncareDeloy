const express = require('express');

const router = express.Router();

const emailRouter = require('./email.routes');

router.use('/email', emailRouter);

module.exports = router;
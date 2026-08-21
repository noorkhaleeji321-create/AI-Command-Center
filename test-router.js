const express = require('express');
const app = express();
const router = express.Router();
router.post('/test', (req, res) => res.json({ ok: true }));
app.use('/api1', router);
app.use('/api2', router);
app.post('/api1/test', (req, res) => console.log('1'));
app.listen(3002, () => console.log('started'));

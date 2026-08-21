const express = require('express');
const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.text({ limit: "10mb", type: "*/*" }));
app.post('/test', (req, res) => {
  res.json({ type: typeof req.body, body: req.body });
});
app.listen(3001, () => console.log('started'));

const express = require('express');

const app = express();
const router = express.Router();

const path = `${__dirname}/dist`;
const config = {
  host: '0.0.0.0',
  name: 'kronologic-web-app-service',
  port: 8080,
};

router.use((req, res, next) => {
  console.log(`/${req.method}`);
  next();
});

router.get('/', (req, res) => {
  res.sendFile(`${path}/index.html`);
});

app.use(express.static(path));
app.use('/*', router);

app.listen(config.port, config.host, () =>
  console.log(
    `${config.name} running on ${config.host}:${config.port}`,
  ),
);

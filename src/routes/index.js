// Este archivo sera nuestro sistema de routing

const homeRoutes = require('./home.router');

function routerApi(app) {
    app.use('/api/v1/', homeRoutes);
}


module.exports = routerApi;

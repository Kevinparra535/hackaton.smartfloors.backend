// Este archivo sera nuestro sistema de routing

const homeRoutes = require('./home.router');
const floorsRoutes = require('./floors.router');

function routerApi(app) {
    app.use('/api/v1/', homeRoutes);
    app.use('/api/v1/', floorsRoutes);
}


module.exports = routerApi;

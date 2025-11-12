// Este archivo sera nuestro sistema de routing

const homeRoutes = require('./home.router');
const floorsRoutes = require('./floors.router');
const emailRoutes = require('./email.router');
const exportRoutes = require('./export.router');

function routerApi(app) {
    app.use('/api/v1/', homeRoutes);
    app.use('/api/v1/', floorsRoutes);
    app.use('/api/v1/email', emailRoutes);
    app.use('/api/v1/export', exportRoutes);
}


module.exports = routerApi;

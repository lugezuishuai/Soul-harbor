// const proxy = require('http-proxy-middleware');

// module.exports = function(app) {
//     app.use(proxy('/api/**/*.action', {
//         target: 'http://localhost:4000/',
//         changeOrigin: true,
//         pathRewrite(path) {
//             return path.replace('/api', '/').replace('.action', '.json');
//         }
//     }));
// };

module.exports = {
  developServer: {
    proxy: [
      {
        path: '/api',
        changeOrigin: true,
        target: 'http://localhost:4001',
        headers: { 'Access-Control-Allow-Origin': '*' },
        // pathRewrite(path) {
        //     return path.replace('/api', '/') + '.json';
        // }
      }
    ],
  }
}
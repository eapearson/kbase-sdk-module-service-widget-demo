const { createProxyMiddleware } = require('http-proxy-middleware');

// Strangely, /index.html is the root path that CRA dev container sets.
// const pluginsRoot = '/index.html/deploy/plugins/';

module.exports = function (app) {
        app.use(
            '/services/servicewidgetdemo',
            createProxyMiddleware({
                target: 'http://servicewidgetdemo:5000/',
                changeOrigin: true,
                pathRewrite: { '^/services/servicewidgetdemo': '' },
                // onProxyReq: (a, b) => {
                //     console.log('on Proxy Req', a, b);
                // },
                on: {
                    proxyReq: (proxyReq, req, res) => {
                        console.log('on proxy req', proxyReq, req ,res)
                    },
                    error: (err) => {
                        console.log('on error', err);
                    }
                }
            }
        ));
      app.use(
        '/services',
        createProxyMiddleware({
          target: 'https://ci.kbase.us',
          changeOrigin: true, logger: console
        })
      );
      app.use(
        '/dynserv',
        createProxyMiddleware({
          target: 'https://ci.kbase.us',
          changeOrigin: true, logger: console
        })
      );
      //  app.use(
      //   '/services/servicewidgetdemo',
      //   createProxyMiddleware({
      //     target: 'http://servicewidgetdemo:5000',
      //     changeOrigin: true, logger: console
      //   })
      // );


    // app.use(
    //     pluginsRoot,
    //     createProxyMiddleware({
    //         target: 'http://kbase-ui-deploy:80/plugins/',
    //         changeOrigin: true,
    //         pathRewrite: { [`^${pluginsRoot}`]: '' }
    //     })
    // );
    // app.use(
    //     '/modules/plugins',
    //     createProxyMiddleware({
    //         target: 'http://kbase-ui-deploy:80/plugins/',
    //         changeOrigin: true,
    //         pathRewrite: { '^/modules/plugins': '' }
    //     })
    // );
    // app.use(
    //     '/deploy/plugins',
    //     createProxyMiddleware({
    //         target: 'http://kbase-ui-deploy:80/plugins/',
    //         changeOrigin: true,
    //         pathRewrite: { '^/deploy/plugins': '' }
    //     })
    // );
    // app.use(
    //     '/plugins',
    //     createProxyMiddleware({
    //         target: 'http://kbase-ui-deploy:80/plugins/',
    //         changeOrigin: true,
    //         pathRewrite: { '^/plugins': '' }
    //     })
    // );
    // app.use(
    //     '/deploy',
    //     createProxyMiddleware({
    //         target: 'http://kbase-ui-deploy:80/deploy/',
    //         changeOrigin: true,
    //         pathRewrite: { '^/deploy': '' }
    //     })
    // );
    // app.use(
    //     '/build',
    //     createProxyMiddleware({
    //         target: 'http://kbase-ui-deploy:80/build/',
    //         changeOrigin: true,
    //         pathRewrite: { '^/build': '' }
    //     })
    // );
};
const path = require('path');

module.exports = {
  devServer: {
    port: 8081,
  },
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'), // Alias '@' to the 'src' directory
      },
    },
  },
};

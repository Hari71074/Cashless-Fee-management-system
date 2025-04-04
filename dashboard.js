const path = require('path');

module.exports = {
  entry: {
    main: './script.js', // For your login page (if you still need it bundled separately)
    dashboard: './dashboard.js' // For your dashboard page
  },
  output: {
    filename: '[name]-bundle.js', // Use [name] to create separate bundles
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
  },
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, '/'),
    },
    port: 8080,
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  resolve: {
    fallback: {
      "buffer": require.resolve("buffer")
    }
  }
};
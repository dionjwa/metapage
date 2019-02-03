module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: {
    metapage: './build-metapage.hxml',
    metaframe: './build-metaframe.hxml'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/docs/js'
  },
  module: {
    rules: [
      // all files with hxml extension will be handled by `haxe-loader`
      {
        test: /\.hxml$/,
        loader: 'haxe-loader',
        options: {
          debug: true,
        }
      }
    ]
  }
}
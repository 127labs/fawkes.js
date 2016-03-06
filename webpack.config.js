const getConfig = require('hjs-webpack')

module.exports = getConfig({
  in: 'src/index.js',
  out: 'dist',
  output: {
    filename: 'fawkes.js',
    library: 'Fawkes',
    libraryTarget: 'umd'
  },
  clearBeforeBuild: true,
  devServer: {
    stats: {
      colors: true
    }
  },
  html: false
})

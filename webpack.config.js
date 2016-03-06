const getConfig = require('hjs-webpack')

module.exports = getConfig({
  in: 'src/index.js',
  out: 'dist',
  output: {
    filename: 'index.js'
  },
  clearBeforeBuild: true,
  devServer: {
    stats: {
      colors: true
    }
  },
  html: false
})

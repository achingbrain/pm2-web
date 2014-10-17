/*
process.on('uncaughtException', function uncaughtListener(err) {
  console.info('i caught an exception')
})
*/
setTimeout(function() {
  throw new Error('panic!')
}, 1000)

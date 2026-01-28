module.exports = function (options, webpack) {
  return {
    ...options,
    watchOptions: {
      poll: 1000, // Check for changes every second
      aggregateTimeout: 300, // Delay before rebuilding
      ignored: /node_modules/,
    },
  };
};

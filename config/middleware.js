module.exports = {
  settings: {
    tmpClean: {
      enabled: true,
    },
    cors: {
      enabled: true,
    },
    parser: {
      enabled: true,
      multipart: true,
      includeUnparsed: true,
    },
    singleSession: {
      enabled: true
    },
    xframe: {
      enabled: false
    }
  }
};
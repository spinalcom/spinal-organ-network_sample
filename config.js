module.exports = {
  spinalConnector: {
    user: process.env.SPINAL_USER_ID || 168, // user id
    password: process.env.SPINAL_USER_ID ||
      "JHGgcz45JKilmzknzelf65ddDadggftIO98P", // user password
    host: process.env.SPINALHUB_IP || "localhost", // can be an ip address
    port: process.env.SPINALHUB_PORT || 7777 // port
  },
  file: {
    // path to a digital twin in spinalhub filesystem
    path: process.env.SPINAL_DTWIN_PATH || '/__users__/admin/deiv4',
  },
  organ: {
    contextName: "Network",
    contextType: "Network",
    networkType: "NetworkVirtual"
  }
};

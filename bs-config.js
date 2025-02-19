module.exports = {
    proxy: "http://localhost:3000", // Proxy your Express server
    files: ["views/**/*.ejs", "public/**/*.css", "public/**/*.js"], // Files to watch
    port: 3001, // BrowserSync runs on port 3001
    notify: false, // Disable the BrowserSync notification
    open: false, // Don't automatically open the browser
  };
  
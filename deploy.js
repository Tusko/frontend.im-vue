const FtpDeploy = require("ftp-deploy");
const ftpDeploy = new FtpDeploy();
require("dotenv").config({ path: `./.env.local` });

const log = (...args) => console.log("→", ...args);

log("🚚", `Uploading for ${process.env.NODE_ENV}`);

const config = {
  user: process.env.FTP_USER,
  // Password optional, prompted if none given
  password: process.env.FTP_PASS,
  host: process.env.FTP_HOST,
  port: 21,
  localRoot: __dirname + "/dist",
  remoteRoot: "/",
  // include: ['*', '**/*'],      // this would upload everything except dot files
  include: ["*"],
  // e.g. exclude sourcemaps, and ALL files in node_modules (including dot files)
  exclude: ["**/*.map", "node_modules/**", "node_modules/**/.*"],
  // delete ALL existing files at destination before uploading, if true
  deleteRemote: true,
  deleteRoot: false,
  // Passive mode is forced (EPSV command is not sent)
  forcePasv: false
};

ftpDeploy
  .deploy(config)
  .then(() => log("✅", " DEPLOY Finish"))
  .catch(err => log("❌", " DEPLOY Error", err));

ftpDeploy.on("uploading", data => {
  log(
    "‌📦",
    ` uploading ${parseInt(
      (data.transferredFileCount / data.totalFilesCount) * 100
    )}% (${data.transferredFileCount}/${data.totalFilesCount})`,
    data.filename
  );
});

ftpDeploy.on("upload-error", function(data) {
  log("❌", " DEPLOY Error", data.err);
});

// ftpDeploy.on("log", function(data) {
//   log("🚚", " LOG", data);
// });

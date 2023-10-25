const { execSync } = require("child_process");

console.log("Start install packages in core ...");
execSync("npm --prefix ../core install");
console.log("Install packages finished in core", { stdio: "inherit" });
console.log("Build started in core ....");
execSync("npm --prefix ../core run build", { stdio: "inherit" });
console.log("Build finished in core");

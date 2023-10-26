const { execSync } = require("child_process");

[
  {
    name: "skcore",
    src: "../core/dist",
    dest: "node_modules/skcore",
  },
].forEach((pkg) => {
  execSync(`rm -rf ${pkg.dest}`);
  execSync(`cp -R ${pkg.src} ${pkg.dest}`);
  console.log(`${pkg.name} Copied`);
});

module.exports.run = function(thisWorker) {
    require("babel-register")({
        "presets": ["es2015", "stage-0"],
        plugins: ["syntax-async-generators", "syntax-async-functions"]
    });
  require("babel-polyfill");

}

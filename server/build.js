var nexe = require('nexe');

nexe.compile({
    input: 'build/index.js', // where the input file is
    output: '.\\exe', // where to output the compiled binary
    nodeVersion: '5.1.0', // node version
    nodeTempDir: 'tmp', // where to store node source.
    // nodeConfigureArgs: ['opt', 'val'], // for all your configure arg needs.
    // nodeMakeArgs: ["-j", "4"], // when you want to control the make process.
    nodeVCBuildArgs: ["nosign", "x64"], // when you want to control the make process for windows.
                                        // By default "nosign" option will be specified
                                        // You can check all available options and its default values here:
                                        // https://github.com/nodejs/node/blob/master/vcbuild.bat
    python: 'C:\\python27', // for non-standard python setups. Or python 3.x forced ones.
    // resourceFiles: [ 'path/to/a/file' ], // array of files to embed.
    // resourceRoot: [ 'path/' ], // where to embed the resourceFiles.
    // flags: true, // use this for applications that need command line flags.
    // jsFlags: "--use_strict", // v8 flags
    framework: "node" // node, nodejs, or iojs
}, function(err) {
    if(err) {
        return console.log(err);
    }

     // do whatever
});

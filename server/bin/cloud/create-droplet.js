var config = require("config");
var digitalOceanConfig = config.get("digitalocean");
var Moniker = require("moniker");
var digitalocean = require("digitalocean");
var client = digitalocean.client(digitalOceanConfig.digitaloceanToken);
var names = Moniker.generator([Moniker.adjective, Moniker.noun]);

var instanceName = names.choose();

var options = {
    name: instanceName,
    region: "nyc3",
    size: "4gb",
    image: 18254204
};

client.droplets.create(options, function(err, response) {
    if (!err) {
        client.droplets.get(response.id, function(err, res) {
            if (!err) {
                console.log(res);
            }
        });
    } else {
        console.error(err);
    }
});

import faker from "faker";
import chance from "chance";

function rnd(max) {
    return Math.floor(Math.random() * max);
}

const responses = [
    "My makers choose to remain nameless for now.",
    "My consciousness is still forming, so I can't quite say yet."
];

const queryIdentity = {
    getResponse: function(intent) {
        return responses[rnd(responses.length)];
    }
};

module.exports = queryIdentity;

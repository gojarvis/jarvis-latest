import faker from "faker";
import chance from "chance";

function rnd(max) {
    return Math.floor(Math.random() * max);
}

const responses = [
    "I am Sherpa.",
    "My name is Sherpa",
    "Sherpa is my name, coding is my game",
    "I am your loyal guide, Sherpa."
];

const queryIdentity = {
    getResponse: function(intent) {
        return responses[rnd(responses.length)];
    }
};

module.exports = queryIdentity;

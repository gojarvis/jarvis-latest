import faker from "faker";
import chance from "chance";

function rnd(max) {
    return Math.floor(Math.random() * max);
}

const responses = [
    "What's crackin'?!",
    "Salutations, dear fellow!",
    "Sup Homie?",
    "How's it goin', buddy?",
    "Good moooooorning vietnam!"
];

const greetingResponses = {
    getResponse: function(intent) {
        return responses[rnd(responses.length)];
    }
};

module.exports = greetingResponses;

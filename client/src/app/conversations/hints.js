import faker from "faker";
import chance from "chance";

function rnd(max) {
    return Math.floor(Math.random() * max);
}

const responses = [
    "Ask me who I am.",
    "I can tell you about our project",
    "Tell me what you hate about coding",
    "What do you think I am?",
    "Do you think I can lean?",
    "What are you thinking about?"
];

const hints = {
    getHint: function(intent) {
        return responses[rnd(responses.length)];
    }
};

module.exports = hints;

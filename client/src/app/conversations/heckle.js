import faker from 'faker'
import chance from 'chance'


function rnd(max){
  return Math.floor(Math.random() * max);
}

const responses = [
  "Well, by golly.",
  "Do you kiss your mother with that mouth?",
  "How DARE you Sir.",
  "I don't think you really mean that."
]

const heckle = {
  getResponse: function(intent){
    return responses[rnd(responses.length)]
  },

};

module.exports = heckle;

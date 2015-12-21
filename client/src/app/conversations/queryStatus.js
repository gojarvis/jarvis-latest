import faker from 'faker'
import chance from 'chance'


function rnd(max){
  return Math.floor(Math.random() * max);
}

const responses = [
  "All systems nominal.",
  "Everything is A-OK.",
  "All systems go.",
  "All good here."
]

const queryStatus = {
  getResponse: function(intent){
    return responses[rnd(responses.length)]
  },

};

module.exports = queryStatus;

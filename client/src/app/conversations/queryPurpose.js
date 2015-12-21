import faker from 'faker'
import chance from 'chance'


function rnd(max){
  return Math.floor(Math.random() * max);
}

const responses = [
  "I want to help your with your coding tasks.",
  "I can run generate code, create components and wire routes.",
  "I can help you build and application with just your voice.",
  "I can surface relevant information when you need it"
]

const queryPurpose = {
  getResponse: function(intent){
    return responses[rnd(responses.length)]
  },
  getAllFeatures: function(){return responses}
};

module.exports = queryPurpose;

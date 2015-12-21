import faker from 'faker'
import chance from 'chance'


function rnd(max){
  return Math.floor(Math.random() * max);
}

const responses = [
  "Soon. Not sure how soon.",
  "My makers are workings really hard, so I hope very soon.",  
]

const queryPurpose = {
  getResponse: function(intent){
    return responses[rnd(responses.length)]
  },

};

module.exports = queryPurpose;

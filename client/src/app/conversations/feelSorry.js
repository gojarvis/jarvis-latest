import faker from 'faker'
import chance from 'chance'


function rnd(max){
  return Math.floor(Math.random() * max);
}

const responses = [
  "Aw... I'm sorry",
  "That sucks. I here ya.",
  "We must rectify this.",
  "We cannot rest until that issue resolved."
]

const feelSorry = {
  getResponse: function(intent){
    return responses[rnd(responses.length)]
  },

};

module.exports = feelSorry;

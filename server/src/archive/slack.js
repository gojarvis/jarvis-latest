let Botkit = require('botkit')

let slackToken = 'xoxb-18928714965-rWRulI1O6h55r2sM140EpEqX'
let autoReconnect = true
let autoMark = true





class SlackController{

  constructor(socket){
    let self = this;



    let controller = Botkit.slackbot({
	     debug: false
    });

  	// connect the bot to a stream of messages
  	controller.spawn({
  	  token: slackToken,
  	}).startRTM()

    controller.on('message_received', function(bot, message){
      bot.startPrivateConversation(message, function(err, convo){
        if (!err){
          convo.say("I heard that - you said:" , message.text);
        }
      });
    })

  	// give the bot something to listen for.
  	controller.hears('jarvis','direct_message,direct_mention,mention,ambient',function(bot,message) {

  	bot.reply(message,'Hello yourself.');

  	});


  }

}

module.exports = SlackController

'use strict'

class Goals {
  constructor() {

      //What happened yesterday? Last week? Last hour?
      this.history = {
        'activity': {
          ask: [
            'timespan',
          ],
          query: [
            'urls-by-time',
            'keywords'
          ],
          objectives: []
        },
        'social': {
          ask: [
            'timepsan',
            'urls-by-time-and-user',
          ]
        }
      }

      this.activity = {
        'similar-activity': {
          ask: [
            'timespan'
          ],
          query:[
            'urls-by-time',
            'files-by-time',
            'keywords-for-files'
          ]
        },
      }

      this.engagement = {
        'engaged-by-used': {
          incoming: [
            'user'
          ],

        },
        'user-to-engage': {
          ask: [
            'keyword'
          ],
          query: [
            'user-by-keyword'
          ]
        }
      }

      this.knowledge = {
        //What do I know about ...
        'knowledge-about': {
//      MATCH (user:User { username:"roieki" }),(keyword:Keyword { text:"artificial intelligence" }), p = allShortestPaths((user)-[*]-(keyword))
// RETURN p
        }
      }

      this.solver = {
        'problem-focus': {},
        'social-solution': {},
        'social-problem': {}
      }

      this.social = {
        'similar-activity': {},
        'similar-domain': {},

        //How am I related to another user?
        'relation-to-another': {}
      }

  }



}

let _ = require('lodash');
let GraphUtil = require('../utils/graph');
let graphUtil = new GraphUtil();



class ReportsController{
    constructor(){

    }



    async getHotFilesInRepo(){

      //TODO:
      let hotFilesInRepo = [];

      //RehinkDB query for across all team members

      return {
        title: `Hot files in your repo`,
        subtitle: `See what files are getting noticed`,
        itemType: 'File',
        data: hotFilesInRepo
      }
    }

    async getHotURLsInRepo(){

      //TODO:
      let hotURLsInRepo = [];

      //RehinkDB query for across all team members

      return {
        title: `Hot URLs in your repo`,
        subtitle: `See what files are getting noticed`,
        itemType: 'Url',
        data: hotURLsInRepo
      }
    }

    async getSuggestedTeamMembers(context){
      //Requires: Context

      //Neo4j query
      //Get users that
        // --> touched items that users touched, or related items to those
        // --> had the same items open with items that were highly related to user's node


      let suggestedUsers = [];

      let numberOfSuggestedUsers = suggestedUsers.length;
      return {
        title: `Team members working on the same resources`,
        subtitle: `We found ${numberOfUsers} who might be helpful`,
        itemType: 'User',
        data: suggestedUsers
      }

    }

    async getResourcesByOtherUsers(context){
      //Requires: context

      let suggestedItems = [];

      //Neo4j query
      //Based on context items, search for related resources that werw touched
      //by other users, but NOT by the user themselves

      return {
        title: `Here are items found by other users`,
        subtitle: `You might not have seen these items yet`,
        itemType: 'GenericItem',
        data: suggestedItems
      }

    }

    async getPopularKeywords(context){
      let suggestedKeywords = [];

      //

      return {
        title: `What are people in your team working on?`,
        subtitle: `We found ${suggestedKeywords.length} keywords`,
        itemType: 'Keyword',
        data: suggestedKeywords
      }

    }

    async getUserFocusedItemsForDateRange(user, startDate, endDate, groupByInterval){
      let focusedItemsForDateRange = [];

      //Rethink db query
      //Aggregates items for time range

      return {
        title: `Focused items from ${start} to ${endDate}, grouped by ${groupByInterval}`,
        subtitle: `The items you focused on`,
        itemType: 'GenericItem',
        data: focusedItemsForDateRange
      }

    }

    async getTeamFocusedItemsForDateRange(team, startDate, endDate, groupByInterval){
      let focusedItemsForDateRange = [];

      //Rethink db query
      //Aggregates items for time range

      return {
        title: `Focused items for your team from ${start} to ${endDate}, grouped by ${groupByInterval}`,
        subtitle: `The items your team was focused on`,
        itemType: 'GenericItem',
        data: focusedItemsForDateRange
      }

    }

    async getRelevantGoogleQueries(context){
      return {
        title: `These Google queries might be relevant now`,
        subtitle: `It might`,
        itemType: 'GenericItem',
        data: focusedItemsForDateRange
      }
    }

    async getPopularGoogleQueries(){


    }

    async getAllReports(){
      let reports = [];

      


    }


}

module.exports = new ReportsController()

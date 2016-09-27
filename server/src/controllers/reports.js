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
        data: hotFilesInRepo,
        timestamp: new Date()
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
        data: hotURLsInRepo,
        timestamp: new Date()
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
        subtitle: `We found ${numberOfSuggestedUsers} who might be helpful`,
        itemType: 'User',
        data: suggestedUsers,
        timestamp: new Date()
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
        data: suggestedItems,
        timestamp: new Date()
      }

    }

    async getPopularKeywords(context){
      let suggestedKeywords = [];

      //

      return {
        title: `What are people in your team working on?`,
        subtitle: `We found ${suggestedKeywords.length} keywords`,
        itemType: 'Keyword',
        data: suggestedKeywords,
        timestamp: new Date()
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
        data: focusedItemsForDateRange,
        timestamp: new Date()
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
        data: focusedItemsForDateRange,
        timestamp: new Date()
      }

    }

    async getRelevantGoogleQueries(context){
      return {
        title: `These Google queries might be relevant now`,
        subtitle: `It might`,
        itemType: 'Url',
        data: [],
        timestamp: new Date()
      }
    }

    async getPopularGoogleQueries(context){
      return {
        title: `These Google queries are popular in your team right now`,
        subtitle: `It might`,
        itemType: 'Url',
        data: [],
        timestamp: new Date()
      }

    }

    async getAllReports(context, user){
      console.log('Getting all reports');
      let hotFilesInRepo,
          hotURLsInRepo,
          suggestedTeamMembers,
          resourcesByOtherUsers,
          popularKeywords,
          userFocusedItemsForDateRange,
          teamFocusedItemsForDateRange,
          relevantGoogleQueries,
          popularGoogleQueries;




      try {
        hotFilesInRepo = await this.getHotFilesInRepo();
        hotURLsInRepo = await this.getHotURLsInRepo();
        suggestedTeamMembers = await this.getSuggestedTeamMembers(context);
        resourcesByOtherUsers = await this.getResourcesByOtherUsers(context);
        popularKeywords = await this.getPopularKeywords(context)
        // userFocusedItemsForDateRange = await this.getUserFocusedItemsForDateRange(user, startDate, endDate, groupByInterval)
        // teamFocusedItemsForDateRange = await this.getTeamFocusedItemsForDateRange(team, startDate, endDate, groupByInterval)
        relevantGoogleQueries = await this.getRelevantGoogleQueries(context)
        popularGoogleQueries = await this.getPopularGoogleQueries(context)


      } catch (e) {
        console.log('cant get all reports', e);
      } finally {
        let reports = [];
        reports.push(hotFilesInRepo);
        reports.push(hotURLsInRepo);
        reports.push(suggestedTeamMembers);
        reports.push(resourcesByOtherUsers);
        reports.push(popularKeywords);
        reports.push(relevantGoogleQueries);
        reports.push(popularGoogleQueries);

        // console.log('return reports', reports);
        return shuffle(reports);
      }


    }


}


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


module.exports = new ReportsController()

let _ = require('lodash');
let GraphUtil = require('../utils/graph');
let graphUtil = new GraphUtil();
let thinky = require('../utils/rethink');




class ReportsController{
    constructor(){

    }

    // Parameters: source type -  ['atom', 'chrome']
    // Return: [ NodeID ]
    async getHotItemsInRepoBySource(source, threshold = 3){
      console.log('>>> getHotItemsInRepoBySource - threshold:', threshold);

      let r = thinky.r;
      let usersIDsInRepo = ['roieki', 'dew2105'];

      let hotItemsIDsInRepo = [];

      try {
        hotItemsIDsInRepo =
          await r.table('Event').filter(function(event){
                var eventDayHour = r.add(event('timestamp').dayOfYear().mul(24), event('timestamp').hours());
                var nowDayHour = r.add(r.now().dayOfYear().mul(24), r.now().hours());
                 return event.hasFields('data')
                   .and(event('data').hasFields('address'))
                   .and(event('source').eq(source))
                   .and(event('source').ne('context'))
                   .and(eventDayHour.ge(nowDayHour.sub(24)))
              }).filter(function(row){
        						return r.expr(usersIDsInRepo).contains(row('user'))
      					})
              .map(function (row) {
              	return (
                	{
                    day: row('timestamp').dayOfYear() ,
                    hour: row('timestamp').hours() ,
                    dayHour: r.add(row('timestamp').dayOfYear().mul(24), row('timestamp').hours()),
                    address: row('data')('address'),
                    nodeId:  row('data')('nodeId'),
                    timestamp: row('timestamp'),
                    source: row('source'),
                    user: row('user'),
                    eventType: row('eventType'),
                    id: row('id')
                   }
                  )
                }
              )
            .group('dayHour').ungroup().map(function(row){
                return (
                  {
                    dayHour: row('group'),
                    items: row('reduction')
                  }
                )
            })
            .orderBy(r.desc('dayHour')).concatMap(function(row){
              return row("items")
            })
            .group('nodeId').count().ungroup().orderBy(r.desc("reduction"))
            .map(function(row){
              return ({
                nodeId: row("group"),
                count: row("reduction")
              })
            })
            .filter(function(row){
              return row('count').gt(15)
            })
            .limit(15)
            .run()
      } catch (e) {
        console.log('cant getHotItemsInRepoBySource', e);
      }

      let nodes;

      try {
        nodes = await Promise.all(hotItemsIDsInRepo.map( item => this.getBucketedNodeById(item)));
        nodes = nodes.filter(item => !_.isEmpty(item))
      } catch (e) {
        console.log('cant get nodes for hot items ', e);
      } finally {
        return nodes
      }
    }

    async getHotFilesInRepo(modifiers){
      let threshold = 10;
      let hotFilesInRepo;
      try {
        hotFilesInRepo = await this.getHotItemsInRepoBySource('atom', threshold);

      } catch (e) {
        console.log('cant getHotFilesInRepo', e);
      } finally {
        return {
          title: `Hot files in your repo`,
          subtitle: `There are ${hotFilesInRepo.length} files that are getting noticed`,
          reportComponent: 'HotFilesInRepo',
          data: hotFilesInRepo,
          timestamp: new Date()
        }
      }

    }

    async getHotURLsInRepo(modifiers){
      let hotUrlsInRepo;
      let threshold = 10;

      try {
        hotUrlsInRepo = await this.getHotItemsInRepoBySource('chrome', threshold);
      } catch (e) {
        console.log('cant getHotURLsInRepo', e);
      } finally {
        return {
          title: `Hot URLs in your repo`,
          subtitle: `There are ${hotUrlsInRepo.length} Urls that are getting noticed`,
          reportComponent: 'HotURLsInRepo',
          data: hotUrlsInRepo,
          timestamp: new Date()
        }
      }

    }

    async getSuggestedTeamMembers(context, user, modifiers){
      let suggestedUsers = [], cypher = '';

      if (!_.isEmpty(context)){
          console.log('Theres something in the context');
          let nodeIds = context.map(item => {
            return item.data.id
          });

          cypher =
          `match (user:User)-[r]-(n)-[o:openwith]-(m)-[t:touched]-(targetUser:User)
          match (user)-[:member]-(Team)-[:member]-(targetUser)
          where
          id(n) in [${nodeIds.join(",")}]
          and not id(targetUser) = ${user.id}
          and o.weight > 5
          with count(t) as rank, targetUser, collect(m) as nodes
          return targetUser, rank, nodes
          order by rank desc`


          try {
            suggestedUsers = await graphUtil.queryGraph(cypher);
          } catch (e) {
            console.log('cant getSuggestedTeamMembers', e);
          } finally {
            let numberOfSuggestedUsers = suggestedUsers.length;
            return {
              title: `Team members working on the same resources`,
              subtitle: `We found ${numberOfSuggestedUsers} who might be helpful`,
              reportComponent: 'SuggestedTeamMembers',
              data: suggestedUsers,
              timestamp: new Date()
            }
          }
      }



    }

    async getResourcesByOtherUsers(context, user, modifiers){

      let suggestedItems = [], cypher = '';

      if (!_.isEmpty(context)){
        let nodeIds = context.map(item => {
          return item.data.id
        });

        cypher = `match (user:User)-[r]-(n)-[o:openwith]-(targetItem)-[t:touched]-(targetUser:User)
        match (user)-[:member]-(Team)-[:member]-(targetUser)
        where
        id(n) in [${nodeIds.join(",")}]
        and not ((user)-[:touched]-(targetItem))
        and not id(targetUser) = ${user.id}

        return distinct(targetItem), o.weight
        order by o.weight desc limit 20`

        // console.log('cypher', cypher);
        try {
          suggestedItems = await graphUtil.queryGraph(cypher);
        } catch (e) {
          console.log('cant getResourcesByOtherUsers', e);
        } finally {
          return {
            title: `Here are ${suggestedItems.length} items found by other users`,
            subtitle: `You might not have seen these items yet`,
            reportComponent: 'ResourcesByOtherUsers',
            data: suggestedItems,
            timestamp: new Date()
          }
        }
      }
      else{

      }


    }

    // async getPopularKeywords(context){
    //   let suggestedKeywords = [];
    //
    //   //
    //
    //   return {
    //     title: `What are people in your team working on?`,
    //     subtitle: `We found ${suggestedKeywords.length} keywords`,
    //     reportComponent: 'Keyword',
    //     data: suggestedKeywords,
    //     timestamp: new Date()
    //   }
    //
    // }
    //
    // async getUserFocusedItemsForDateRange(user, startDate, endDate, groupByInterval){
    //   let focusedItemsForDateRange = [];
    //
    //   //Rethink db query
    //   //Aggregates items for time range
    //
    //   return {
    //     title: `Focused items from ${start} to ${endDate}, grouped by ${groupByInterval}`,
    //     subtitle: `The items you focused on`,
    //     reportComponent: 'GenericItem',
    //     data: focusedItemsForDateRange,
    //     timestamp: new Date()
    //   }
    //
    // }
    //
    // async getTeamFocusedItemsForDateRange(team, startDate, endDate, groupByInterval){
    //   let focusedItemsForDateRange = [];
    //
    //   //Rethink db query
    //   //Aggregates items for time range
    //
    //   return {
    //     title: `Focused items for your team from ${start} to ${endDate}, grouped by ${groupByInterval}`,
    //     subtitle: `The items your team was focused on`,
    //     reportComponent: 'GenericItem',
    //     data: focusedItemsForDateRange,
    //     timestamp: new Date()
    //   }
    //
    // }
    //
    // async getRelevantGoogleQueries(context){
    //   return {
    //     title: `These Google queries might be relevant now`,
    //     subtitle: `It might`,
    //     reportComponent: 'Url',
    //     data: [],
    //     timestamp: new Date()
    //   }
    // }
    //
    // async getPopularGoogleQueries(context){
    //   return {
    //     title: `These Google queries are popular in your team right now`,
    //     subtitle: `It might`,
    //     reportComponent: 'Url',
    //     data: [],
    //     timestamp: new Date()
    //   }
    //
    // }
    //
    async getBucketedNodeById(item){
      let node = {};
      try{
        node.data = await graphUtil.getNodeById(item.nodeId)
        node.count = item.count;

      }
      catch(e){
        console.log('cant getBucketedNodeById', e);
      }
      finally{
        return node
      }
    }

    async getAllReports(context, user, modifiers){
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
        hotFilesInRepo = await this.getHotFilesInRepo(modifiers);
        hotURLsInRepo = await this.getHotURLsInRepo(modifiers);
        suggestedTeamMembers = await this.getSuggestedTeamMembers(context, user, modifiers);
        resourcesByOtherUsers = await this.getResourcesByOtherUsers(context, user, modifiers);
        // popularKeywords = await this.getPopularKeywords(context)

        // relevantGoogleQueries = await this.getRelevantGoogleQueries(context)
        // popularGoogleQueries = await this.getPopularGoogleQueries(context)

        // userFocusedItemsForDateRange = await this.getUserFocusedItemsForDateRange(user, startDate, endDate, groupByInterval)
        // teamFocusedItemsForDateRange = await this.getTeamFocusedItemsForDateRange(team, startDate, endDate, groupByInterval)


      } catch (e) {
        console.log('cant get all reports', e);
      } finally {
        let reports = [];
        reports.push(hotFilesInRepo);
        reports.push(hotURLsInRepo);
        reports.push(suggestedTeamMembers);
        reports.push(resourcesByOtherUsers);
        // reports.push(popularKeywords);
        // reports.push(relevantGoogleQueries);
        // reports.push(popularGoogleQueries);

        // console.log('return reports', reports);
        let filteredReports = reports.filter(report => {
          return report.data.length > 0
        })

        return shuffle(filteredReports);

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

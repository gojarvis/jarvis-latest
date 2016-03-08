'use strict'
const objectives = [
 {
    name: 'startDate',
    humanName: 'Start Date',
    resolvers: [
      {
        name: 'getFromUserIntent',
        dependencies: [],
        params: {
          path: ['entities', 'datetime',  0, 'from', 'value']
        },
        target: 'startDate'
      }
    ],
  },
  {
    name: 'endDate',
    humanName: 'End Date',
    resolvers: [
      {
        name: 'getFromUserIntent',
        dependencies: [],
        params: {
          path: ['entities', 'datetime',  0, 'to', 'value']
        },
        target: 'endDate'
      }
    ]
  },
 {
    name: 'recentEvents',
    humanName: 'Recent Events',
    resolvers: [
      {
        name: 'getEventsByTime',
        params: {
          startDate: '$startDate',
          endDate: '$endDate'
        },
        dependencies: ['startDate', 'endDate'],
        target: 'recentItems'
      }
    ]
  },
  {
     name: 'relatedKeywords',
     humanName: 'Related Keywords',
     resolvers: [
       {
         name: 'getRelatedItems',
         params: {
           source: '$recentItems',
           threshold: 1
         },
         dependencies: ['recentItems'],
         target: 'keywords'
       }
     ]
   }
];

module.exports = objectives;

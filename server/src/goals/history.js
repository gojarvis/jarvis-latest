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
  }
];

module.exports = objectives;

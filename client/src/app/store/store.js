import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import imm from 'immutable';

function queryByNodeId(params) {
  return agent.post('/query', params);
}

const query = (state = {}, action) => {
  switch (action.type) {
    // case 'PUSH_NEW_EVENT':
    //   // query for stuff
    //   let result = await agent.post('/query', action.params);
    //   return {
    //     ...state,
    //     queriedItems: result
    //   };
    case 'QUERY_NODE':
      return '';
    default:
      return state;
  }
};

const eventTicker = (state = {
  items: imm.List()
}, action) => {
  switch (action.type) {
    case 'PUSH_NEW_EVENT':
      return {
        ...state,
        items: state.items.unshift(action.value)
      };
    default:
      return state;
  }
};

const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

const App = combineReducers({
  eventTicker,
  visibilityFilter
});

const store = createStore(
  App,
  applyMiddleware(thunk)
);

export default store;

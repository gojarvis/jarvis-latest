import { combineReducers } from 'redux';
import {
  NEW_HISTORY_ITEM,
  REQUEST_QUERY_ITEMS, RECEIVE_QUERY_ITEMS,
} from './actionCreators';
import imm from 'immutable';

function eventTickerItems(state = imm.List(), action) {
  switch (action.type) {
    case NEW_HISTORY_ITEM:
      return state.unshift(action.value);
    default:
      return state;
  }
}

function queriedItems(state = {
  items: imm.List(),
  isFetching: false
}, action) {
  switch (action.type) {
    case REQUEST_QUERY_ITEMS:
      return {
        ...state,
        isFetching: true,
      };
    case RECEIVE_QUERY_ITEMS:
      return {
        ...state,
        isFetching: false,
        items: action.items,
        lastUpdated: action.receivedAt,
      };
    // case NEW_HISTORY_ITEM:
      // query for stuff
    default:
      return state;
  }
};

function visibilityFilter(state = 'SHOW_ALL', action) {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

const App = combineReducers({
  eventTickerItems,
  queriedItems,
  visibilityFilter,
});

export default App;


// old event ticker code
// const eventTicker = (state = {
//   items: imm.List()
// }, action) => {
//   switch (action.type) {
//     case NEW_HISTORY_ITEM:
//       return {
//         ...state,
//         items: state.items.unshift(action.value).take(7)
//       };
//     default:
//       return state;
//   }
// };

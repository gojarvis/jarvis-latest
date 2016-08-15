import { combineReducers } from 'redux';
import {
  NEW_HISTORY_ITEM, FOCUS_NODE,
  SET_END_NODE_TYPE, ADD_USER_NODE_ID,
  REQUEST_QUERY_ITEMS, RECEIVE_QUERY_ITEMS,
  REQUEST_BLACKLIST_NODE, RECEIVE_BLACKLIST_NODE_COMPLETE
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
  isFetching: false,
  focusedNodeId: -1,
  focusedNodeData: null,
  endNodeType: '',
  endUserNodeIds: imm.Set()
}, action) {
  switch (action.type) {
    case FOCUS_NODE:
      return {
        ...state,
        focusedNodeId: action.payload
      };
    case SET_END_NODE_TYPE:
      return {
        ...state,
        endNodeType: action.payload
      };
    case ADD_USER_NODE_ID:
      return {
        ...state,
        endUserNodeIds: state.endUserNodeIds.add(action.payload)
      }
    case REQUEST_QUERY_ITEMS:
      return {
        ...state,
        isFetching: true,
        focusedNodeId: action.params.nodeId
      };
    case RECEIVE_QUERY_ITEMS:
      return {
        ...state,
        isFetching: false,
        items: action.items,
        lastUpdated: action.receivedAt,
        focusedNodeData: action.items.first().get('startNode')
      };
    case REQUEST_BLACKLIST_NODE:
      return {
        ...state,
        isBlacklisting: true
      };
    case RECEIVE_BLACKLIST_NODE_COMPLETE:
      return {
        ...state,
        isBlacklisting: false,
        nodeId: action.nodeId
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

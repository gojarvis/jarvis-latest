let agent = require('superagent-promise')(require('superagent'), Promise);
import imm from 'immutable';
export const NEW_HISTORY_ITEM = 'NEW_HISTORY_ITEM';
export const REQUEST_QUERY_ITEMS = 'REQUEST_QUERY_ITEMS';
export const RECEIVE_QUERY_ITEMS = 'RECEIVE_QUERY_ITEMS';

export function pushHistoryItem(item) {
  return {
    type: NEW_HISTORY_ITEM,
    payload: item,
  }
}

// QueryItems
function requestQueryItems(params) {
  return {
    type: REQUEST_QUERY_ITEMS,
    params,
  }
}

function receiveQueryItems(params, data) {
  return {
    type: RECEIVE_QUERY_ITEMS,
    params,
    items: imm.List(data),
    receivedAt: Date.now(),
  }
}

function fetchQueryItems(params) {
  return dispatch => {
    dispatch(requestQueryItems(params));
    return agent.post('/query', params)
      .then(response => response.body)
      .then(data => dispatch(receiveQueryItems(params, data)));
  }
}

function shouldFetchQueryItems(state, params) {
  return true;
}

export function fetchQueryItemsIfNeeded(params) {
  return (dispatch, getState) => {
    if (shouldFetchQueryItems(getState(), params)) {
      return dispatch(fetchQueryItems(params));
    }
  }
}
// END QueryItems

// Blacklist Node
function requestBlacklistNode(params) {
  return {
    type: REQUEST_BLACKLIST_NODE,
    params,
  }
}

function receiveBlacklistNodeComplete(params, data) {
  return {
    type: RECEIVE_BLACKLIST_NODE_COMPLETE,
    params,
    nodeId: data.nodeId
  }
}

function blacklistNode(params) {
  return dispatch => {
    dispatch(requestBlacklistNode(params));
    return agent.post('/blacklist', params)
      .then(response => response.body)
      .then(data => dispatch(receiveBlacklistNodeComplete(params, data)));
  }
}

function shouldBlacklistNode(state, params) {
  return true;
}

export function blacklistNodeIfNeeded(params) {
  return (dispatch, getState) => {
    if (shouldBlacklistNode(getState(), params)) {
      return dispatch(blacklistNode(params));
    }
  }
}
// END Blacklist node

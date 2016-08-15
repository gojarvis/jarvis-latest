let agent = require('superagent-promise')(require('superagent'), Promise);
import imm from 'immutable';
export const NEW_HISTORY_ITEM = 'NEW_HISTORY_ITEM';
export const FOCUS_NODE = 'FOCUS_NODE';
export const SET_END_NODE_TYPE = 'SET_END_NODE_TYPE';
export const ADD_USER_NODE_ID = 'ADD_USER_NODE_ID';
export const REQUEST_QUERY_ITEMS = 'REQUEST_QUERY_ITEMS';
export const RECEIVE_QUERY_ITEMS = 'RECEIVE_QUERY_ITEMS';
export const REQUEST_BLACKLIST_NODE = 'REQUEST_BLACKLIST_NODE';
export const RECEIVE_BLACKLIST_NODE_COMPLETE = 'RECEIVE_BLACKLIST_NODE_COMPLETE';

export function pushHistoryItem(item) {
  return {
    type: NEW_HISTORY_ITEM,
    payload: item,
  }
}

export function setFocusedNode(nodeId) {
  return {
    type: FOCUS_NODE,
    payload: nodeId
  }
}

export function setEndNodeType(type) {
  return {
    type: SET_END_NODE_TYPE,
    payload: type
  }
}

export function addUserNodeId(userId) {
  return {
    type: ADD_USER_NODE_ID,
    payload: userId
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

// TODO: add real logic here, cache, etc.
function shouldFetchQueryItems(state, params) {
  return true;
}

export function fetchQueryItemsIfNeeded(nodeId, params) {
  return (dispatch, getState) => {
    dispatch(setFocusedNode(nodeId));

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
  // TODO: verify:
  // console.log('receiveBlacklistNodeComplete:', data.nodeId);
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

// TODO: consider doing something here
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

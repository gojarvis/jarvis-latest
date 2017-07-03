let agent = require("superagent-promise")(require("superagent"), Promise);
import imm from "immutable";
export const NEW_HISTORY_ITEM = "NEW_HISTORY_ITEM";
export const TOGGLE_AUTOSWITCH = "TOGGLE_AUTOSWITCH";
export const FOCUS_NODE = "FOCUS_NODE";
export const SET_END_NODE_TYPE = "SET_END_NODE_TYPE";
export const TOGGLE_FILTER_BY_USER_ID = "TOGGLE_FILTER_BY_USER_ID";
export const REQUEST_QUERY_ITEMS = "REQUEST_QUERY_ITEMS";
export const RECEIVE_QUERY_ITEMS = "RECEIVE_QUERY_ITEMS";
export const REQUEST_BLACKLIST_NODE = "REQUEST_BLACKLIST_NODE";
export const RECEIVE_BLACKLIST_NODE = "RECEIVE_BLACKLIST_NODE";
export const REQUEST_USER_JSON = "REQUEST_USER_JSON";
export const RECEIVE_USER_JSON = "RECEIVE_USER_JSON";
export const REQUEST_TEAM_JSON = "REQUEST_TEAM_JSON";
export const RECEIVE_TEAM_JSON = "RECEIVE_TEAM_JSON";

export function pushHistoryItem(item) {
    return {
        type: NEW_HISTORY_ITEM,
        payload: item
    };
}

export function toggleAutoswitch() {
    return {
        type: TOGGLE_AUTOSWITCH
    };
}

export function setFocusedNode(nodeId) {
    return {
        type: FOCUS_NODE,
        payload: nodeId
    };
}

export function setEndNodeType(type) {
    return {
        type: SET_END_NODE_TYPE,
        payload: type
    };
}

export function toggleFilterByUserId(userId) {
    return {
        type: TOGGLE_FILTER_BY_USER_ID,
        payload: userId
    };
}

// QueryItems
function requestQueryItems(params) {
    return {
        type: REQUEST_QUERY_ITEMS,
        params
    };
}

function receiveQueryItems(params, data) {
    return {
        type: RECEIVE_QUERY_ITEMS,
        params,
        items: imm.fromJS(data),
        receivedAt: Date.now()
    };
}

function fetchQueryItems(params) {
    return dispatch => {
        dispatch(requestQueryItems(params));
        return agent
            .post("/query", params)
            .then(response => response.body)
            .then(data => dispatch(receiveQueryItems(params, data)));
    };
}

// TODO: add real logic here, cache, etc.
function shouldFetchQueryItems(state, params) {
    return true;
}

//  params: {
//    nodeId: neo4j node id (default: -1),
//    endNodeType: enum['File', 'Url', 'Keyword'] (default: false),
//    endUserNodeIds: end user nodes to query for (default: false),
//  }
export function fetchQueryItemsIfNeeded(nodeId) {
    return (dispatch, getState) => {
        let state = getState();
        let params = {
            nodeId,
            startUserNodeId: state.queriedItems.user.id,
            endNodeType: state.queriedItems.endNodeType,
            endUserNodeIds: state.queriedItems.endUserNodeIds.toJS()
        };

        // console.log('sending with params: ', params);

        dispatch(setFocusedNode(nodeId));

        if (shouldFetchQueryItems(state, params)) {
            return dispatch(fetchQueryItems(params));
        }
    };
}
// END QueryItems

// Blacklist Node
function requestBlacklistNode(params) {
    return {
        type: REQUEST_BLACKLIST_NODE,
        params
    };
}

function receiveBlacklistNode(params, data) {
    // TODO: verify:
    // console.log('receiveBlacklistNode:', data.nodeId);
    return {
        type: RECEIVE_BLACKLIST_NODE,
        params,
        nodeId: data.nodeId
    };
}

function blacklistNode(params) {
    return dispatch => {
        dispatch(requestBlacklistNode(params));
        return agent
            .post("/blacklist", params)
            .then(response => response.body)
            .then(data => dispatch(receiveBlacklistNode(params, data)));
    };
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
    };
}
// END Blacklist node

// Async: UserJson
function requestUserJson() {
    return {
        type: REQUEST_USER_JSON
    };
}

function receiveUserJson(data) {
    return {
        type: RECEIVE_USER_JSON,
        user: data
    };
}

function fetchUserJson() {
    return dispatch => {
        dispatch(requestUserJson());
        return agent
            .post("/api/user/userjson")
            .then(response => response.body)
            .then(data => dispatch(receiveUserJson(data)));
    };
}

// TODO: consider doing something here
function shouldFetchUserJson(state) {
    return true;
}

export function fetchUserJsonIfNeeded() {
    return (dispatch, getState) => {
        if (shouldFetchUserJson(getState())) {
            return dispatch(fetchUserJson());
        }
    };
}
// END UserJson

// Async: Get user's teams
export function fetchUserAndTheirTeams() {
    return (dispatch, getState) => {
        return dispatch(fetchUserJson()).then(() => {
            const fetchedUser = getState().queriedItems.user;
            return dispatch(fetchUserTeams(fetchedUser));
        });
    };
}

function requestTeamJson() {
    return {
        type: REQUEST_TEAM_JSON
    };
}

function receiveUserTeams(userData, data) {
    return {
        type: RECEIVE_TEAM_JSON,
        teamMembers: imm.fromJS([userData, ...data])
    };
}

function fetchUserTeams(userData) {
    return dispatch => {
        dispatch(requestTeamJson());

        return agent
            .post("/api/user/teams/members", { userId: userData.id })
            .then(response => response.body)
            .then(data => dispatch(receiveUserTeams(userData, data)));
    };
}

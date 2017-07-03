import { combineReducers } from "redux";
import {
    NEW_HISTORY_ITEM,
    FOCUS_NODE,
    TOGGLE_AUTOSWITCH,
    SET_END_NODE_TYPE,
    TOGGLE_FILTER_BY_USER_ID,
    REQUEST_QUERY_ITEMS,
    RECEIVE_QUERY_ITEMS,
    REQUEST_BLACKLIST_NODE,
    RECEIVE_BLACKLIST_NODE,
    REQUEST_USER_JSON,
    REQUEST_TEAM_JSON,
    RECEIVE_USER_JSON,
    RECEIVE_TEAM_JSON
} from "./actionCreators";
import imm from "immutable";

function eventTickerItems(state = imm.List(), action) {
    switch (action.type) {
        case NEW_HISTORY_ITEM:
            return state.unshift(action.payload);
        default:
            return state;
    }
}

function queriedItems(
    state = {
        items: imm.List(),
        isFetching: false,
        focusedNodeId: -1,
        focusedNodeData: null,
        endNodeType: "",
        endUserNodeIds: imm.Set(),
        autoswitch: false,
        user: {},
        users: imm.List(),
        teamMembers: imm.List()
    },
    action
) {
    switch (action.type) {
        case REQUEST_USER_JSON:
            return {
                ...state,
                isFetching: true
            };
        case RECEIVE_USER_JSON:
            return {
                ...state,
                isFetching: false,
                user: action.user,
                lastUpdated: action.receivedAt
            };
        case REQUEST_TEAM_JSON:
            return {
                ...state,
                isFetching: true
            };
        case RECEIVE_TEAM_JSON:
            return {
                ...state,
                isFetching: false,
                teamMembers: action.teamMembers,
                lastUpdated: action.receivedAt
            };
        case TOGGLE_AUTOSWITCH:
            return {
                ...state,
                autoswitch: !state.autoswitch
            };
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
        case TOGGLE_FILTER_BY_USER_ID:
            return {
                ...state,
                endUserNodeIds: state.endUserNodeIds.includes(action.payload)
                    ? state.endUserNodeIds.delete(action.payload)
                    : state.endUserNodeIds.add(action.payload)
            };
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
                focusedNodeData: action.items
                    .get(0, imm.Map())
                    .get("startNode", imm.Map())
            };
        case REQUEST_BLACKLIST_NODE:
            return {
                ...state,
                isBlacklisting: true
            };
        case RECEIVE_BLACKLIST_NODE:
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
}

function visibilityFilter(state = "SHOW_ALL", action) {
    switch (action.type) {
        case "SET_VISIBILITY_FILTER":
            return action.filter;
        default:
            return state;
    }
}

const App = combineReducers({
    eventTickerItems,
    queriedItems,
    visibilityFilter
});

export default App;

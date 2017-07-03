import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";
import { enableBatching } from "redux-batched-actions";
import imm from "immutable";
import App from "./reducers";
// import { NEW_HISTORY_ITEM, QUERY_ITEMS_REQUEST, QUERY_ITEMS_SUCCESS, QUERY_ITEMS_FAILURE } from './actionCreators';
import {
    pushHistoryItem,
    queryItemsRequest,
    queryItemsSuccess,
    queryItemsFailure
} from "./actionCreators";

const store = createStore(enableBatching(App), applyMiddleware(thunk));

let unsubLog = store.subscribe(() => {
    // console.info('Store: ', store.getState());
});

export default store;

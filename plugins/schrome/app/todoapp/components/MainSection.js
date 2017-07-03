import React, { Component, PropTypes } from "react";
import TodoItem from "./TodoItem";
import Footer from "./Footer";
import {
    SHOW_ALL,
    SHOW_COMPLETED,
    SHOW_ACTIVE
} from "../constants/TodoFilters";

const TODO_FILTERS = {
    [SHOW_ALL]: () => true,
    [SHOW_ACTIVE]: todo => !todo.completed,
    [SHOW_COMPLETED]: todo => todo.completed
};

class MainSection extends Component {
    render() {
        return <section className="main">Jarvis is online</section>;
    }
}

export default MainSection;

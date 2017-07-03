import React, { PropTypes, Component } from "react";
import TodoTextInput from "./TodoTextInput";

class Header extends Component {
    static propTypes = {
        addTodo: PropTypes.func.isRequired
    };

    handleSave(text) {
        if (text.length !== 0) {
            this.props.addTodo(text);
        }
    }

    render() {
        return <header className="header" />;
    }
}

export default Header;

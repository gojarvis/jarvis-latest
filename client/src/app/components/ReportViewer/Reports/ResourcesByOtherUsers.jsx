import React, { Component, PropTypes } from "react";
import Radium from "radium";
import FB from "styles/flexbox";

class ResourcesByOtherUsers extends Component {
    constructor(...args) {
        super(...args);
    }

    static get propTypes() {
        return {};
    }

    render() {
        let data = this.props.data;
        let items = data.map((item, key) => {
            let { targetItem } = item;
            let title;

            switch (targetItem.type) {
                case "url":
                    title = targetItem.title;
                    break;
                case "file":
                    title = targetItem.address;
                    break;
            }
            return (
                <div style={{ ...styles.itemTitle }} key={key}>
                    {title}
                </div>
            );
        });
        return (
            <div>
                {items}
            </div>
        );
    }
}

const styles = {
    itemTitle: {
        fontSize: 12
    }
};

export default ResourcesByOtherUsers;

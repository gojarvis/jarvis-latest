import React, { Component, PropTypes } from "react";
import Radium from "radium";
import FB from "styles/flexbox";

class SuggestedTeamMembers extends Component {
    constructor(...args) {
        super(...args);
    }

    static get propTypes() {
        return {};
    }

    render() {
        let data = this.props.data;
        let users = data.map((item, key) => {
            let { targetUser } = item;
            let userImagePath = `https://avatars.githubusercontent.com/${targetUser.username}?size=60`;
            return (
                <div style={{ ...styles.wrapper }} key={key}>
                    <div>
                        <img
                            src={userImagePath}
                            height="40"
                            title={targetUser.username}
                        />
                    </div>
                    <div style={{ ...styles.usernameLabel }}>
                        {targetUser.username}
                    </div>
                </div>
            );
        });
        return (
            <div>
                {users}
            </div>
        );
    }
}

const styles = {
    wrapper: {
        width: "5%"
    },
    usernameLabel: {
        textAlign: "center",
        fontSize: "10"
    }
};

export default SuggestedTeamMembers;

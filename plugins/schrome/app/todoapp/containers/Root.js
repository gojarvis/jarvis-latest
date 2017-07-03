import React, { Component, PropTypes } from "react";
import { Provider } from "react-redux";

export default class Root extends Component {
    static propTypes = {
        store: PropTypes.object.isRequired
    };

    constructor() {
        super();

        this.state = {
            isDisabled: false
        };
    }

    componentWillMount() {
        let self = this;
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === "local" && changes.hasOwnProperty("isDisabled")) {
                this.setState({ isDisabled: changes.isDisabled.newValue });
            }
        });
    }

    componentDidMount() {
        chrome.storage.local.get("isDisabled", obj => {
            console.log(
                "componentDidMount setting state: ",
                obj.isDisabled || false
            );
            this.setState({ isDisabled: obj.isDisabled || false });
        });
    }

    enable() {
        chrome.runtime.sendMessage({ action: "enable" });
        console.log("enabled click");
        chrome.storage.local.set({ isDisabled: false });
    }

    disable() {
        chrome.runtime.sendMessage({ action: "disable" });
        chrome.storage.local.set({ isDisabled: true });
    }

    render() {
        const { store } = this.props;
        let isDisabled;
        if (this.state) {
            isDisabled = this.state.isDisabled ? "disabled" : "enabled";
        }

        let color = this.state.isDisabled ? "red" : "green";

        return (
            <div>
                <div
                    onClick={() => this.enable()}
                    style={{
                        ...styles.container,
                        color: !this.state.isDisabled ? "green" : "black"
                    }}
                >
                    <span style={styles.icon}>&#x2713;</span>
                    <span style={styles.text}>Enable</span>
                </div>
                <div
                    onClick={() => this.disable()}
                    style={{
                        ...styles.container,
                        color: this.state.isDisabled ? "red" : "black"
                    }}
                >
                    <span style={styles.icon}>&#x2717;</span>
                    <span style={styles.text}>Disable</span>
                </div>
            </div>
        );
    }
}

const styles = {
    container: {
        display: "flex",
        padding: 10,
        cursor: "pointer"
    },
    icon: {
        flexBasis: "20px"
    },
    text: {
        flex: "1 0 auto"
    }
};

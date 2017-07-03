import { Component, PropTypes } from "react";
import {
    Card,
    CardActions,
    CardHeader,
    CardMedia,
    CardTitle,
    CardText
} from "material-ui/Card";
import FlatButton from "material-ui/FlatButton";
import FB from "styles/flexbox";
import lightBaseTheme from "material-ui/styles/baseThemes/lightBaseTheme";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from "material-ui/styles/getMuiTheme";
let agent = require("superagent-promise")(require("superagent"), Promise);

class LoginView extends Component {
    constructor() {
        super();
    }

    async componentWillMount() {
        agent.post("http://localhost:3000/api/user/userjson").then(res => {
            if (!_.isUndefined(res.body.error)) {
                console.log("Not logged in");
            } else {
                window.localStorage.setItem("userId", res.body.id);
                window.localStorage.setItem("username", res.body.username);
                this.context.router.push("/main");
            }
        });
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
                <div
                    style={{
                        ...FB.base,
                        ...FB.justify.center,
                        ...FB.align.center,
                        height: "100vh",
                        width: "100vw"
                    }}
                >
                    <div style={{ background: "#fff", borderRadius: 2 }}>
                        <FlatButton
                            style={{ cursor: "pointer", padding: "0 20px" }}
                            onClick={() => {
                                window.location.href =
                                    "http://localhost:3000/auth/github";
                            }}
                        >
                            <i
                                className="fa fa-lg fa-github"
                                aria-hidden="true"
                            />
                            <span style={{ marginLeft: 5 }}>
                                Login with GitHub
                            </span>
                        </FlatButton>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}

LoginView.contextTypes = {
    router: PropTypes.object.isRequired
};

export default LoginView;

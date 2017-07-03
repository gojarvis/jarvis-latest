import { Component, PropTypes } from "react";
import FB from "styles/flexbox";
import Navbar from "../components/navbar";
import ViewWrapper from "views/view-wrapper";
import { List, ListItem, MakeSelectable } from "material-ui/List";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
let agent = require("superagent-promise")(require("superagent"), Promise);
import TeamAssignmentForm from "../components/forms/teamAssignmentForm";
import NewTeamForm from "../components/forms/newTeamForm";
import NewUserForm from "../components/forms/newUserForm";

class AdminView extends Component {
    constructor(...args) {
        super(...args);

        this.init();
        this.state = {
            users: [],
            user: {}
        };
    }

    async init() {
        agent.post("http://localhost:3000/api/user/userjson").then(res => {
            let { username, role, id } = res.body;
            let user = { username, role, id };

            //Ensure admin
            if (role !== "admin") {
                this.context.router.push("/");
            }

            this.setState({
                user: user
            });
        });
    }

    async getUserTeam(user) {
        let res = await agent.post("http://localhost:3000/api/user/teams", {
            userId: user.id
        });
        return { user, teams: res.body };
    }

    async componentWillMount() {
        let usersResult = await agent.post(
            "http://localhost:3000/api/user/all"
        );
        let users = usersResult.body;
        let usersTeams = await Promise.all(
            users.map(user => {
                return this.getUserTeam(user);
            })
        );
        this.setState({ users: usersTeams });
    }

    render() {
        return (
            <ViewWrapper>
                <div style={{ ...LOCAL_STYLES.container }}>
                    <div>
                        <List>
                            {this.state.users.map((item, index) => {
                                return (
                                    <ListItem
                                        key={index}
                                        style={{ ...LOCAL_STYLES.item }}
                                    >
                                        <span>
                                            {item.user.username}{" "}
                                        </span>
                                        <span>
                                            {item.teams.map((team, index) => {
                                                return (
                                                    <span key={index}>
                                                        {team.name}
                                                    </span>
                                                );
                                            })}
                                        </span>
                                    </ListItem>
                                );
                            })}
                        </List>

                        <div style={{ margin: "10px" }}>
                            <div>Invite User to Team</div>
                            <TeamAssignmentForm />
                        </div>

                        <div style={{ margin: "10px" }}>
                            <div>Create new Team</div>
                            <NewTeamForm />
                        </div>

                        <div style={{ margin: "10px" }}>
                            <div>Create new User</div>
                            <NewUserForm />
                        </div>
                    </div>
                </div>
            </ViewWrapper>
        );
    }
}

const LOCAL_STYLES = {
    container: {
        fontFamily: "arial",
        minHeight: "100vh",
        backgroundColor: "rgb(40, 44, 52)",
        color: "#fff",
        overflow: "auto"
    },

    item: {
        margin: "10px",
        padding: "10px",
        color: "white",
        background: "grey"
    }
};

AdminView.contextTypes = {
    router: PropTypes.object.isRequired
};

export default AdminView;

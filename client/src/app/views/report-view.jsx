import { Component, PropTypes } from "react";
import FB from "styles/flexbox";
import Navbar from "../components/navbar";
import ViewWrapper from "views/view-wrapper";
import { List, ListItem, MakeSelectable } from "material-ui/List";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
let agent = require("superagent-promise")(require("superagent"), Promise);
import Avatar from "material-ui/Avatar";
import ReportViewer from "components/ReportViewer/ReportViewer";

import {
    blue300,
    indigo900,
    orange200,
    deepOrange300,
    pink400,
    purple500
} from "material-ui/styles/colors";

import {
    Card,
    CardActions,
    CardHeader,
    CardMedia,
    CardTitle,
    CardText
} from "material-ui/Card";
import FlatButton from "material-ui/FlatButton";

class ReportView extends Component {
    constructor(...args) {
        super(...args);
        this.socket = window.socket;

        this.state = {
            users: [],
            user: {},
            reports: [
                {
                    title: `Hot files in your repo`,
                    subtitle: `See what files are getting noticed`,
                    itemType: "File",
                    data: []
                },
                {
                    title: `Team members working on the same resources`,
                    subtitle: `We found 3 who might be helpful`,
                    itemType: "User",
                    data: []
                }
            ]
        };
    }

    async componentWillMount() {
        let res = await agent.get("http://localhost:3000/init");
        console.log(this.socket);
        this.socket.connect();

        this.socket.on("reports", msg => {
            let reports = this.state.reports;

            let newReports = msg.reports;
            newReports.forEach(report => {
                reports.unshift(report);
            });

            reports.splice(10, reports.length - 10);

            this.setState({
                reports: reports
            });
        });
    }

    render() {
        let reports = this.state.reports.map((report, key) => {
            return <ReportViewer key={key} report={report} />;
        });

        return (
            <ViewWrapper>
                <div style={{ ...LOCAL_STYLES.container }}>
                    <div>
                        <div style={{ paddingLeft: 10 }}>
                            <h3>Report</h3>
                        </div>

                        {reports}

                        {/*<Item  style={{"margin": 20}} title="@binkbeats is working with you" subtitle="You share 13 files"/>
            <Item  style={{"margin": 20}} title="Hot file in your repo" subtitle="42 users interacted with this file"/>
            <Item  style={{"margin": 20}} title="Team members you should talk to" subtitle="They probably know what you're working on"/>
            <Item  style={{"margin": 20}} title="Found by other users" subtitle="Popular files you havent seen yet "/>
            <Item  style={{"margin": 20}} title="Most popular keywords in your repo" subtitle="What are people working on?"/>
            <Item  style={{"margin": 20}} title="Last week's focus" subtitle="This is what you've been working on"/>*/}
                    </div>
                </div>
            </ViewWrapper>
        );
    }
}

const Item = props =>
    <Card {...props}>
        <CardHeader
            title={props.title}
            subtitle={props.subtitle}
            actAsExpander={true}
            showExpandableButton={true}
        />

        <CardText>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
            mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
        </CardText>

        <div style={{ padding: 10, fontSize: 10, color: "grey" }}>
            Three minutes ago
        </div>
    </Card>;

const CardExampleWithAvatar = props =>
    <Card {...props}>
        <CardHeader
            title="URL Avatar"
            subtitle="Subtitle"
            avatar={
                <Avatar
                    color={deepOrange300}
                    backgroundColor={purple500}
                    size={30}
                >
                    URL
                </Avatar>
            }
        />

        <CardText>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
            mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
        </CardText>
        <CardActions>
            <FlatButton label="Action1" />
            <FlatButton label="Action2" />
        </CardActions>
    </Card>;

const LOCAL_STYLES = {
    container: {
        fontFamily: "arial",
        minHeight: "100vh",
        color: "#fff",
        backgroundColor: "rgb(62, 66, 75)",
        overflow: "auto"
    },

    item: {
        margin: "10px",
        padding: "10px",
        color: "white",
        background: "grey"
    }
};

ReportView.contextTypes = {
    router: PropTypes.object.isRequired
};

export default ReportView;

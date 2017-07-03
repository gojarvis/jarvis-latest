import { PropTypes, Component } from "react";
import FB from "styles/flexbox";
import { List, ListItem, MakeSelectable } from "material-ui/List";
import DeleteIcon from "material-ui/svg-icons/action/delete";
import Subheader from "material-ui/Subheader";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import IconText from "components/IconText";
let agent = require("superagent-promise")(require("superagent"), Promise);

class UrlFilteringEditor extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            expression: ""
        };
    }

    static displayName = "UrlFilteringEditor";

    componentDidMount() {}

    async save() {
        let { expression } = this.state;
        if (expression) {
            let result = this.props.saveExpression(expression);
            this.setState({ expression: "" });
            this.inputRef.focus();
        }
    }

    updateExpression = event => {
        this.setState({
            expression: event.target.value
        });
    };

    render() {
        let expressionsListItems = this.props.expressions.map(
            (expression, index) => {
                return (
                    <ListItem
                        key={index}
                        leftIcon={
                            <DeleteIcon
                                onClick={e =>
                                    this.props.deleteExpression(expression)}
                            />
                        }
                    >
                        {expression.address}
                    </ListItem>
                );
            }
        );

        return (
            <div>
                <List>
                    <Subheader>Expression List</Subheader>
                    {expressionsListItems}
                </List>
                <div>
                    <Subheader>Add Expression</Subheader>
                    <div style={{ paddingLeft: 20 }}>
                        <TextField
                            hintStyle={{ color: "#888" }}
                            hintText="Expression"
                            ref={ref => (this.inputRef = ref)}
                            onKeyUp={event => {
                                event.keyCode === 13 ? this.save() : null;
                            }}
                            onChange={this.updateExpression}
                            value={this.state.expression}
                        />
                        <RaisedButton
                            onClick={() => this.save()}
                            label={"Save"}
                            primary={true}
                            style={{ flex: "1 1 auto", margin: 10 }}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

UrlFilteringEditor.propTypes = {
    expressions: PropTypes.array,
    saveExpression: PropTypes.func,
    deleteExpression: PropTypes.func
};

UrlFilteringEditor.defaultProps = {
    expressions: []
};

export default UrlFilteringEditor;

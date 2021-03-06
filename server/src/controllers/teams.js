let GraphUtil = require("../utils/graph");
let graphUtil = new GraphUtil();
let _ = require("lodash");
let Moniker = require("moniker");

let projectSettingsManager = require("../utils/settings-manager");

let graphCredentials = projectSettingsManager.getRepoCredentials();

let graph = require("seraph")({
    user: graphCredentials.username,
    pass: graphCredentials.password,
    server: graphCredentials.address
});

class TeamsController {
    constructor() {}

    getSaveTeam(teamName) {
        let self = this;

        return new Promise(async function(resolve, reject) {
            let node = await self.getTeamByName(teamName);
            console.log("len", !_.isUndefined(node) && node.length > 0);
            if (!_.isUndefined(node) && node.length > 0) {
                resolve(node[0]);
            } else {
                console.log("Need to save");
                try {
                    let password = Moniker.choose();
                    console.log("Saving", teamName, password);

                    graph.save(
                        {
                            type: "team",
                            address: teamName,
                            name: teamName,
                            password: password
                        },
                        "Team",
                        function(err, node) {
                            console.log("err ", err, "node ", node);
                            if (err) {
                                reject("cant save team", err);
                            } else {
                                resolve(node[0]);
                            }
                        }
                    );
                } catch (e) {
                    console.log("team probably exists", e);
                }
            }
        });
    }

    async relateUserToTeam(username, teamname) {
        let self = this;

        let userNode;
        let teamNode;
        let relationship;
        let detached;
        try {
            userNode = await graphUtil.getUserNodeByUsername(username);
            teamNode = await self.getTeamByName(teamname);
            relationship = await graphUtil.relateNodes(
                userNode,
                teamNode,
                "member"
            );

            //TODO: DETACH INVITE NODES
            detached = await graphUtil.deleteRelationship(
                userNode,
                teamNode,
                "invited"
            );

            return relationship;
        } catch (e) {
            console.log("cant relate", e);
        }
    }

    async disassociatedUserFromTeam(username, team) {
        let self = this;

        let userNode;
        let teamNode;
        let relationship;
        let detached;
        try {
            userNode = await graphUtil.getUserNodeByUsername(username);
            teamNode = await self.getTeamByName(teamname);

            detached = await graphUtil.deleteRelationship(
                userNode,
                teamNode,
                "memeber"
            );

            return relationship;
        } catch (e) {
            console.log("cant disassociate", e);
        }
    }

    async inviteUserToTeam(username, teamname) {
        let self = this;

        let userNode;
        let teamNode;
        let relationship;
        try {
            userNode = await graphUtil.getUserNodeByUsername(username);
            teamNode = await self.getTeamByName(teamname);
            relationship = await graphUtil.relateNodes(
                userNode,
                teamNode,
                "invited"
            );

            return relationship;
        } catch (e) {
            console.log("cant invite", e);
        }
    }

    getTeamByName(teamName) {
        return new Promise(function(resolve, reject) {
            graph.find({ type: "team", address: teamName }, function(
                err,
                node
            ) {
                if (err) {
                    console.log("cant get team by name", err);
                    reject("cant get team by name", err);
                } else {
                    resolve(node[0]);
                }
            });
        });
    }

    async getTeamsByUserId(userId) {
        let userTeams = [];
        try {
            let cypher =
                "match (user:User)-[r:member]-(team:Team) where ID(user) = " +
                userId +
                " return team";
            userTeams = await graphUtil.queryGraph(cypher);
        } catch (e) {
            console.log("cant find user teams", e);
        } finally {
            return userTeams;
        }
    }

    async getTeamMembersByUserId(userId) {
        let userTeams = [];
        try {
            let cypher =
                "match (user:User)-[r:member]-(team:Team)-[otherMemeber:member]-(targetUser:User) where ID(user) = " +
                userId +
                " return targetUser";
            userTeams = await graphUtil.queryGraph(cypher);
        } catch (e) {
            console.log("cant find user teams", e);
        } finally {
            return userTeams;
        }
    }

    getAllTeams() {
        return new Promise(function(resolve, reject) {
            graph.find({ type: "team" }, function(err, nodes) {
                if (err) reject("cant get team by name", err);
                else resolve(nodes);
            });
        });
    }
}

module.exports = new TeamsController();

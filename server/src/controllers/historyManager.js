var db = require("../utils/rethink");
var type = db.type;

var Event = db.createModel("Event", {
    id: type.string(),
    timestamp: type.date(),
    source: type.string(),
    eventType: type.string(),
    data: type.object(),
    user: type.string()
});

class HistoryManager {
    constructor(socket, io, userName) {
        this.user = userName;
        this.socket = socket;
        this.io = io;
    }

    saveEvent(event) {
        try {
            let ev = new Event({
                timestamp: new Date(),
                eventType: event.type,
                source: event.source,
                data: event.data,
                user: this.user
            });
            this.io.emit("system-event", ev);
            return ev.save();
        } catch (e) {
            console.error("History Manager: error saving history event", e);
        }
    }

    saveContext(event) {
        try {
            let ev = new Event({
                timestamp: new Date(),
                eventType: event.type,
                source: event.source,
                data: event.data,
                user: this.user
            });
            return ev.save();
        } catch (e) {
            console.error("History Manager: error saving context event", e);
        }
    }

    //TODO
    getGroupedEventByType(eventType, grouping) {}
}

module.exports = HistoryManager;

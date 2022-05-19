import { WebSocketServer } from 'ws';
import express from 'express';
import cors from 'cors'

function createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const app = express();

app.use(cors())

const port = 3001;

const sessions = []

app.get('/getSession', (req, res) => {
    if(sessions.length === 0) {
        const newSession = {sessionId: createUUID(), socketPlayer1: null, socketPlayer2: null}
        sessions.push(newSession)
        res.send(newSession);
        return
    }
    const existingSession = sessions[0]
    res.send(existingSession);
});

app.listen(port, () => console.log(`Chat session app ${port}!`))

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
    ws.on('message', function message(data) {
        const command = data.toString().split(" ")[0]
        const sessionId = data.toString().split(" ")[1]
        const session = sessions.find(x => x.sessionId === sessionId)
        switch (command){
            case "init":
                if(session.socketPlayer1 === null) {
                    session.socketPlayer1 = ws
                    break
                }
                if(session.socketPlayer2 === null) {
                    session.socketPlayer2 = ws;
                    break
                }
                ws.send("cant join this game it is full")
                break
            case "move":
                const move = data.toString().split(" ")[2]
                if(session.socketPlayer1)
                    session.socketPlayer1.send(move)
                if(session.socketPlayer2)
                    session.socketPlayer2.send(move)
            }
    });
});
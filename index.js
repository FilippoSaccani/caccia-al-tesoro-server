const express = require ("express");
const app = express(); //web server

const teams = new Map();
const map = [];
const treasures = [];
const dimensione = 20;
const numero_tesori = 20;
const min_time = 500;

const watchers = [];

app.use("/public", express.static("./public"));

app.get("/sse", (req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
    });

    watchers.push(res);

    res.on("close", () => {
        watchers.splice(watchers.indexOf(res), "1");
    })
});

app.get("/", (req, res) => {
    res.status(200);
});

app.get("/dig", (req, res) => {
    const team = req.query.team.toLowerCase();
    const password = req.query.password.toLowerCase();
    const x = parseInt(req.query.x);
    const y = parseInt(req.query.y);
    
    if (teams.has(team) && teams.get(team).password === password) {
        const currentTime = new Date().getTime();

        if (currentTime - teams.get(team).last_dig < min_time) {
            res.status(400).json({ code: "TOO_FAST" });
        }
        else {
            if (map[y][x].dug) {
                teams.get(team).score -= 10;
            }
            else {
                map[y][x].dug = true;
                map[y][x].dugBy = team;
        
                let closestDistance = dimensione;
        
                for (let i in treasures) {
                    let distance = Math.sqrt(Math.pow(treasures[i].x - x, 2) + Math.pow(treasures[i].y - y, 2));

                    if (distance === 0) {
                        map[y][x].treasure = true;
                        teams.get(team).score += 100;
                        res.status(200).json({ code: "TREASURE_FOUND" });
                        treasures.splice(i, 1);
                        i--;
                    }

                    if (distance < closestDistance) closestDistance = distance;
                }
        
                if (closestDistance !== 0) {
                    map[y][x].treasure = false;
        
                    if (closestDistance <= 2) {
                        res.status(200).json({ code: "VERY_CLOSE" });
                    }
                    else if (closestDistance <= 5) {
                        res.status(200).json({ code: "CLOSE" });
                    }
                    else {
                        res.status(200).json({ code: "FAR_AWAY" });
                    }
                }
            }
        }

        teams.get(team).last_dig = currentTime;

        watchers.forEach((value) => {
            value.write(`data: ${JSON.stringify({code: "DUG"})}\n\n`);
        })
    }
    else {
        res.status(401).json({code: "AUTHENTICATION_FAILED"});
    }
});

app.get("/map", (req, res) => {
    res.json(map);
});

app.get("/displayMap", (req, res) => {
    let content = "<link rel='stylesheet' href='./public/style.css'>"

    content += "<table id='tabella'>";

    for (let i=0; i<dimensione; i++) {
        
        content += "<tr>";

        for (let j = 0; j < dimensione; j++) {
            content += "<td>";
            if (map[i][j].treasure) {
                content += "<img src='./public/treasure.png'>";
            }
            else if (map[i][j].dug) {
                content += "<img src='./public/dirt.png'>";
            }
            else {
                content += "<img src='./public/grass.jpg'>";
            }
            content += "</td>";
        }
        
        content += "</tr>";
    }
    content += "</table>";

    content += "\
    <script> \
        const evtSource = new EventSource('/sse');\
        \
        evtSource.onmessage = async (event) => {\
            if (JSON.parse(event.data).code === 'DUG') {\
                await fetch('/displayMap').then(response => response.text()).then(data => {\
                    document.getElementById('tabella').innerHTML = data;\
                })\
            }\
        }\
    </script>";

    res.status(200).send(content);
});

app.get("/signup", (req, res) => {
    const team = req.query.team.toLowerCase();
    const password = req.query.password.toLowerCase();

    if (teams.has(team)) {
        res.status(409).json({ code: "TEAM_TAKEN" });
    }
    else {
        teams.set(team, {password: password, score: 0, last_dig: 0});
        res.status(200).json({ code: "REGISTRATION_SUCCESSFUL", time: min_time });
    }
});

app.get("/leaderboard", (req, res) => {
    let leaderboard = "";

    teams.forEach (function(value, key) {
        leaderboard += `{ nome: ${key}, punteggio:  ${value.score} }, `;
    })

    res.json(leaderboard);
});

const generateMap = () => {
    for (let i=0; i<dimensione; i++) {
        map.push([]);
        for (let j=0; j<dimensione; j++) {
            map[i].push({x: j, y: i, dug: false, treasure: null, dugBy: null});
        }
    }
}

const generateTreasures = () => {
    let randX;
    let randY;
    
    for (let i = 0; i < numero_tesori; i++) {
        randX = Math.floor(Math.random()*dimensione);
        randY = Math.floor(Math.random()*dimensione);

        for (let j=0; j<treasures.length; j++) {
            if (treasures[j].x === randX && treasures[j].y === randY) {
                randX = Math.floor(Math.random()*dimensione);
                randY = Math.floor(Math.random()*dimensione);
            }
        }

        treasures.push({x: randX, y: randY});
    }
}

generateMap();
generateTreasures();

app.listen(8080, () => {
    console.log("server connesso");
});
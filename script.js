// Online Voting System (Demo)
// everything is saved in localStorage, so it works only for this browser

let candidates = [
    { id: 1, name: "Aarav Mehta", symbol: "📚", agenda: "More library hours and study groups" },
    { id: 2, name: "Ishita Rana", symbol: "🎸", agenda: "Monthly cultural events and fests" },
    { id: 3, name: "Kabir Thakur", symbol: "⚽", agenda: "Better sports facilities" },
    { id: 4, name: "Sneha Verma", symbol: "💻", agenda: "Coding club and hackathons" },
    { id: 5, name: "NOTA", symbol: "❌", agenda: "None of the above" }
];

let ADMIN_PASSWORD = "admin123";

// votes = { 1: 0, 2: 0, ... }  candidate id -> number of votes
let votes = {};
let votedRolls = [];   // roll numbers that have already voted
let myVote = null;     // vote given from this browser

function loadData() {
    let v = localStorage.getItem("votes");
    if (v != null) {
        votes = JSON.parse(v);
    }
    // make sure every candidate has a count
    for (let i = 0; i < candidates.length; i++) {
        if (votes[candidates[i].id] == undefined) {
            votes[candidates[i].id] = 0;
        }
    }

    let r = localStorage.getItem("votedRolls");
    if (r != null) {
        votedRolls = JSON.parse(r);
    }

    let m = localStorage.getItem("myVote");
    if (m != null) {
        myVote = JSON.parse(m);
    }
}

function saveData() {
    localStorage.setItem("votes", JSON.stringify(votes));
    localStorage.setItem("votedRolls", JSON.stringify(votedRolls));
    if (myVote == null) {
        localStorage.removeItem("myVote");
    } else {
        localStorage.setItem("myVote", JSON.stringify(myVote));
    }
}

function findCandidate(id) {
    for (let i = 0; i < candidates.length; i++) {
        if (candidates[i].id == id) {
            return candidates[i];
        }
    }
    return null;
}

function showCandidates() {
    let html = "";
    for (let i = 0; i < candidates.length; i++) {
        let c = candidates[i];
        html += "<label class='cand'>" +
            "<input type='radio' name='candidate' value='" + c.id + "'>" +
            "<div class='cand-card'>" +
            "<span class='symbol'>" + c.symbol + "</span>" +
            "<div><div class='cand-name'>" + c.name + "</div><div class='agenda'>" + c.agenda + "</div></div>" +
            "</div></label>";
    }
    document.getElementById("candidates").innerHTML = html;
}

// shows voting form or thank you box
function showStatus() {
    if (myVote == null) {
        document.getElementById("voteBox").classList.remove("hidden");
        document.getElementById("doneBox").classList.add("hidden");
    } else {
        let c = findCandidate(myVote.candidate);
        document.getElementById("voteDetails").innerHTML =
            "<b>" + myVote.name + "</b> (" + myVote.roll + ") voted for <b>" + c.symbol + " " + c.name + "</b><br>on " + myVote.time;
        document.getElementById("voteBox").classList.add("hidden");
        document.getElementById("doneBox").classList.remove("hidden");
    }
}

function castVote() {
    let msg = document.getElementById("msg");
    let name = document.getElementById("voterName").value.trim();
    let roll = document.getElementById("rollNo").value.trim().toUpperCase();
    let selected = document.querySelector("input[name='candidate']:checked");

    if (myVote != null) {
        msg.innerHTML = "You have already voted from this browser.";
        return;
    }

    // name should have only letters and spaces
    if (name.length < 3 || !/^[A-Za-z ]+$/.test(name)) {
        msg.innerHTML = "Please enter your full name (letters only).";
        return;
    }
    // roll no like 23BCS045, only letters and numbers
    if (roll.length < 4 || !/^[A-Z0-9]+$/.test(roll)) {
        msg.innerHTML = "Please enter a valid roll number.";
        return;
    }
    if (selected == null) {
        msg.innerHTML = "Please select a candidate.";
        return;
    }
    if (votedRolls.includes(roll)) {
        msg.innerHTML = "Roll number " + roll + " has already voted!";
        return;
    }

    let c = findCandidate(selected.value);
    if (!confirm("Vote for " + c.name + "?\nYou cannot change it later.")) {
        return;
    }

    votes[c.id] = votes[c.id] + 1;
    votedRolls.push(roll);
    myVote = {
        name: name,
        roll: roll,
        candidate: c.id,
        time: new Date().toLocaleString("en-IN")
    };
    saveData();

    msg.innerHTML = "";
    showStatus();
    showResults();
}

function showResults() {
    let total = 0;
    let max = 0;
    for (let i = 0; i < candidates.length; i++) {
        total = total + votes[candidates[i].id];
        if (votes[candidates[i].id] > max) {
            max = votes[candidates[i].id];
        }
    }

    document.getElementById("totalVotes").innerHTML = "Total votes: " + total;

    let html = "";
    let leaders = [];   // can be more than one if there is a tie
    for (let i = 0; i < candidates.length; i++) {
        let c = candidates[i];
        let count = votes[c.id];
        let percent = 0;
        if (total > 0) {
            percent = (count / total) * 100;
        }

        let fillClass = "fill";
        if (count == max && max > 0) {
            fillClass = "fill top";
            if (c.name != "NOTA") {
                leaders.push(c.name);
            }
        }

        let word = " votes";
        if (count == 1) word = " vote";

        html += "<div class='result-row'>" +
            "<div class='result-top'><span>" + c.symbol + " " + c.name + "</span><span>" + count + word + " (" + percent.toFixed(1) + "%)</span></div>" +
            "<div class='bar'><div class='" + fillClass + "' style='width:" + percent + "%'></div></div>" +
            "</div>";
    }
    document.getElementById("results").innerHTML = html;

    let leader = document.getElementById("leader");
    if (total == 0) {
        leader.innerHTML = "No votes yet.";
    } else if (leaders.length == 0) {
        leader.innerHTML = "NOTA is leading!";
    } else if (leaders.length == 1) {
        leader.innerHTML = "&#127942; Leading: " + leaders[0];
    } else {
        leader.innerHTML = "It's a tie between " + leaders.join(" and ");
    }
}

/* ---------- admin ---------- */

function checkPassword() {
    let pass = document.getElementById("adminPass").value;
    let adminMsg = document.getElementById("adminMsg");
    if (pass != ADMIN_PASSWORD) {
        adminMsg.innerHTML = "Wrong password!";
        adminMsg.style.color = "red";
        return false;
    }
    return true;
}

// removes this browser's vote lock so another person can vote (votes stay counted)
function nextVoter() {
    if (!checkPassword()) return;
    let adminMsg = document.getElementById("adminMsg");

    if (myVote == null) {
        adminMsg.innerHTML = "No one has voted yet on this browser.";
        adminMsg.style.color = "#555";
        return;
    }

    myVote = null;
    saveData();
    document.getElementById("voterName").value = "";
    document.getElementById("rollNo").value = "";
    showCandidates();   // clears the selected radio
    showStatus();

    adminMsg.innerHTML = "Ready for next voter.";
    adminMsg.style.color = "green";
    document.getElementById("adminPass").value = "";
}

function resetAll() {
    if (!checkPassword()) return;
    if (!confirm("This will delete ALL votes. Continue?")) return;

    votes = {};
    for (let i = 0; i < candidates.length; i++) {
        votes[candidates[i].id] = 0;
    }
    votedRolls = [];
    myVote = null;
    saveData();

    showCandidates();
    showStatus();
    showResults();

    let adminMsg = document.getElementById("adminMsg");
    adminMsg.innerHTML = "All votes cleared.";
    adminMsg.style.color = "green";
    document.getElementById("adminPass").value = "";
}


// start
loadData();
showCandidates();
showStatus();
showResults();

var socket = io();
let form = document.getElementById("form");
let input = document.getElementById("input");
let msgbox = document.getElementById("msgbox-cont");
var file = document.getElementById("file");
var chatbox = document.getElementById("chatbox");
var pref = document.getElementById("pref");
var audio = new Audio("./assets/cat_sms.mp3");

let { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
if (!username) {
  username = prompt("Enter Your username..");
}
if (room == "cafe") {
  alert("Welcome to cafe");
  document.getElementById("label").style = "display:none";
  document.getElementById("input").style.padding = "0px 0px 0px 20px";
  document.getElementById("intro").innerHTML =
    "Welcome to Cafe <br/> Your Chats won't be saved here so make sure you don't miss anything before leaving..";
}

function start() {
  scroll();
  document.getElementById("name").innerHTML = username;
  document.getElementById("room").innerHTML = room;
}

function scroll() {
  msgbox.scrollTop = msgbox.scrollHeight;
}

let x = Math.floor(Math.random() * 6) + 1;
document.getElementById("dp").setAttribute("src", "./assets/dp" + x + ".jpg");

socket.on("connect", () => {
  socket.emit("user", { name: username, sid: socket.id, room: room });
});

socket.on("usersList", (user) => {
  document.getElementById("users").innerHTML = "";
  for (let list of user) {
    if (list != username) {
      let userhere = document.createElement("div");
      userhere.className += "user";
      userhere.textContent = list;
      document.getElementById("users").append(userhere);
    }
  }
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", {
      nameofsender: username,
      message: input.value,
    });
    let msgs = document.createElement("div");
    msgs.className += "your-msg";
    msgs.textContent = input.value;
    document.getElementById("msgbox").append(msgs);
    input.value = "";
    scroll();
  }
});

let c = 1;
function shrink() {
  if (screen.width < 1000) {
    if (c == 0) {
      c = 1;
      chatbox.style.left = "0px";
      document.getElementById("logo").style.cssText =
        "top: 8px;height: 20px;width: 28px;box-sizing: border-box;";
    } else {
      c = 0;
      chatbox.style.left = "80px";
      document.getElementById("logo").style.cssText =
        "top: 10px;height: 40px;width: 40px;box-sizing: unset;";
    }
  }
}

function ring() {
  socket.emit("ring", true);
}

socket.on("output-messages", (outmsg) => {
  outputmsg = outmsg.reverse();
  for (let x of outputmsg) {
    readmsgs(x);
    scroll();
  }
});

socket.on("msg", (msg) => {
  let msgs = document.createElement("div");
  msgs.className += "other-msg";
  msgs.textContent = msg.nameofsender + ": " + msg.message;
  document.getElementById("msgbox").append(msgs);
  scroll();
});

socket.on("fileInfo", (FileInfo) => {
  let x = {
    username: FileInfo.nameofsender,
    filename: FileInfo.filename,
    type: FileInfo.filetype,
  };
  readmsgs(x);
});

socket.on("ring", (ring) => {
  if (ring) {
    audio.play();
  }
});

file.onchange = () => {
  socket.emit("filesender", {
    name: username,
    room: room,
  });
  const selectedFile = file.files[0];
  if (selectedFile) {
    imgform.submit();
    file.value = null;
  }
};

function readmsgs(x) {
  let msgs = document.createElement("div");
  document.getElementById("msgbox").append(msgs);
  if (x.type == "text") {
    if (x.username == username) {
      msgs.className += "your-msg";
      msgs.textContent = x.message;
    } else {
      msgs.className += "other-msg";
      msgs.textContent = x.username + ": " + x.message;
    }
  } else if (x.type == "image") {
    if (x.username == username) {
      msgs.className += "img-msg your-msg";
      imgaddr = "./uploads/" + x.filename;
      msgs.innerHTML = "<img src='" + imgaddr + "'/>";
    } else {
      msgs.className += "img-msg other-msg";
      let mssg = document.createElement("p");
      mssg.className += "sender";
      mssg.textContent = x.username + ":";
      msgs.append(mssg);
      let msssg = document.createElement("img");
      imgaddr = "./uploads/" + x.filename;
      msssg.setAttribute("src", imgaddr);
      msgs.append(msssg);
    }
  } else if (x.type == "audio") {
    if (x.username == username) {
      msgs.classList += "mp3 your-msg";
      audaddr = "./uploads/" + x.filename;
      msgs.innerHTML =
        "<audio controls><source src='" +
        audaddr +
        "' type='" +
        x.type +
        "/mp3'/></audio>";
    } else {
      msgs.className += "mp3 other-msg";
      let mssg = document.createElement("p");
      mssg.className += "sender";
      mssg.textContent = x.username + ":";
      msgs.append(mssg);
      let msssg = document.createElement("audio");
      msssg.setAttribute("controls", "true");
      msgs.append(msssg);
      let mssssg = document.createElement("source");
      let audaddr = "./uploads/" + x.filename;
      mssssg.setAttribute("src", audaddr);
      mssssg.setAttribute("type", x.type + "/mp3");
      msssg.append(mssssg);
    }
  } else if (x.type == "video") {
    if (x.username == username) {
      msgs.className += "mp4 your-msg";
      vidaddr = "./uploads/" + x.filename;
      msgs.innerHTML =
        "<video controls><source src='" +
        vidaddr +
        "' type='" +
        x.type +
        "/mp4'/></video>";
    } else {
      msgs.className += "mp4 other-msg";
      let mssg = document.createElement("p");
      mssg.className += "sender";
      mssg.textContent = x.username + ":";
      msgs.append(mssg);
      let msssg = document.createElement("video");
      msssg.setAttribute("controls", "true");
      msgs.append(msssg);
      let mssssg = document.createElement("source");
      let vidaddr = "./uploads/" + x.filename;
      mssssg.setAttribute("src", vidaddr);
      mssssg.setAttribute("type", x.type + "/mp4");
      msssg.append(mssssg);
    }
  } else {
    if (x.username == username) {
      msgs.className += "oth your-msg";
      othaddr = "./uploads/" + x.filename;
      msgs.innerHTML =
        "<div class='file'>" +
        x.filename +
        "</div><a download href='" +
        othaddr +
        "'><img src='./assets/dload.png'></a>";
    } else {
      msgs.className += "oth other-msg";
      let mssg = document.createElement("p");
      mssg.className += "sender";
      mssg.textContent = x.username + ":";
      msgs.append(mssg);
      let msssg = document.createElement("div");
      msssg.className += "file";
      msssg.textContent = x.filename;
      msgs.append(msssg);
      let mssssg = document.createElement("a");
      mssssg.setAttribute("download", "true");
      let linkaddr = "./uploads/" + x.filename;
      mssssg.setAttribute("href", linkaddr);
      msgs.append(mssssg);
      let logomsg = document.createElement("img");
      logomsg.setAttribute("src", "./assets/dload.png");
      mssssg.append(logomsg);
    }
  }
}

function drop() {
  let conform = confirm("Do you really want to delete the whole chat?");
  if (conform) {
    socket.emit("todrop", room);
  }
}

let y = 0;
function profile() {
  if (y == 0) {
    y = 1;
    chatbox.style.display = "none";
    pref.style.display = "block";
  } else {
    y = 0;
    chatbox.style.display = "block";
    pref.style.display = "none";
  }
}

let darkmod = 0;
function darkmode() {
  if (darkmod == 0) {
    document.body.style.background = "#000110";
    document.getElementById("chatbox").style.cssText =
      "background:black;color:white;";
    document.getElementById("pref").style.cssText =
      "background:black;color:white;";
    darkmod = 1;
  } else {
    document.body.style.background = "#e6f3ff";
    document.getElementById("chatbox").style.cssText =
      "background:#f5f8fc;color:black;";
    document.getElementById("pref").style.cssText =
      "background:white;color:black;";
    darkmod = 0;
  }
  c = 1;
  shrink();
}

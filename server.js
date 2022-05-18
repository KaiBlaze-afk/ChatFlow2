const Msg = require("./model/model");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(
  process.env.MONGODB_LINK,
  { useNewUrlParser: true },
  (error) => {
    !error
      ? console.log("Database connected..")
      : console.log("Something went wrong while connecting database!");
  }
);

const express = require("express");
const app = express();
const http = require("http");
const upload = require("express-fileupload");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
app.use(upload());
app.use(express.json());
app.use(express.static("public"));

let usersOnline = [];

io.on("connection", (socket) => {
  socket.on("user", (user) => {
    socket.join(user.room);
    usersOnline.push(user);

    if (user.room != "cafe") {
      Msg.find({ room: user.room })
        .sort({ time: -1 })
        .limit()
        .then((result) => {
          socket.emit("output-messages", result);
        });
    }

    const usrnames = usersOnline.filter((item) => {
      return item.room == user.room;
    });
    const usernames = usrnames.map((username) => {
      return username.name;
    });
    io.to(user.room).emit("usersList", usernames);

    socket.on("chat message", (msg) => {
      socket.broadcast.to(user.room).emit("msg", msg);
      const msgdb = new Msg({
        type: "text",
        username: msg.nameofsender,
        message: msg.message,
        time: new Date().getTime(),
        room: user.room,
      });
      msgdb.save();
    });

    socket.on("todrop", (r2d) => {
      Msg.deleteMany({ room: r2d })
        .then(function () {
          console.log("Data deleted");
        })
        .catch(function (error) {
          console.log(error);
        });
    });
    socket.on("ring", (ring) => {
      socket.broadcast.to(user.room).emit("ring", true);
    });
  });

  socket.on("disconnect", () => {
    index = usersOnline.findIndex((x) => x.sid === socket.id);
    let uoi = usersOnline[index];
    let roomid = uoi.room;
    usersOnline.splice(index, 1);
    const usrnames = usersOnline.filter((item) => {
      return item.room == roomid;
    });
    const usernames = usrnames.map((username) => {
      return username.name;
    });
    io.to(roomid).emit("usersList", usernames);
  });

  socket.on("filesender", (sender) => {
    suser = sender;
    app.post("/", (req, res) => {
      if (req.files) {
        var file = req.files.file;
        var filename = file.name;
        var ext = filename.split(".").pop();
        let format = null;
        if (ext == "jpg" || ext == "png" || ext == "jpeg" || ext == "gif") {
          format = "image";
        } else if (
          ext == "mp4" ||
          ext == "webm" ||
          ext == "mkv" ||
          ext == "mov" ||
          ext == "3gp"
        ) {
          format = "video";
        } else if (ext == "mp3" || ext == "wav" || ext == "ogg") {
          format = "audio";
        } else {
          format = "other";
        }

        const msgdb = new Msg({
          type: format,
          username: suser.name,
          filename: filename,
          time: new Date().getTime(),
          room: suser.room,
        });
        msgdb.save();

        file.mv("./public/uploads/" + filename, function (err) {
          if (err) {
            res.send(err);
          } else {
            res.sendFile(__dirname + "/public/index.html");
            const sq =
              "/main.html?username=" + suser.name + "&room=" + suser.room;
            res.redirect(sq);

            socket.broadcast.to(suser.room).emit("fileInfo", {
              nameofsender: suser.name,
              filename: filename,
              filetype: format,
            });
          }
        });
      }
    });
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server Started...");
});

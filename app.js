//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://ahmed:test-123@cluster0.g9rn0.mongodb.net/todolistDb",
  {
    useNewUrlParser: true,
  }
);
const itemSchema = { name: String };
const itemsCl = mongoose.model("items", itemSchema);

const lists = mongoose.model("lists", {
  name: String,
  items: [{ name: String }],
});

const items = [];
const workItems = [];
const item1 = { name: "learning reactjs" };
const item2 = { name: "learning python" };
const item3 = { name: "learning Nodejs" };

app.get("/", function (req, res) {
  itemsCl.find({}, function (err, result) {
    res.render("list", { listTitle: "tody", newListItems: result });
  });
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const listName = req.body.listName.toLowerCase();
  console.log("listName:" + listName);
  if (listName === "tody") {
    itemsCl.create({ name: item }).then((item) => res.redirect("/"));
  } else {
    lists.findOne({ name: listName }, function (err, result) {
      result.items.push({ name: item });
      result.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  console.log(req.body.listName);
  if (req.body.listName === "tody") {
    itemsCl.findByIdAndRemove(req.body.itemId, function (err, result) {});
    res.redirect("/");
  } else {
    // lists.findOne({ name: req.body.listName }, function (err, resultList) {
    //   const index = resultList.items.findIndex(
    //     (el) => el.id === req.body.itemId
    //   );
    //   console.log(index);
    //   if (index > -1) {
    //     resultList.items.splice(index, 1);
    //   }
    //   resultList.save();
    //   res.redirect("/" + req.body.listName);
    // });

    lists.findOneAndUpdate(
      { name: req.body.listName },
      { $pull: { items: { _id: req.body.itemId } } },
      function (err, resultList) {
        res.redirect("/" + req.body.listName);
      }
    );
  }
});

app.get("/:customRoutName", function (req, res) {
  lists.findOne(
    { name: req.params.customRoutName.toLowerCase() },
    function (err, result) {
      if (!result) {
        //create a new items
        lists.create({
          name: req.params.customRoutName.toLowerCase(),
          items: [item1],
        });

        res.redirect("/" + req.params.customRoutName);
      } else {
        //show the items
        res.render("list", {
          listTitle: req.params.customRoutName,
          newListItems: result.items,
        });
      }
    }
  );
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server started on port 3000");
});

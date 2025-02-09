const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
require("dotenv").config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", (req, res) => {
  const Firstname = req.body.Firstname;
  const Lastname = req.body.Lastname;
  const Email = req.body.Email;

  const data = {
    members: [
      {
        email_address: Email,
        status: "subscribed",
        merge_fields: {
          FNAME: Firstname,
          LNAME: Lastname,
        },
      },
    ],
  };

  const jsonData = JSON.stringify(data);
  const url = `https://${process.env.MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${process.env.LIST_ID}`;

  const options = {
    method: "POST",
    auth: `user:${process.env.API_KEY}`,
  };

  const request = https.request(url, options, (response) => {
    let responseData = "";

    response.on("data", (chunk) => {
      responseData += chunk;
    });

    response.on("end", () => {
      const parsedData = JSON.parse(responseData);
      console.log(parsedData);

      if (response.statusCode === 200) {
        res.sendFile(__dirname + "/success.html");
      } else {
        res.sendFile(__dirname + "/failure.html");
      }
    });
  });

  request.on("error", (error) => {
    console.error("Error connecting to Mailchimp API:", error);
    res.sendFile(__dirname + "/failure.html");
  });

  request.write(jsonData);
  request.end();
});

app.post("/failure", (req, res) => {
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

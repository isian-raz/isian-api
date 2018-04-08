const express = require("express");
const bodyParser = require("body-parser");
const htmlToText = require("html-to-text");
const sgMail = require("@sendgrid/mail");
const secrets = require("./secrets");
sgMail.setApiKey(secrets.SENDGRID_API_KEY);

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/email", (req, res) => {
  const { name, email, phone, message } = req.body;
  const html = `
    <table>
      <tbody>
        <tr>
          <td>Name</td>
          <td>${htmlToText.fromString(name)}</td>
        </tr>
        <tr>
          <td>Email</td>
          <td>${htmlToText.fromString(email)}</td>
        </tr>
        <tr>
          <td>Phone</td>
          <td>${htmlToText.fromString(phone)}</td>
        </tr>
        <tr>
          <td>Message</td>
          <td>${htmlToText.fromString(message)}</td>
        </tr>
      </tbody>
    </table>
  `;
  const text = `
    Name: ${name}\n
    Email: ${email}\n
    Phone: ${phone}\n
    Message:\n
    ${message}
  `;
  const msg = {
    to: secrets.RECIPIENTS,
    from: secrets.SENDER,
    subject: "New message on Isian.io",
    html,
    text
  };

  sgMail
    .send(msg)
    .then(() => {
      res.status(200);
      res.send("OK");
    })
    .catch(err => {
      console.error(err);
      res.status(500);
      res.send("Internal Server Error");
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);

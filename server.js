const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const nodemailer = require("nodemailer");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "referral_system",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.stack);
    return;
  }
  console.log("Connected to MySQL as id " + connection.threadId);
});

// Route to handle form submission
app.post("/submit-form", (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail, program } =
    req.body;

  // Validate data
  if (
    !referrerName ||
    !referrerEmail ||
    !refereeName ||
    !refereeEmail ||
    !program
  ) {
    return res.status(400).send("All fields are required.");
  }

  // Insert data into MySQL
  const query =
    "INSERT INTO referrals (referrerName, referrerEmail, refereeName, refereeEmail, program) VALUES (?, ?, ?, ?, ?)";
  connection.query(
    query,
    [referrerName, referrerEmail, refereeName, refereeEmail, program],
    (error, results) => {
      if (error) {
        return res.status(500).send("Error saving data.");
      }

      // Send thank-you email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "krishnaagrawal876@gmail.com", // Your email address
          pass: "zzme pfvr lqmt zzzw", // Your email password
        },
      });

      const mailOptions = {
        from: "krishnaagrawal876@gmail.com",
        to: referrerEmail,
        subject: "Thank You for Your Referral",
        text: `Dear ${referrerName},\n\nThank you for referring ${refereeName} to our ${program} program.\n\nBest regards,\n accredian`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return res.status(500).send("Error sending email.");
        }
        res.status(200).send("Data saved and email sent successfully.");
      });
    }
  );
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

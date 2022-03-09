const { hash } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const cookie = require("cookie");
const nodemailer = require("nodemailer");
const
  {
    invalidPassword,
    invalidUsername,
    invalidEmail,
  } = require("../../../library/validator");
const { handleError500 } = require("../../../library/errorHandler");

function accountExists(userData) {
  return userData.length > 0;
}

module.exports = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) res.status(400).send("Not All Parameters Provided.");
  else if (invalidPassword(password)) res.status(400).send("Password Not Corresponding The Format (between 4 to 14 characters, including both alphanumerical and non-alphanumerical symbols).");
  else if (invalidEmail(email)) res.status(400).send("Email Not Corresponding The Format (remove the blank spaces or invalid dots).");
  else if (invalidUsername(username)) res.status(400).send("Username Not Corresponding The Format (use lowercase alphabetical characters only, and omit the spaces).");
  else {
    // Find All Users with Similar Usernames and Emails
    await User.findAll(
      {
        where:
        {
          [Op.or]: [
            { username: req.body.username },
            { email: req.body.email }],
        },
      },
    )
      .then((userData) => {
        if (accountExists(userData)) return res.status(403).send("Account Already Exists.");
        else {
          hash(req.body.password, 10, (err, hashString) => {
            if (err) handleError500(req, res, err);
            else {
              User.create(
                {
                  username: req.body.username,
                  password: hashString,
                  email: req.body.email,
                },
              )
                .then((data) => {
                  const token = sign(
                    {
                      id: data.id,
                      username: data.username,
                      email: data.email,
                    },
                    process.env.JWT_KEY,
                  );


                  // send back the token to the user via a cookie
                  // the cookie will be sent back in each up comming req within the req.cookie(s) 
                  // or the req.headers.cookie(s) objects

                  res.setHeader('Set-Cookie', cookie.serialize('token', String(token), {
                    // set these params to maximize security, 
                    // NOTE: secure can break up somethings in the localhost env.

                    httpOnly: true,
                    maxAge: 60 * 60 * 24 * 14,
                    secure: true, // for https
                    path: "/",
                  }));

                  const id_token = sign({ id: data.id }, process.env.Email_Token_Signature, { expiresIn: "4 days", });
                  let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'ghernaoutmassi@gmail.com',
                      pass: process.env.GMAIL_APP_PASS,
                    },
                  });

                  // send mail with defined transport object
                  transporter.sendMail({
                    from: '"Admin" <ghernaoutmassi@gmail.com>', // sender address
                    to: "ghernaoutmassi@gmail.com", // list of receivers
                    // to: `${data.email}`, // list of receivers
                    subject: "Confirm Your Email Address", // Subject line
                    html: `
                      <h3 style="text-align:center;text-decoration:underline;">Welcome to fairfieldprogramming.org</h3>
                      <p>
                      Please validate your email address on  fairfieldprogramming.org by clicking 
                        <a href="http://localhost:8080/confirmEmail/${id_token}">
                          this link
                        </a>
                        .
                        <br/>
                      </p>
                      <p>
                        Thanks for joining us ! 
                        <br/>
                        Kind Regards.
                        <br/>
                        <address>fairfieldprogramming.org <b> team </b></address>
                        <br/>
                      </p>

                      <blockquote style="color:grey">
                          fairfieldprogramming.org is an open-source,
                          non-profit dedicated to the education of children in the world of computer science.
                          <br/>
                          We host competitions, events, and websites in order to forward the learning experience of highschool and college students.
                          Since we are a non-profit and an open-source organization, we would love it if you contribute or donate, 
                          but that is fully up to you!
                      </blockquote>
                    `,
                  });



                  res.redirect("/user");

                }
                )
                .catch((userCreateErr) => handleError500(req, res, userCreateErr));
            }
          });
        }
      })
      .catch((hashErr) => { handleError500(req, res, hashErr); });
  }
};

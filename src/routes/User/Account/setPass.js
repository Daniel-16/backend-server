module.exports = (req, res) => {
  if (!req.params.id || !req.body.password || !req.body.newPassword) return res.status(400).send("Not All Parameters Given.");

  if (!req.user) return res.status(403).send("Not Logged In.");

  if (req.user.id !== req.params.id) return res.status(401).send("Not Authorized.");

  User.findOne(
    {
      where:
      {
        id: req.params.id,
      },
    })
    .then((userData) => {
      bcrypt.compare(
        req.body.password,
        userData.password,
        function (err, result) {
          if (err) {
            console.log(err);
            return res.status(500).send("Internal Server Error.");
          }
          if (!result) return res.status(403).send("Incorrect Password.");

          // Hash New Password
          bcrypt.hash(req.body.newPassword, 10, function (newPassErr, hash) {
            if (newPassErr) {
              console.log(newPassErr);
              return res.status(500).send("Internal Server Error.");
            }

            // Update Password
            userData
              .update(
                {
                  password: hash,
                })
              .then(function (newUserData) {
                // Save the Data
                newUserData
                  .save()
                  .then(function () {
                    return res.status(200).send("Success.");
                  })
                  .catch(function (error) {
                    console.log(error);
                    return res.status(500).send("Internal Server Error.");
                  });
              })
              .catch(function (error) {
                console.log(error);
                return res.status(500).send("Internal Server Error.");
              });
          });
        }
      );
    })
    .catch(function (error) {
      console.log(error);
      return res.status(500).send("Internal Server Error.");
    });
};
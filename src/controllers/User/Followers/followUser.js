const { handleError500 } = require('../../../library/errorHandler');


/**
 * @module Follow User Controller
 * @param {Request} req - HTTP Request from the client
 * @param {Response} res - HTTP Response for the client
 * 
 * @description
 * This controller will allow the user to follow a specific user, if all parameters are correct.
 * 
 * @todo
 * Nothing for now.
 */

module.exports.followUser = (req, res) => {
<<<<<<< HEAD
  if (!req.params.id || !req.params.followerId) res.status(400).send("Not All Parameters Provided.");
  else {
    User.findOne(
      {
        where:
        {
          id: req.user.id,
        },
      },
    )
      .then((followerData) => {
        User.findOne(
          {
            where:
            {
              id: req.params.followerId,
            },
          },
        )
          .then((followeeData) => {
            followeeData
              .addFollower(followerData)
              .then(() => res.json(followeeData))
              .catch((error) => handleError500(error));
          })
          .catch((error) => handleError500(error));
      })
      .catch((error) => handleError500(error));
  }
=======
	if (!req.user) res.status(403).send('Not Logged In.');
	else if (!req.params.id || !req.params.followerId) res.status(400).send('Not All Parameters Provided.');
	else {
		User.findOne({
			where: {
				id: req.user.id,
			},
		})
			.then((followerData) => {
				User.findOne({
					where: {
						id: req.params.followerId,
					},
				})
					.then((followeeData) => {
						followeeData
							.addFollower(followerData)
							.then(() => res.json(followeeData))
							.catch((error) => handleError500(error));
					})
					.catch((error) => handleError500(error));
			})
			.catch((error) => handleError500(error));
	}
>>>>>>> 40f8b7c5ee62f497de5ed4c7d88ed549512bc3b5
};

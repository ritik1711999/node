const User = require("../schema/user.schema");

module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    //TODO: Implement this API
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const users = await User.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          as: "posts",
        },
      },
      {
        $project: {
          name: 1,
          posts: { $size: "$posts" },
        },
      },
    ])
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(100 / limit);

    const pagination = {
      totalDocs: 100,
      limit,
      page,
      totalPages,
      pagingCounter: skip + 1,
      hasPrevPage: page <= 1 ? false : true,
      hasNextPage: page >= totalPages ? false : true,
      prevPage: page <= 1 ? null : page - 1,
      nextPage: page >= totalPages ? null : page + 1,
    };
    res.status(200).json({ data: { users, pagination } });
  } catch (error) {
    res.send({ error: error.message });
  }
};

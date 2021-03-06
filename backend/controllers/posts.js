const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  // + sign converts string to number
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  let fetchedPosts;

  // Pagination
  const postQuery = Post.find();

  if (pageSize && currentPage) {

    postQuery
      // ex. 10 * (2 - 1) = 10 , skipping 10 items;
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }

  postQuery
    .then((documents) => {
      fetchedPosts = documents;
      return Post.countDocuments();
    }).then((count) => {
      res.status(200).json({
        message: 'Posts fetched successfully!',
        posts: fetchedPosts,
        postCount: count
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching posts failed!"
      });
    });
}

// =============================================================================

exports.getPost = (req, res, next) => {

  Post.findById(req.params.id).then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({
          message: 'Post not found.'
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching post failed!"
      });
    });
};

//=============================================================================

exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  // this is thanks to body-parser
  
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId,
    email: req.body.email
  });

  // from mongoose
  post.save().then((createdPost) => {
    res.status(201).json({
      message: 'Post added sucesfully',
      post: {
        ...createdPost,
        id: createdPost._id
      }
    })
  }).catch((error) => {
    res.status(500).json({
      message: 'Creating a post failed!'
    });
  });
};

// ===========================================================================

exports.updatePost = (req, res, next) => {

  let imagePath = req.body.imagePath;

  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename;
  }

  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId,
    email: req.body.email
  });

  Post.updateOne(
    {
      _id: req.params.id,
      creator: req.userData.userId
    },
     post)
     .then((result) => {  
      if (result.nModified > 0 || result.n > 0) {
        res.status(200).json({
          message: 'Update sucessfully!'
        });
      } else {
        res.status(400).json({
          message: 'Not Authorized to edit!'
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Couldn't update post!"
      });
    });
}

// ===========================================================================

exports.deletePost = (req, res, next) => {
  Post.deleteOne({
      _id: req.params.id,
      creator: req.userData.userId
    })
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({
          message: 'Post deleted sucessfully!'
        });
      } else {
        res.status(400).json({
          message: 'Not Authorized to delete!'
        });
      }
    });
}

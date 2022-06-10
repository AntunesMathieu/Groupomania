const Post = require('../models/Post');
const Posts = require('../models/Post');

exports.createPost = (req, res, next) => {
    const postObject = JSON.parse(req.body.post);
    delete postObject._id
    const posts = new Posts({
        ...postObject,
        likes: 0,
        dislikes: 0,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });
    posts.save().then(
        () => {
            res.status(201).json({
                message: 'Post saved successfully!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.getOnePost = (req, res, next) => {
    Posts.findOne({
        _id: req.params.id
    }).then(
        (posts) => {
            res.status(200).json(posts);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.modifyPost = (req, res, next) => {
    Posts.findOne({ _id: req.params.id })
        .then(posts => {
            if(posts.userId === req.userId){ 
                const postObject = req.file ?
                {
                    ...JSON.parse(req.body.post),
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                } : { ...req.body };
                        Posts.updateOne({ _id: req.params.id }, { ...postObject, _id: req.params.id })
                            .then(() => res.status(200).json({ message: 'Post modifié !' }))
                            .catch(error => res.status(400).json({ error }));
                    
            }else{
                res.status(403).json({ message: 'Vous ne pouvez pas modifier ce post !' })
            }
        })
        .catch(error => res.status(500).json({ error }));
};

exports.deletePost = (req, res, next) => {
    Posts.findOne({ _id: req.params.id })
        .then(posts => {
            if(posts.userId === req.userId){ 
                const filename = posts.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Posts.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Post supprimé !' }))
                        .catch(error => res.status(400).json({ error }));
                });
            }else{
                res.status(403).json({ message: 'Vous ne pouvez pas supprimer ce post !' })
            }
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getAllPost = (req, res, next) => {
    Posts.find().then(
        (posts) => {
            res.status(200).json(posts);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};
const Posts = require('../models/Post');
const fs = require('fs');


exports.createPost = (req, res, next) => {
    const postsObject = JSON.parse(req.body.post);
    delete postsObject._id
    const posts = new Posts({
        ...postsObject,
        likes: 0,
        imageUrl: req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : "",
        createdDate: new Date (),
    });
    console.log(posts);
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
            if(posts.userId === req.userId || req.admin){
                const postsObject = req.file ?
                {
                    ...JSON.parse(req.body.post),
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                } : { ...req.body };
                        Posts.updateOne({ _id: req.params.id }, { ...postsObject, _id: req.params.id })
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
            if(posts.userId === req.userId || req.admin){
                const filename = posts.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Posts.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Post supprimé !' }))
                        .catch(error => res.status(400).json({ error }));
                });
            }else{
                res.status(403).json({ message: 'Vous ne pouvez pas supprimer ce Post !' })
            }
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getAllPost = (req, res, next) => {
    Posts.find().sort({createdDate: -1}).then(
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
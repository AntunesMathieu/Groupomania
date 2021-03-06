const Posts = require('../models/Post')

exports.likePost = (req, res, next) => {

    //aller chercher l'objet dans la base de donnée
    Posts.findOne({ _id: req.params.id })
        .then((post) => {
            //like = 1 (like = +1)
            //utilisation de la methode includes()
            //utilisation de l'opérateur $ink(mongoose)
            //utilisation de l'opérateur $push(mongoose)
            //utilisation de l'opérateur $pull(mongoose)

            //si le userLiked est False et si like ===1
            if (!post.usersLiked.includes(req.body.userId) && req.body.like === 1) {
                Posts.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { likes: 1 },
                        $push: { usersLiked: req.body.userId }
                    }
                )
                    .then(() => res.status(201).json({ Message: 'Post like +1' }))
                    .catch((error) => res.status(400).json({ error }));
            };

            //like = 0 (like = 0, pas de vote)
            if (post.usersLiked.includes(req.body.userId) && req.body.like === 0) {
                Posts.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { likes: -1 },
                        $pull: { usersLiked: req.body.userId },
                    }
                )
                    .then(() => res.status(201).json({ Message: 'Post like 0' }))
                    .catch((error) => res.status(400).json({ error }));

            };
        })
        .catch((error) => res.status(404).json({ error }));
}
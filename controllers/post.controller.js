const PostModel = require('../models/post.model');
const ObjectID = require('mongoose').Types.ObjectId;
const fs = require('fs');

module.exports.getPosts = async (req, res) => {
    try {
        const posts = await PostModel.find().sort({ createdAt: -1 });
        res.status(200).send(posts);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

module.exports.postInfo = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id)

    try {
        const post = await PostModel.findById(req.params.id);
        if (post) {
            res.status(200).send(post);
        } else {
            res.status(404).send('Post not found')
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

module.exports.createPost = async (req, res) => {
    try {
        const newPost = new PostModel(req.body);
        if (req.file) {
            newPost.picture = req.file.path.split("uploads/").pop();
        }
        const post = await newPost.save();
        res.status(201).send(post);
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}


module.exports.deletePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id)

    try {
        const post = await PostModel.findByIdAndRemove(req.params.id)
        if (!post) {
            res.status(404).send('Post not found')
        }
        if (post.picture !== "") {
            fs.unlink(`uploads/${post.picture}`, (err) => {
                if (err) throw err;
            });
        }
        res.status(200).send('Post deleted')
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
}


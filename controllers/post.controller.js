const fs = require('fs');
const path = require('path');
const PostModel = require('../models/post.model');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.getPosts = async (req, res) => {
    try {
        const posts = await PostModel.find().sort({
            createdAt: -1
        });
        res.status(200).send(posts);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

module.exports.postInfo = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown: ' + req.params.id);

    try {
        const post = await PostModel.findById(req.params.id);
        if (post) {
            res.status(200).send(post);
        } else {
            res.status(404).send('Post not found');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

module.exports.createPost = async (req, res) => {
    try {
        const newPost = new PostModel(req.body);
        if (req.file) {
            newPost.picture = req.file.path.split(path.sep).join("/"); // Normalize path
        }
        const post = await newPost.save();
        res.status(201).send(post);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

module.exports.updatePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown: ' + req.params.id);

    try {
        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).send('Post not found');

        // Update post details
        post.titleEN = req.body.titleEN;
        post.titleFR = req.body.titleFR;
        post.contentEN = req.body.contentEN;
        post.contentFR = req.body.contentFR;

        if (req.file) {
            if (post.picture !== "") {
                fs.unlink(path.join(__dirname, '..', 'uploads', 'postPictures', post.picture.split('/').pop()), (err) => {
                    if (err) console.log('Error deleting old picture:', err);
                });
            }
            post.picture = req.file.path.split(path.sep).join("/"); // Normalize path
        }

        const updatedPost = await post.save();
        res.status(200).send(updatedPost);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

module.exports.deletePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown: ' + req.params.id);

    try {
        const post = await PostModel.findByIdAndRemove(req.params.id);
        if (!post) return res.status(404).send('Post not found');

        if (post.picture !== "") {
            fs.unlink(path.join(__dirname, '..', 'uploads', 'postPictures', post.picture.split('/').pop()), (err) => {
                if (err) console.log('Error deleting picture:', err);
            });
        }
        res.status(200).send('Post deleted');
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};
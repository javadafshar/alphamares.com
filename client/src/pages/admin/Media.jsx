import React, { useEffect, useState } from 'react'
import PostCard from '../../components/Post/PostCard';
import { isEmpty } from '../../utils/Utils';
import { Button } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import axios from 'axios';

import ReactQuill from "react-quill"
import 'react-quill/dist/quill.snow.css';
var Font = ReactQuill.Quill.import('formats/font');
Font.whitelist = ['arapey', 'arial', 'georgia', 'helvetica', 'times-new-roman'];
ReactQuill.Quill.register(Font, true);

const Media = () => {
    const [posts, setPosts] = useState([]);
    const [open, setOpen] = useState(false);

    function getPosts() {
        axios.get(`${process.env.REACT_APP_API_URL}api/post/`)
            .then((res) => setPosts(res.data))
            .catch((err) => console.log(err));
    }

    useEffect(() => {
        getPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <br />
            <div style={{ textAlign: 'center' }}>
                <h1>Administration des Médias.</h1>
            </div>
            <br />
            <Button variant="contained" onClick={() => setOpen(true)} style={{ margin: "1%" }}> Créer un post</Button>
            {!isEmpty(posts) &&
                posts.slice().map((post) => (
                    <PostCard post={post} key={post._id} inAdmin={true} fetchPosts={getPosts} />
                ))}
            <CreatePostDialog open={open} onClose={() => setOpen(false)} fetchPosts={getPosts} />
            <br />
        </div>
    );
};

function CreatePostDialog(props) {
    const { onClose, open, fetchPosts } = props;
    const [formData, setFormData] = useState({
        titleFR: '',
        titleEN: '',
        video: '',
        picture: '',
    });
    const [postPicture, setPostPicture] = useState('');

    useEffect(() => {
        setFormData({
            titleFR: '',
            titleEN: '',
            video: '',
            picture: '',
        })
        setPostPicture('')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])


    const handlePicture = (e) => {
        setFormData({ ...formData, video: '' });
        setPostPicture(e.target.files[0])
    }

    function handleVideo(e) {
        const embed = e.target.value.replace('watch?v=', 'embed/');
        setFormData({ ...formData, 'video': embed.split('&')[0] });
    }


    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (event) => {
        event.preventDefault()
        const data = new FormData();
        data.append('titleFR', formData.titleFR)
        data.append('titleEN', formData.titleEN)
        data.append('messageFR', textFR)
        data.append('messageEN', textEN)
        data.append("picture", postPicture);
        data.append('video', formData.video);
        axios
            .post(`${process.env.REACT_APP_API_URL}api/post/`, data)
            .then((res) => {
                fetchPosts();
                onClose();
            })
            .catch((err) => {
                onClose()
                alert(err.response.data === "LIMIT_FILE_SIZE" ?
                    "Erreur : le fichier est trop VOLUMINEUX (8Mo max)" 
                    : err.response.data
                );
            });
    }

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            [{ 'font': Font.whitelist }],
            ['bold', 'italic', 'underline', 'strike'],// 'blockquote'],
            // [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': '' }, { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }],
            // ['link'],
            // ['clean']
        ],
    }

    const formats = [
        'header',
        'font',
        'bold', 'italic', 'underline', 'strike',
        // 'list', 'bullet', 'indent',
        'align',
        // 'link', 'image'
    ]

    const [textFR, setTextFR] = useState();
    function onChangeEditorFR(value) {
        setTextFR(value)
    }

    const [textEN, setTextEN] = useState();
    function onChangeEditorEN(value) {
        setTextEN(value)
    }

    return (
        <Dialog onClose={onClose} open={open} className='create-post-dialog'>
            <DialogTitle>
                Créer un post
                <Button onClick={onClose} sx={{ position: 'absolute', right: 10, top: 10, }}>
                    &#10005;
                </Button>
            </DialogTitle>
            <DialogContent >
                <form className='form-container'>
                    <div>
                        <div className='field'>
                            <img src='./img/icons/french_flag.svg' alt='french flag' />
                            <label>Titre :</label>
                            <input type="text" name="titleFR" value={formData.titleFR} onChange={handleChange} required
                                minLength={3}
                                maxLength={30}
                            />
                        </div>
                        <div className='preview-editor'>
                            <ReactQuill
                                value={textFR}
                                modules={modules}
                                formats={formats}
                                placeholder='Message en français...'
                                onChange={onChangeEditorFR}
                            />
                        </div>
                    </div>
                    <br />
                    <hr />
                    <br />
                    <div>
                        <div className='field'>
                            <img src='./img/icons/UK_flag.svg' alt='UK flag' />
                            <label>Titre en anglais :</label>
                            <input type="text" name="titleEN" value={formData.titleEN} onChange={handleChange} required
                                minLength={3}
                                maxLength={30}
                            />
                        </div>
                        <div className='preview-editor'>
                            <ReactQuill
                                value={textEN}
                                modules={modules}
                                formats={formats}
                                placeholder='Message en anglais...'
                                onChange={onChangeEditorEN}
                            />
                        </div>
                    </div>
                    <div>
                        {isEmpty(formData.postPicture) && (
                            <div className='field'>
                                <label>Lien d'une vidéo (notez bien que c'est soit une video soit une image) :</label>
                                <input
                                    type="text"
                                    name="video"
                                    value={formData.video}
                                    onChange={handleVideo}
                                />
                            </div>
                        )}
                        {isEmpty(formData.video) && (
                            <div className='field'>
                                <label>Charger une image :</label>
                                <input type="file" id="file-upload" name="file" accept='.jpg, .jpeg, .png'
                                    onChange={(e) => handlePicture(e)}
                                ></input>
                            </div>
                        )}
                    </div>
                    <br />
                    <button onClick={handleSubmit} >Créer le post</button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default Media;
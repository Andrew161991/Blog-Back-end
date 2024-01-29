import React, { useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import SimpleMDE from 'react-simplemde-editor';
import { selectIsAuth } from "../../redux/slices/auth";
import 'easymde/dist/easymde.min.css';
import styles from './AddPost.module.scss';
import { useSelector } from "react-redux";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import axios from "../../axios";


export const AddPost = () => {
  const {id} = useParams()
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const [loading, setLoading] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState('');
  const [text, setText] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [tags, setTags] = React.useState('');
  const inputFileRef = useRef(null);    
  const isEditing = Boolean(id);

  const handleChangeFile = async (event) => {
    try{
      const formData = new FormData();
      const files = event.target.files[0];
      formData.append('image', files);
      const { data } = await axios.post('/upload', formData);
      setImageUrl(data.url)
    }catch(err){
      console.warn(err);
      alert('Error when uploading a file')
    }
  };
  const onClickRemoveImage = () => {
    setImageUrl('')
  };
  const onChange = React.useCallback((value) => {
    setText(value);
  }, []);

  const onSubmit = async () => {
    try{
      setLoading(true);
      const fields = {
        title,
        imageUrl,
        tags,
        text
      };
      const { data } = isEditing 
      ? await axios.patch(`/posts/${id}`, fields)
      : await axios.post('/posts', fields);

      const _id = isEditing ? id : data._id;
      navigate(`/posts/${_id}`);
    }catch(err){
      console.warn(err);
      alert('Error when uploading a file');
    }
  };

  useEffect(() => {
    if(id){
      axios.get(`/posts/${id}`).then(({data}) => {
        setTitle(data.title)
        setText(data.text)
        setImageUrl(data.imageUrl)
        setTags(data.tags.join(','))
      });
    }
  }, [])

  
  const options = React.useMemo(
    () => ({
      spellChecker: false,
      maxHeight: '300px',
      autofocus: false,
      placeholder: 'Enter text',
      status: false,
      autosave: {
        enabled: true,
        delay: 1000,
      },
    }),
    [],
  );
  if(!window.localStorage.getItem('token') && !isAuth){
    return <Navigate to="/" />;
  }

  return (
    <Paper style={{ padding: 30 }}>
      <Button onClick={() => inputFileRef.current.click()} variant="outlined" size="large">
        Upload preview
      </Button>
      <input ref={inputFileRef}  type="file" onChange={handleChangeFile} hidden />
      {imageUrl && (
        <>
          <Button variant="contained" color="error" onClick={onClickRemoveImage}>
          Delete
          </Button>
         <img className={styles.image} src={`http://localhost:4444${imageUrl}`} alt="Uploaded" />
        </>
      )}
      <br />
      <br />
      <TextField
      value={title}
      onChange={(e) => setTitle(e.target.value)}
        classes={{ root: styles.title }}
        variant="standard"
        placeholder="Title"
        fullWidth
      />
      <TextField      
          value={tags}
          onChange={(e) => setTags(e.target.value)} 
          classes={{ root: styles.tags }} 
          variant="standard" 
          placeholder="Tags" 
          fullWidth />
      <SimpleMDE  className={styles.editor} value={text} onChange={onChange} options={options}  />
      <div className={styles.buttons}>
        <Button onClick={onSubmit} size="large" variant="contained">
          {isEditing ? 'Save' : 'Post'}
        </Button>
        <a href="/">
          <Button size="large">Cancel</Button>
        </a>
      </div>
    </Paper>
  );
};

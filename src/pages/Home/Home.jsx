//generate boilerplate for react home page
import './Home.scss';
import { useRef, useState } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';
import { firebaseFunctionsKey } from '../../firebase';
import Navbar from '../../components/Navbar/Navbar';
import { Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

const Home = () => {
  const [text, setText] = useState('dlfja;wfjfaiolijzflijlfaifh dkfhak fa');
  const promptRef = useRef();
  const wordCountRef = useRef();
  const focusCharsRef = useRef();
  const hiddenInputRef = useRef(null);

    // Focus the hidden input whenever the component mounts
    useEffect(() => {
        hiddenInputRef.current.focus();
    }, []);


  const [loading, setLoading] = useState(false);
  async function handleClick() {
    setLoading(true);
    await generateText();
    setLoading(false);
  }

  const generateText = async () => {
    try {
      console.log(wordCountRef.current.value)
      console.log(promptRef.current.value)
      const response = await fetch(`${firebaseFunctionsKey}/generateAiText`, {
        method: 'POST',
        body: JSON.stringify({
          prompt: promptRef.current.value,
          wordCount: wordCountRef.current.value,
        }),
      });
      const data = await response.json();
      console.log(data);
      setText(data.text);
    } catch (error) {
      console.log(error);
    }
  }
  
  useEffect(() => {

    // aFunction();

    console.log(text);

  }, []);

  return (
    <div className="home">
      <Navbar />
      <div className='main'>
        <div id='toolbar'>
          <div id="toolbar-options">
          <Box
            sx={{
              width: 400,
              maxWidth: '100%',
            }}
          >
            <TextField
              fullWidth
              size="small"
              id="outlined-search"
              label="Prompt"
              type="search"
              variant="outlined"
              defaultValue="Science Article"
              inputRef={promptRef}
            />
          </Box>
          <Box
            sx={{
              width: 150,
              maxWidth: '100%',
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Length</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                defaultValue={100}
                label="Length"
                size="small"
                inputRef={wordCountRef}
              >
                <MenuItem value={20}>Short</MenuItem>
                <MenuItem value={100}>Paragraph</MenuItem>
                <MenuItem value={300}>Long</MenuItem>
                <MenuItem value={600}>Page</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box
            sx={{
              width: 100,
              maxWidth: '100%',
            }}
          >
            <TextField
              fullWidth
              size="small"
              id="outlined-focus-chars"
              label="Focus Chars"
              type="search"
              variant="outlined"
              defaultValue=""
              inputRef={focusCharsRef}
            />
          </Box>

          </div>

          <LoadingButton
            onClick={handleClick}
            loading={loading}
            variant="contained"
            size="large"
          >
            <span>GO</span>
          </LoadingButton>
        </div>
        <div id="typing-area" onClick={() => hiddenInputRef.current.focus()}>
            {renderText()}
            <input 
                ref={hiddenInputRef}
                type="text" 
                onChange={handleUserInput} 
                value={userInput} 
                className="hidden-input"
            />
        </div>
      </div>
    </div>
  );
};

export default Home;
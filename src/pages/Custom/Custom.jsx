//generate boilerplate for react home page
import './Custom.scss';
import { useRef, useState } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';
import { firebaseFunctionsKey } from '../../firebase';
import Navbar from '../../components/Navbar/Navbar';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import TypingArea from '../../components/TypingArea/TypingArea';

const Custom = () => {
  const [text, setText] = useState(`orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.

  Why do we use it?
  It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
  
  
  Where does it come from?
  Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsu`);
  const promptRef = useRef();
  const wordCountRef = useRef();
  const focusCharsRef = useRef();


  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await generateText();
    setLoading(false);
  }

  const generateText = async () => {
    try {
      //remove repeated characters from focusChars and convert to comma separated string
      const focusChars = Array.from(new Set(focusCharsRef.current.value)).join(', ');

      const response = await fetch(`${firebaseFunctionsKey}/generateAiText`, {
        method: 'POST',
        body: JSON.stringify({
          prompt: promptRef.current.value,
          wordCount: wordCountRef.current.value,
          focus: focusChars,
        }),
      });
      const data = await response.json();
      console.log(data);

      //remove any \n characters or consecutive \n characters and replace with a space
      data.text = data.text.replace(/\n+/g, ' ');

      setText(data.text);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="custom">
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
              defaultValue="Obscure Fact"
              inputRef={promptRef}
              inputProps={{ maxLength: 150 }}
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
        <TypingArea 
          className='typing-area'
          text={text}
        />
      </div>
    </div>
  );
};

export default Custom;
import './Home.scss';
import { useRef, useState } from 'react';
import { useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import TypingArea from '../../components/TypingArea/TypingArea';

const Home = () => {
    const [text, setText] = useState('dlfja;wfjfaiolijzflijlfaifh dkfhak fa');
    const [type, setType] = useState('Science');
    const [minutes, setMinutes] = useState(1);

    const generateText = async () => {
        try {
            const response = await fetch(`https://api.quotable.io/random?tags=${type}`);
            const data = await response.json();
            console.log(data);
            setText(data.content);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        generateText();
    }, []);

    return (
        <div className="home">
          <Navbar />
          <div className='main'>
            <div id='toolbar'>
              
              <Box
                sx={{
                  width: 150,
                  maxWidth: '100%',
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    labelId="simple-select-label"
                    defaultValue={"Science"}
                    label="Category"
                    size="small"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <MenuItem value={"Science"}>Science</MenuItem>
                    <MenuItem value={"History"}>History</MenuItem>
                    <MenuItem value={"Sports"}>Sports</MenuItem>
                    <MenuItem value={"Fun Facts"}>Fun Facts</MenuItem>
                    <MenuItem value={"Mythology"}>Mythology</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box
                sx={{
                  width: 150,
                  maxWidth: '100%',
                }}
              >
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Time</InputLabel>
                  <Select
                    defaultValue={1}
                    label="Time"
                    size="small"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                  >
                    <MenuItem value={1}>1 Minute</MenuItem>
                    <MenuItem value={2}>2 Minutes</MenuItem>
                    <MenuItem value={3}>3 Minutes</MenuItem>
                    <MenuItem value={5}>5 Minutes</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </div>

            <TypingArea 
              className='typing-area'
              text={text}
            />
          </div>
        </div>
      );
}

export default Home;


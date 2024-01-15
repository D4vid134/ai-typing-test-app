import './Home.scss';
import { useRef, useState } from 'react';
import { useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import TypingArea from '../../components/TypingArea/TypingArea';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { firebaseFunctionsKey } from '../../firebase';
import Results from '../../components/Results/Results';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';

const Home = () => {
    const [results, setResults] = useState({}); //[timeElapsed, characters, typos, notCorrectedTypos]
    const [type, setType] = useState('All');
    const [minutes, setMinutes] = useState(1);
    const [typingAreaKey, setTypingAreaKey] = useState(0);

    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['fetchPassages', { category: type, amount: minutes * 2 }],
        queryFn: async ({ queryKey }) => {
            // Extract the category and amount from the queryKey
            const [, { category, amount }] = queryKey;
    
            const response = await axios.post(`${firebaseFunctionsKey}/fetchPassages`, {
                category: category,
                amount: amount,
            });
            console.log(response);
            return response.data.text;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        staleTime: 1000 * 60 * 60 * 24,
    });

    const refreshText = () => {
        refetch();
        setTypingAreaKey(prevKey => prevKey + 1); // Update the key
    }

    const showResults = (timeElapsed, correctCount, incorrectCount, typoCount) => {
        const results = {
            timeElapsed,
            correctCharacters: correctCount,
            typos: typoCount,
            notCorrectedTypos: incorrectCount,
        };
        refreshText();
        setResults(results);
    };

    const renderResults = (results) => {
        console.log(results.results);
        return (
            <div className="results">
                <Results 
                    timeElapsed={results.results.timeElapsed}
                    correctCharacters={results.results.correctCharacters}
                    typos={results.results.typos}
                    notCorrectedTypos={results.results.notCorrectedTypos}
                />
            </div>
        );
    }

    return (
        <div className="home">
            <Navbar />
            <div className='main home'>
                <div id='toolbar'>
                <div id="toolbar-options">
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
                        <MenuItem value={"All"}>All</MenuItem>
                        <MenuItem value={"science"}>Science</MenuItem>
                        <MenuItem value={"history"}>History</MenuItem>
                        <MenuItem value={"sports"}>Sports</MenuItem>
                        <MenuItem value={"fun facts"}>Fun Facts</MenuItem>
                        <MenuItem value={"mythology"}>Mythology</MenuItem>
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
                <LoadingButton
                    onClick={refreshText}
                    variant="contained"
                    size="large"
                >
                    <RefreshIcon />
                </LoadingButton>
                </div>
                
                {isLoading || isFetching ? (
                    <div className='loading-container'>
                        <div className='inner-container'>
                            <CircularProgress 
                                size={150}
                            />
                        </div>
                    </div>
                ) : data ? (
                    <TypingArea 
                        key={typingAreaKey} // Use the key here
                        text={data}
                        seconds={minutes * 3}
                        showResults={showResults}
                    />
                ) : (
                    <div className='loading-container'>
                        <div className='inner-container'>
                            <CircularProgress 
                                size={100}
                            />
                        </div>
                    </div>
                )}
                    {error && <div>Error: {error.message}</div>}
                <div>
                    {renderResults({results})}
                </div>
            </div>
          
        </div>
      );
}

export default Home;


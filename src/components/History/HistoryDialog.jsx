import React from "react";
import { Link } from "react-router-dom";
import "./HistoryDialog.scss";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FormControl, InputLabel, MenuItem, Select, Box, Dialog, DialogTitle, DialogContent} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ThemeContext } from "../../App";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";



const HistoryDialog = ({trigger}) => {
    // const { currentUser } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [type, setType] = useState("All");
    const [minutes, setMinutes] = useState(1);
    const [results, setResults] = useState([]);
    const [amount, setAmount] = useState(10000);
    const [excludeOutliers, setExcludeOutliers] = useState(false);

    const { currentUser } = useContext(AuthContext);

    // set mui components to theme using miu theme provider
    const muiTheme = createTheme({
        palette: {
            mode: theme,
            // make background color darker
            background: {
                default: theme === "dark" ? "#000000" : "#f5f5f5",
            },
        },
    });

    const subscribeToFirestoreData = () => {
        const userResultsRef = doc(db, "users", currentUser.uid, "results", minutes.toString());
        
        return onSnapshot(userResultsRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const firestoreResults = docSnapshot.data()[type] || [];
                setResults(firestoreResults);
            } else {
                // Handle the case where there is no such document
                setResults([]);
            }
        }, (error) => {
            console.error("Error fetching from Firestore: ", error);
            setResults([]); // Setting results to empty in case of an error
        });
    };

    const getLocalStorageData = () => {
        const storageResultsForMinute = JSON.parse(localStorage.getItem("resultsFor" + minutes)) || {};
        const storageResults = storageResultsForMinute[type] || [];
        setResults(storageResults);
    };
    
    useEffect(() => {
        if (currentUser) {
            const unsubscribe = subscribeToFirestoreData();
            console.log("Firestore data fetched");
        } else {
            getLocalStorageData();
            console.log("Local storage data fetched");
        }
    }, [minutes, type, trigger, currentUser]);


    const filterOutliers = (numArr) => {
        if (numArr.length < 4) {
            return numArr;
        }
        const values = numArr.slice().sort((a, b) => a - b);
        const q1 = values[Math.floor((values.length / 4))];
        const q3 = values[Math.ceil((values.length * (3 / 4)))];
        const iqr = q3 - q1;
        const maxValue = q3 + iqr * 1.5;
        const minValue = q1 - iqr * 1.5;
        return values.filter((x) => x >= minValue && x <= maxValue && x >= 4);
    }

    const excludeOutliersHandler = () => {
        setExcludeOutliers(!excludeOutliers);
    }

    const calculateMetric = (amount, excludeOutlier, metric) => {
        let metricArr = [];
        let totalMetric = 0;
    
        // Initial collection of metric values
        for (let i = results.length - 1; i >= 0 && metricArr.length < amount; i--) {
            metricArr.push(results[i][metric]);
        }
    
        // Filtering outliers if required
        if (excludeOutlier) {
            metricArr = filterOutliers(metricArr);
    
            // Add more values if needed, and check if there are enough results
            let i = 1;
            while (metricArr.length < amount && results.length - (amount + i) > 0) {
                metricArr = [results[results.length -(amount + i)][metric], ...metricArr];
                i++;

                if (metricArr.length == amount) {
                    metricArr = filterOutliers(metricArr);
                }

            }
        }
    
        // Calculating the average
        if (metricArr.length > 0) {
            const total = metricArr.reduce((acc, val) => acc + val, 0);
            totalMetric = Math.floor(total / metricArr.length);
        }
    
        return totalMetric;
    }
    
    useEffect(() => {
        const downHandler = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setOpen(true);
            }
        };

        window.addEventListener('keydown', downHandler);
        return () => window.removeEventListener('keydown', downHandler);
    }, []);

    const handleClose = () => {
        setOpen(false);
    };

    const renderGraph = (results) => {
        let filteredData = results.slice(-amount);

        if (excludeOutliers) {
            let wpmValues = filteredData.map(obj => obj.wpm);
            let filteredWpmValues = filterOutliers(wpmValues);

            filteredData = results.filter(obj => filteredWpmValues.includes(obj.wpm));
        }

        let i = 1;
        while (filteredData.length < amount) {

            if (results.length - (amount + i) <= 0) {
                break;
            }
            filteredData = [results[results.length -(amount + i)], ...filteredData];
            i++;

            if (filteredData.length == amount) {
                let wpmValues = filteredData.map(obj => obj.wpm);
                let filteredWpmValues = filterOutliers(wpmValues);
                filteredData = results.filter(obj => filteredWpmValues.includes(obj.wpm));
            }
        }

        const data = filteredData.map((result) => {
            const date = new Date(result.date);

            const year = date.getFullYear().toString().slice(-2);
            const month = (date.getMonth() + 1).toString();
            const day = date.getDate().toString();

            const monthStr = String(Number(month));
            const dayStr = String(Number(day));

            const dateStr = monthStr + '/' + dayStr + '/' + year;

            return {
                ...result,
                date: dateStr,
            };
        });

        let stroke = "#2315db";
        if (theme === "dark") {
            stroke = "#98cdff";
        }
            

        return (
            <ResponsiveContainer width="95%" height={250}>
                <LineChart data={data}
                    margin={{ top: 15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="wpm" stroke={stroke} />
                </LineChart>
            </ResponsiveContainer>
        );
    }
            
    return (
        <ThemeProvider theme={muiTheme}>
            <Dialog onClose={handleClose} open={open} fullWidth maxWidth={'md'}>
                <DialogTitle>History</DialogTitle>
                <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
                >
                <CloseIcon />
                </IconButton>
                <DialogContent dividers className="dialog-content">
                    <div id="toolbar-options">
                        <Box
                        sx={{
                            width: 150,
                            maxWidth: '100%',
                        }}
                        >
                            <FormControl fullWidth>
                                <InputLabel>History Length</InputLabel>
                                <Select
                                    labelId="simple-select-label"
                                    defaultValue={50}
                                    label="History Length"
                                    size="small"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                >
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={25}>25</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                                {/* <MenuItem value={100}>100</MenuItem>
                                <MenuItem value={250}>250</MenuItem>
                                <MenuItem value={500}>500</MenuItem> */}
                                <MenuItem value={10000}>All</MenuItem>
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
                            <MenuItem value={0.5}>30 Seconds</MenuItem>
                            <MenuItem value={1}>1 Minute</MenuItem>
                            <MenuItem value={2}>2 Minutes</MenuItem>
                            <MenuItem value={3}>3 Minutes</MenuItem>
                            <MenuItem value={5}>5 Minutes</MenuItem>
                            </Select>
                        </FormControl>
                        </Box>
                    </div>
                    <div className="history-content">
                        <div className={`history-content-item first ${theme}`}>
                            <div className="name">WPM</div>
                            <div className="value">{calculateMetric(amount, excludeOutliers, "wpm")}</div>
                        </div>
                        <div className={`history-content-item ${theme}`}>
                            <div className="name">Accuracy</div>
                            <div className="value">{calculateMetric(amount, excludeOutliers, "accuracy")}%</div>
                        </div>
                        <div className={`history-content-item ${theme}`}>
                            <div className="name">Corrected Acc.</div>
                            <div className="value">{calculateMetric(amount, excludeOutliers, "correctedAccuracy")}%</div>
                        </div>
                    </div>
                    <div style={{textAlign: "center"}}>
                        <label htmlFor="outliers">Exclude Outliers</label>
                        <div>
                        <Toggle
                            checked={!!excludeOutliers}
                            icons={false}
                            name="outliers"
                            onChange={excludeOutliersHandler}
                            title="Exclude Outliers"
                            className={theme === "dark" ? "dark" : "light"}
                        />
                        </div>
                    </div>
                    <div className="graph">
                        {renderGraph(results)}
                    </div>
                </DialogContent>
            </Dialog>
        </ThemeProvider>
    );
}

export default HistoryDialog;
    
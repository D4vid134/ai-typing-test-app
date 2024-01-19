import React from "react";
import { Link } from "react-router-dom";
import "./HistoryDialog.scss";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle } from "@mui/material";


const HistoryDialog = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();


    const [open, setOpen] = useState(false);
    const [type, setType] = useState("All");
    const [minutes, setMinutes] = useState("3");
    const [results, setResults] = useState([]);

    useEffect(() => {
        // console.log(currentUser);
        const storageResultsForMinute = JSON.parse(localStorage.getItem("resultsFor" + minutes)) || {};
        const storageResults = storageResultsForMinute[type] || [];
        setResults(storageResults);
    }, []);


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
        return values.filter((x) => x >= minValue && x <= maxValue);
    }

    const calculateMetric = (amount, excludeOutlier, metric) => {
        if (amount > 10000) {
            amount = results.length;
        }
    
        let totalMetric = 0;
        let metricArr = [];
        let total = 0;
        let count = 0;
    
        // loop should start from latest
        for (let i = results.length - 1; i >= 0; i--) {
            if (count === amount) {
                break;
            }
            let currentMetricValue = results[i][metric];
            total += currentMetricValue;
            count++;
            metricArr.push(currentMetricValue);
        }
    
        if (excludeOutlier) {
            metricArr = filterOutliers(metricArr);
        }
    
        if (metricArr.length > 0) {
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

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>Set backup account</DialogTitle>
            <div>Dialog Content</div>
        </Dialog>
    );
}

export default HistoryDialog;
    
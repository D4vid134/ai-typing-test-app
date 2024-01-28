import './About.scss';
import { useRef, useState } from 'react';
import { useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';

const About = () => {
    return (
        <div className="about">
            <Navbar />
            <div className="about-content">
                <h1>About</h1>
                <p>
                    Fresh Type offers a unique solution to the repetitive nature of online typing tests. In my past experience of using typing tests online,
                    I found that many websites only had a limited number of passages to practice with. I would quickly memorize the passages and it would boost my typing speed artificially.
                    Other websites would have random words that solves this, but this is very boring to me and I would rather type full sentences with meaning.

                    This app aims to solve this by using AI to generate new and interesting passages daily, keeping practice fresh and engaging. With Fresh Type, 
                    improve your typing skills in a fun and effective way, with new material to explore every day.
                </p>

            </div>
        </div>
    );
}

export default About;
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
                    Fresh Type is a typing test application that uses AI to generate new passages everyday for users to practice their typing skills.
                </p>

                <p>
                    Background: During the pandemic, I had tried to improve my typing skills by using typing tests online. 
                    However, I found that many websites only had a limited number of passages to practice with. 
                    I would quickly memorize the passages and it would boost my typing speed artificially. Other websites would have random words that solves this, 
                    but this is very boring to me and I would rather type full sentences with meaning.
                </p>

                <p>
                    To solve this issue, I created a typing test application that would generate interesting new passages everyday for users to practice with.
                    There is a long list of passages and several would be replaced everyday. After a month nearly all the passages would be changed.
                </p>
            </div>
        </div>
    );
}

export default About;
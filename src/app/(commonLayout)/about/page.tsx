
import React from 'react';
const About = async () => {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    // throw new Error("Something went wrong");
    return (
        <div>
            <h1>This is about page</h1>
        </div>
    );
};

export default About;
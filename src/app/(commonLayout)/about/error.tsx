"use client";

import { useEffect } from "react";

const AboutError = ({error, reset}: {error: Error & {digest?:string}; reset: ()=> void;}) => {
    useEffect(()=>{

    },[])
    return (
        <div>
            <h1>Something went Wrong: Please try againg later</h1>
            <button onClick={()=> reset()}>Retry</button>
        </div>
    );
};

export default AboutError;
import React from "react";

const MapGuesserHeading = () => {
    return (
        <h1
            className="font-titillium text-blue-800 text-4xl font-bold md:mb-2 flex flex-col md:flex-row items-baseline"
        >
            🌎 MapGuesser 
            <span className="text-slate-400 text-xl font-light mt-2 md:mt-0 md:ml-2">Inspired by GeoGuessr!</span>
        </h1>
    )
}

export { MapGuesserHeading }
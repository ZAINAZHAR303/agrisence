import React from "react";

const Poster = () => {
  return (
    <div className="relative w-screen h-screen bg-slate-300 overflow-hidden">
      <video
        src="Posterfin2.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      ></video>

      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/60"></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center  text-white text- px-4">
        <h1 className="text-4xl md:text-6xl font-bold animate-fade-in">
          Welcome to AgriSense
        </h1>
        <p className="text-lg md:text-2xl mt-4 animate-slide-up">
          Just to Revolutionize Your Farming Experience with AI-Powered Insights
        </p>
      </div>
    </div>
  );
};

export default Poster;

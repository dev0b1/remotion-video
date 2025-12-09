import React from 'react';
import {registerRoot, Composition} from 'remotion';
import ExRoastVideo from './ExRoastVideo';

const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ExRoastVideo"
        component={ExRoastVideo}
        durationInFrames={30 * 60} // 60 seconds @ 30 fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          // Use a path relative to `public/` so `staticFile()` resolves to `/static/audio/sample.mp3`
          audioFileName: 'audio/sample.mp3',
          hookText: 'AI COOKED MY TOXIC EX 💀',
          bgColor: '#04000A',
        }}
      />
    </>
  );
};

registerRoot(Root);

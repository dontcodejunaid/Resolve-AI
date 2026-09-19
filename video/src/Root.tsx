import React from 'react';
import { Composition } from 'remotion';
import { ResolveAIPitch } from './ResolveAIPitch';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ResolveAIPitch"
        component={ResolveAIPitch}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

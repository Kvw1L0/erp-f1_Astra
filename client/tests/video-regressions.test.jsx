import React from 'react';
import {render,fireEvent,act,cleanup} from '@testing-library/react';
import {it,expect,vi,afterEach} from 'vitest';
import CinematicVideoModal from '../src/components/race/CinematicVideoModal';
afterEach(()=>{cleanup();vi.useRealTimers();});
it('video waits for media completion and completes only once',()=>{
  vi.useFakeTimers();
  const finish=vi.fn();
  const {container}=render(<CinematicVideoModal videoType="RACE_BATTLE" onFinish={finish}/>);
  const video=container.querySelector('video');
  expect(video.muted).toBe(true);
  act(()=>vi.advanceTimersByTime(8000));
  expect(finish).not.toHaveBeenCalled();
  fireEvent.ended(video);fireEvent.ended(video);
  expect(finish).toHaveBeenCalledOnce();
});

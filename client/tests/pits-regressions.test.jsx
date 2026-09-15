import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, it, expect, vi } from 'vitest';
import PinLogin from '../src/components/participant/PinLogin';

const shared = vi.hoisted(() => ({ value: null }));
vi.mock('../src/context/SocketContext', () => ({useSocket: () => shared.value}));
vi.mock('../src/components/race/TrackLane', () => ({default: props => <div data-testid={`lane-${props.team.id}`} data-released={String(props.isRevealed)} data-nitro={String(props.isNitroActive)}/> }));
vi.mock('../src/components/race/CinematicVideoModal', () => ({default: ({onFinish}) => <button onClick={onFinish}>Finalizar video de prueba</button>}));
vi.mock('../src/components/race/PodiumModal', () => ({default: () => null}));
vi.mock('../src/components/race/CaseSolutionModal', () => ({default: () => null}));
vi.mock('../src/components/race/DebriefModal', () => ({default: () => null}));
vi.mock('../src/components/race/SafetyCarOverlay', () => ({default: () => null}));
vi.mock('../src/components/race/OvertakeBanner', () => ({default: () => null}));
vi.mock('../src/components/common/QrConnectModal', () => ({default: () => null}));
vi.mock('../src/components/participant/CaseFlow', () => ({default: ({currentCase}) => <h2>{currentCase.title}</h2>}));
vi.mock('../src/components/participant/PitsBlocked', () => ({default: () => <p>Respuestas recibidas</p>}));
vi.mock('../src/components/participant/SuperBoostMinigame', () => ({default: () => null}));
import RaceScreen from '../src/app/race-screen/page';
import Participant from '../src/app/participant/page';

beforeEach(() => {
  sessionStorage.clear();
  shared.value = {socket:null,isConnected:true,hasSynced:true,gameState:{status:'LOBBY',teamTelemetry:{},teamsProfiles:{}},cloudActions:{updateTeamProfile:vi.fn().mockResolvedValue({success:true})}};
});
afterEach(() => {cleanup();vi.useRealTimers();});

it('login completes with the actual audio engine and retains registration', async () => {
  const login = vi.fn().mockResolvedValue(undefined);
  render(<PinLogin onLoginSuccess={login}/>);
  fireEvent.click(screen.getByText('INGRESAR A PITS & BLOQUEAR ESCUDERÍA'));
  await act(async () => {});
  expect(login).toHaveBeenCalledOnce();
  expect(login.mock.calls[0][0]).toMatchObject({id:1, participants:['Piloto 1']});
  expect(screen.queryByText('CONECTANDO A PITS...')).toBeNull();
});
it('failed login releases the button for retry', async () => {
  render(<PinLogin onLoginSuccess={vi.fn().mockRejectedValue(new Error('offline'))}/>);
  fireEvent.click(screen.getByText('INGRESAR A PITS & BLOQUEAR ESCUDERÍA'));
  await act(async () => {});
  expect(screen.queryByText('CONECTANDO A PITS...')).toBeNull();
  expect(screen.getByText(/Error al conectar la terminal/)).toBeTruthy();
});
it('registered participant receives a case when direction starts a round', async () => {
  const view=render(<Participant/>);
  fireEvent.click(screen.getByText('INGRESAR A PITS & BLOQUEAR ESCUDERÍA'));
  await act(async () => {});
  expect(screen.getByText('Terminal en Boxes Lista')).toBeTruthy();
  shared.value={...shared.value,gameState:{...shared.value.gameState,status:'ACTIVE_CASE',startTime:Date.now(),currentCase:{id:'a',title:'Caso recibido desde administración'}}};
  view.rerender(<Participant/>);
  expect(screen.getByText('Caso recibido desde administración')).toBeTruthy();
});
const result = stamp => ({calculatedAt:stamp,caseId:'a',sectorIndex:1,fastestPerfectTeamId:1,teams:[],ranking:[]});
it('loading an active case never opens a video', () => {
  shared.value.gameState={status:'ACTIVE_CASE',currentCase:{id:'a',title:'Caso'}};
  render(<RaceScreen/>);
  expect(screen.queryByText('Finalizar video de prueba')).toBeNull();
  expect(screen.getByTestId('lane-1').dataset.released).toBe('false');
});
it('loading old results restores positions without replay', () => {
  shared.value.gameState={status:'REVEALED',calculatedResults:result(100)};
  render(<RaceScreen/>);
  expect(screen.queryByText('Finalizar video de prueba')).toBeNull();
  expect(screen.getByTestId('lane-1').dataset.released).toBe('true');
});
it('evaluation triggers video; cars wait for video end and nitro waits for base movement', () => {
  vi.useFakeTimers();
  shared.value.gameState={status:'ACTIVE_CASE',startTime:100,currentCase:{id:'a',title:'Caso'}};
  const view=render(<RaceScreen/>);
  shared.value={...shared.value,gameState:{...shared.value.gameState,status:'REVEALED',calculatedResults:result(200)}};
  view.rerender(<RaceScreen/>);
  expect(screen.getByText('Finalizar video de prueba')).toBeTruthy();
  act(()=>vi.advanceTimersByTime(30000));
  expect(screen.getByTestId('lane-1').dataset.released).toBe('false');
  fireEvent.click(screen.getByText('Finalizar video de prueba'));
  act(()=>vi.advanceTimersByTime(1999));
  expect(screen.getByTestId('lane-1').dataset.released).toBe('false');
  act(()=>vi.advanceTimersByTime(1));
  expect(screen.getByTestId('lane-1').dataset.released).toBe('true');
  expect(screen.getByTestId('lane-1').dataset.nitro).toBe('false');
  act(()=>vi.advanceTimersByTime(4500));
  expect(screen.getByTestId('lane-1').dataset.nitro).toBe('true');
});
it('a new round cancels old presentation timers', () => {
  vi.useFakeTimers();
  const view=render(<RaceScreen/>);
  shared.value={...shared.value,gameState:{status:'REVEALED',calculatedResults:result(200)}};
  view.rerender(<RaceScreen/>);
  fireEvent.click(screen.getByText('Finalizar video de prueba'));
  shared.value={...shared.value,gameState:{status:'ACTIVE_CASE',startTime:300,currentCase:{id:'b',title:'Caso B'}}};
  view.rerender(<RaceScreen/>);
  act(()=>vi.advanceTimersByTime(20000));
  expect(screen.getByTestId('lane-1').dataset.released).toBe('false');
  expect(screen.queryByText('Finalizar video de prueba')).toBeNull();
});

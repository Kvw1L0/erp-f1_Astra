import {it,expect,vi,beforeEach} from 'vitest';
const database=vi.hoisted(()=>({get:vi.fn(),update:vi.fn().mockResolvedValue(undefined)}));
vi.mock('firebase/database',()=>({ref:(_,path)=>path,get:database.get,update:database.update,set:vi.fn(),onValue:vi.fn()}));
vi.mock('../src/lib/firebase',()=>({getFirebaseDb:()=>({})}));
import {firebaseRaceEngine} from '../src/lib/firebaseRaceEngine';
beforeEach(()=>vi.clearAllMocks());
it('evaluation uses the active case and does not manufacture absent submissions',async()=>{
  const active={id:'actual',steps:[]};
  database.get.mockResolvedValue({val:()=>({status:'ACTIVE_CASE',currentCase:active,currentSectorIndex:3,totalSectors:10})});
  const calculate=vi.spyOn(firebaseRaceEngine,'calculateAndRevealResults').mockResolvedValue({teams:[]});
  const submit=vi.spyOn(firebaseRaceEngine,'submitAnswers');
  await firebaseRaceEngine.autoFinish({id:'wrong-selection'},1,10);
  expect(calculate).toHaveBeenCalledWith(active,3,10);
  expect(submit).not.toHaveBeenCalled();
  expect(database.update).toHaveBeenCalledWith('f1_race/state',{status:'LOCKED'});
});
it('repeated evaluation returns the previous result without accumulating again',async()=>{
  const saved={calculatedAt:123,teams:[]};
  database.get.mockResolvedValue({val:()=>({status:'REVEALED',calculatedResults:saved})});
  const calculate=vi.spyOn(firebaseRaceEngine,'calculateAndRevealResults');
  expect(await firebaseRaceEngine.autoFinish()).toBe(saved);
  expect(calculate).not.toHaveBeenCalled();
});

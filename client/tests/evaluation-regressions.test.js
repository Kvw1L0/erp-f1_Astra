import {it,expect,vi,beforeEach} from 'vitest';
const database=vi.hoisted(()=>({race:null,get:vi.fn(),update:vi.fn(),transaction:vi.fn()}));
vi.mock('firebase/database',()=>({ref:(_,path)=>path,get:database.get,update:database.update,set:vi.fn(),onValue:vi.fn(),serverTimestamp:()=>({'.sv':'timestamp'}),runTransaction:database.transaction}));
vi.mock('../src/lib/firebase',()=>({getFirebaseDb:()=>({}),ensureRaceSession:async()=>({uid:'team'})}));
import {firebaseRaceEngine} from '../src/lib/firebaseRaceEngine';
const active={id:'case',title:'Test',steps:[{id:'s1',options:[{id:'yes',points:100},{id:'no',points:10}]}]};
beforeEach(()=>{
 vi.restoreAllMocks();
 database.race={state:{status:'ACTIVE_CASE',currentCase:active,currentSectorIndex:1,totalSectors:10,startTime:1000},submissions:{1:{answers:{s1:'no'},score:9999,submittedAt:1100},2:{answers:{s1:'yes'},score:0,submittedAt:1300},3:{answers:{s1:'yes'},submittedAt:1400}}};
 database.get.mockImplementation(async path=>({val:()=>path==='f1_race'?database.race:database.race.state}));
 database.transaction.mockImplementation(async(path,fn)=>{
 const old=path==='f1_race'?database.race:database.race.state;
 const next=fn(structuredClone(old));
 if(next!==undefined){if(path==='f1_race')database.race=next;else database.race.state=next;}
 return {committed:next!==undefined,snapshot:{val:()=>path==='f1_race'?database.race:database.race.state}};
 });
});
it('evaluates persisted case, ignores forged scores, and selects fastest perfect',async()=>{
 const result=await firebaseRaceEngine.autoFinish({id:'wrong'});
 expect(result.fastestPerfectTeamId).toBe(2);
 expect(result.teams[0].caseScore).toBe(10);
 expect(result.teams[1].durationMs).toBe(300);
 expect(result.teams[1].sectorAdvancePercent).toBe(12);
 expect(result.teams[3].hasSubmitted).toBe(false);
});
it('repeated evaluation does not accumulate twice',async()=>{
 const first=await firebaseRaceEngine.autoFinish();
 const again=await firebaseRaceEngine.autoFinish();
 expect(again).toEqual(first);
 expect(database.race.telemetry[2].cumulativeScore).toBe(100);
});
it('transaction retry on revealed round preserves already published results',async()=>{
 await firebaseRaceEngine.autoFinish();
 const first=structuredClone(database.race);
 await firebaseRaceEngine.calculateAndRevealResults(active,1,10);
 expect(database.race).toEqual(first);
});

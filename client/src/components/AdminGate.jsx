 'use client';
import {useEffect, useState} from 'react';
import {onAuthStateChanged} from 'firebase/auth';
import {getRaceAuth, ensureRaceSession, isRaceAdmin, signInRaceAdmin} from '../lib/firebase';
export default function AdminGate({children}) {
  const [allowed,setAllowed]=useState(false);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{ let stop=()=>{}; let disposed=false;
    ensureRaceSession().then(()=>{ if(!disposed) stop=onAuthStateChanged(getRaceAuth(), user=>setAllowed(isRaceAdmin(user))); }).catch(()=>setError('No se pudo conectar con Firebase. Recarga para intentar de nuevo.'));
    return ()=>{disposed=true;stop();};
  },[]);
  if(allowed) return children;
  return <main className="min-h-screen flex items-center justify-center p-6"><section className="max-w-md text-center space-y-6"><h1 className="text-3xl font-bold">Dirección de Carrera</h1><p>Ingresa con la cuenta de Google autorizada para administrar el evento.</p>{error&&<p role="alert" className="text-red-400">{error}</p>}<button disabled={busy} className="rounded-xl bg-red-600 px-6 py-3 font-bold" onClick={async()=>{setBusy(true);setError('');try{await signInRaceAdmin();}catch(e){setError(e.message);}finally{setBusy(false);}}}>{busy?'Conectando…':'Ingresar con Google'}</button></section></main>;
}

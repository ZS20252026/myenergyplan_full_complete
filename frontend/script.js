const BACKEND = location.origin.includes('localhost') ? 'http://localhost:3000' : location.origin;
async function checkSubscription(email){
  try{
    const r = await fetch(`${BACKEND}/api/check-subscription?email=${encodeURIComponent(email)}`);
    return (await r.json()).active;
  }catch(e){ console.error(e); alert('Cannot reach backend'); return false; }
}
async function createOrder(email, appFile){
  const res = await fetch(`${BACKEND}/api/create-order`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email, appFile })
  });
  if(!res.ok) throw new Error('create-order failed');
  return res.json();
}
document.getElementById('openCalc').addEventListener('click', async ()=>{
  const email = document.getElementById('email').value.trim();
  const calc = document.getElementById('calcSelect').value;
  if(!email){ alert('Enter email'); return; }
  if(!calc){ alert('Select calculator'); return; }
  const active = await checkSubscription(email);
  if(active) return window.location.href = calc;
  document.getElementById('paywall').classList.remove('hidden');
  document.getElementById('payBtn').onclick = async ()=>{
    try{
      const data = await createOrder(email, calc);
      // data.checkoutUrl -> could be /frontend/payment.html?orderId=... (simulation) or real HPP
      window.location.href = data.checkoutUrl;
    }catch(e){ console.error(e); alert('Payment initiation failed'); }
  };
});
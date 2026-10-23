
import { useState } from "react";

const POSITIONS = {
  "Manager": 2000,
  "Jr Manager": 1500,
  "Clerk": 900,
  "Sale Executive": 600
};
const DAY = 86400000;
const inr = n => "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const fmt = d => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const days = (a, b) => Math.round((b - a) / DAY) + 1;

const empty = { id: "", name: "", mobile: "", email: "", address: "", position: "Manager", joining: "", payDate: "", leaves: "0" };

function Field({ k, label, errors, children }) {
  return (
    <div className="f"><label>{label}</label>{children}{errors[k] && <div className="err">{errors[k]}</div>}</div>
  );
}

function SlipBody({ slip }) {
  return (
    <div>
    <div className="slip-head"><b>SALARY SLIP</b>Paid on {fmt(slip.pe)} · {fmt(slip.ps)} to {fmt(slip.pe)}</div>
    <div className="info">
      <div><span>Employee ID</span><br />{slip.id}</div>
      <div><span>Name</span><br />{slip.name}</div>
      <div><span>Position</span><br />{slip.position}</div>
      <div><span>Joining date</span><br />{fmt(parse(slip.joining))}</div>
      <div><span>Payment date</span><br />{fmt(parse(slip.payDate))}</div>
      <div><span>Mobile</span><br />{slip.mobile}</div>
      <div><span>Email</span><br />{slip.email}</div>
      <div style={{ gridColumn: "1 / -1" }}><span>Address</span><br />{slip.address}</div>
    </div>
    <table>
      <tbody>
        <tr><td>Per day wage</td><td>{inr(slip.rate)}</td></tr>
        <tr><td>Total days (joining date to payment date)</td><td>{slip.periodDays}</td></tr>
        <tr><td>Leaves taken</td><td>{slip.leaves}</td></tr>
        <tr><td>Paid days</td><td>{slip.paid}</td></tr>
        <tr><td>Gross salary</td><td>{inr(slip.gross)}</td></tr>
        <tr><td>Leave deduction</td><td>− {inr(slip.deduction)}</td></tr>
        <tr className="net"><td>Net salary</td><td>{inr(slip.net)}</td></tr>
      </tbody>
    </table>
    <p className="note">Generated on {fmt(slip.date)}. Net salary = (days from joining date to payment date − leaves) × per day wage of the position.</p>
    </div>
  );
}

function App() {
  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState({});
  const [slip, setSlip] = useState(null);
  const [printView, setPrintView] = useState(false);
  const [spin, setSpin] = useState(false);
  function refresh() {
    setF(empty); setErrors({}); setSlip(null); setPrintView(false);
    setSpin(true); setTimeout(() => setSpin(false), 600);
  }
  const set = k => e => setF({ ...f, [k]: e.target.value });

  function validate() {
    const e = {};
    if (!f.id.trim()) e.id = "Enter employee ID";
    if (!f.name.trim()) e.name = "Enter employee name";
    if (!/^[6-9]\d{9}$/.test(f.mobile)) e.mobile = "Enter a valid 10-digit mobile number";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email";
    if (!f.address.trim()) e.address = "Enter address";
    if (!f.joining) e.joining = "Select joining date";
    if (!f.payDate) e.payDate = "Select payment date";
    else if (f.joining && parse(f.payDate) < parse(f.joining)) e.payDate = "Payment date cannot be before joining date";
    if (f.leaves === "" || Number(f.leaves) < 0) e.leaves = "Enter leaves (0 or more)";
    return e;
  }

  function calculate() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) { setSlip(null); return; }
    // Wage calculation: every day from joining date to payment date (both included), minus leaves
    const join = parse(f.joining);
    const pe = parse(f.payDate);
    const ps = join;
    const periodDays = days(join, pe);
    const eligible = periodDays;
    const leaves = Math.min(Number(f.leaves), eligible);
    const paid = Math.max(eligible - leaves, 0);
    const rate = POSITIONS[f.position];
    setSlip({ ...f, ps, pe, periodDays, eligible, leaves, paid, rate,
      gross: eligible * rate, deduction: leaves * rate, net: paid * rate, date: new Date() });
  }

  if (printView && slip) {
    return (
      <div className="wrap print-page">
        <div className="print-bar no-print">
          <h1>Print preview</h1>
          <div className="btns">
            <button onClick={() => window.print()}>Print</button>
            <button className="cancel" onClick={() => setPrintView(false)}>Cancel</button>
          </div>
        </div>
        <div className="card print-card"><SlipBody slip={slip} /></div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="title-row">
        
        <h1>Employee Wage Salary Calculator</h1>
        <button className={"icon-btn" + (spin ? " spin" : "")} onClick={refresh} title="Refresh / reset" aria-label="Refresh and reset form">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></svg>
        </button>
      </div>
      <p className="sub">Per-day wage, joining date and leaves decide the pay slip.</p>
      <div className="grid">
        <div className="card">
          <h2>Employee details</h2>
          <div className="row">
            <Field errors={errors} k="id" label="Employee ID"><input value={f.id} onChange={set("id")} placeholder="EMP-101" /></Field>
            <Field errors={errors} k="name" label="Employee name"><input value={f.name} onChange={set("name")} placeholder="Full name" /></Field>
            <Field errors={errors} k="mobile" label="Mobile no."><input value={f.mobile} onChange={set("mobile")} maxLength={10} inputMode="numeric" placeholder="9876543210" /></Field>
            <Field errors={errors} k="email" label="Email"><input type="email" value={f.email} onChange={set("email")} placeholder="name@company.com" /></Field>
          </div>
          <Field errors={errors} k="address" label="Address"><textarea value={f.address} onChange={set("address")} placeholder="House no, street, city" /></Field>
          <div className="row">
            <Field errors={errors} k="position" label="Position">
              <select value={f.position} onChange={set("position")}>
                {Object.entries(POSITIONS).map(([p, w]) => <option key={p} value={p}>{p} – ₹{w}/day</option>)}
              </select>
            </Field>
            <Field errors={errors} k="joining" label="Joining date"><input type="date" value={f.joining} onChange={set("joining")} /></Field>
            <Field errors={errors} k="payDate" label="Payment date"><input type="date" value={f.payDate} onChange={set("payDate")} /></Field>
            <Field errors={errors} k="leaves" label="Leaves taken (days)"><input type="number" min="0" value={f.leaves} onChange={set("leaves")} /></Field>
          </div>
          <button className="full" onClick={calculate}>Calculate employee salary</button>
        </div>

        <div className="card">

          <h2>Salary slip</h2>
          {!slip ? (
            <div className="empty">Fill in the details and select “Calculate employee salary” to see the slip here.</div>
          ) : (
            <div>
              <SlipBody slip={slip} />
              <button className="full alt no-print" onClick={() => setPrintView(true)}>Print salary slip</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

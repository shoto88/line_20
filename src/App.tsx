
import "./app/globals.css"
import { Route, Routes } from 'react-router-dom';

import Treat from "./components/treat";
import UserInfo from "./components/userInfo";
import Header from "./components/Headercomponents/Header";
import Patient from "./components/Patient";
import TicketSummary from "./components/ticket_summary";
import MessageComponent from "./components/Message";
import PatientQueueManagement from "./components/test";
// import CalendarComponent from "./components/CalendarComponent";


const Home = () => {
  return (
    <>
    <MessageComponent />
    <Header />
      <Treat />
      <UserInfo />
    </>
  );
};


const App = () => {
return (
<div>

<div>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/patient" element={<Patient />} />
    <Route path="/ticket-summary" element={<TicketSummary />} />
    {/* <Route path='/calendar' element={<CalendarComponent />} /> */}
    <Route path="/test" element={<PatientQueueManagement />} />
  </Routes>
</div>
</div>
)
}
export default App;
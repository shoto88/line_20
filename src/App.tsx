// import "./app/globals.css"
// import { Route, Routes } from 'react-router-dom';
// import Treat from "./components/treat";
// import UserInfo from "./components/userInfo";
// import Header from "./components/Headercomponents/Header";
// import Patient from "./components/Patient";
// import TicketSummary from "./components/ticket_summary";
// import MessageComponent from "./components/Message";
// import WaitingRoomDisplay from "./components/display";
// import FrontDesk from "./components/FrontDesk ";

// const Home = () => {
//   return (
//     <div>
//       <h1>Welcome to Our Healthcare Application</h1>
//       <nav>
//         <ul>
//           <li><a href="/dashboard">Dashboard</a></li>
//           <li><a href="/patient">Patient</a></li>
//           <li><a href="/display">Waiting Room Display</a></li>
//           <li><a href="/frontdesk">Front Desk</a></li>
//         </ul>
//       </nav>
//     </div>
//   );
// };

// const Dashboard = () => {
//   return (
//     <>
//       <MessageComponent />
//       <Header />
//       <Treat />
//       <UserInfo />
//     </>
//   );
// };

// const App = () => {
//   return (
//     <div>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/patient" element={<Patient />} />
//         <Route path="/ticket-summary" element={<TicketSummary />} />
//         <Route path="/display" element={<WaitingRoomDisplay />} />
//         <Route path="/frontdesk" element={<FrontDesk />} />
//       </Routes>
//     </div>
//   )
// }

// export default App;
import "./app/globals.css";
import { Route, Routes } from "react-router-dom";
import Treat from "./components/treat";
import UserInfo from "./components/userInfo";
import Header from "./components/Headercomponents/Header";
import Patient from "./components/Patient";
import TicketSummary from "./components/ticket_summary";
import MessageComponent from "./components/Message";
import WaitingRoomDisplay from "./components/display";
import ClosedDaysPage from "./pages/ClosedDaysPage";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FrontDesk from "./components/FrontDesk ";

const Home = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-pink-500 mb-12">
          大濠パーククリニック🏥
        </h1>
        <div className="grid grid-cols-2 gap-12">
          <Link to="/frontdesk">
            <Button className="w-72 h-36 text-4xl bg-blue-500 hover:bg-blue-600">
              受付
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button className="w-72 h-36 text-4xl bg-green-500 hover:bg-green-600">
              診察室
            </Button>
          </Link>
          <Link to="/display">
            <Button className="w-72 h-36 text-4xl bg-yellow-500 hover:bg-yellow-600">
              窓側モニター
            </Button>
          </Link>
          <Link to="/patient">
            <Button className="w-72 h-36 text-4xl bg-purple-500 hover:bg-purple-600">
              受付横テレビ
            </Button>
          </Link>
          <Link to="/closed-days">
            <Button className="w-72 h-36 text-4xl bg-teal-500 hover:bg-teal-600">
              休診日管理
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patient" element={<Patient />} />
        <Route path="/ticket-summary" element={<TicketSummary />} />
        <Route path="/display" element={<WaitingRoomDisplay />} />
        <Route path="/frontdesk" element={<FrontDesk />} />
        <Route path="/closed-days" element={<ClosedDaysPage />} />
      </Routes>
    </div>
  );
};

export default App;

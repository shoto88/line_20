
import "./app/globals.css"
import { Route, Routes } from 'react-router-dom';

import Treat from "./components/treat";
import UserInfo from "./components/userInfo";
import Header from "./components/Headercomponents/Header";
import Patient from "./components/Patient";


const Home = () => {
  return (
    <>
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
  </Routes>
</div>
</div>
)
}
export default App;


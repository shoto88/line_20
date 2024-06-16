
import "./app/globals.css"
import { Route, Routes } from 'react-router-dom';

import Treat from "./components/treat";
import UserInfo from "./components/userInfo";
import Header from "./components/Headercomponents/Header";
import Patient from "./components/Patient";
interface HeaderProps {
  data: any; // より具体的な型に置き換えることをお勧めします
  status: 'success' | 'pending'; // 必要に応じて他のステータスも追加してください
}

const Home: React.FC<HeaderProps> = ({ data, status }) => {
  return (
    <>
    <Header data={data} status={status} />
      <Treat />
      <UserInfo />
    </>
  );
};


const App: React.FC<HeaderProps> = ({ data, status }) => {
return (
<div>

<div>
  <Routes>
    <Route path="/" element={<Home data={data} status={status} />} />
<Route path="/patient" element={<Patient />} />
  </Routes>
</div>
</div>
)
}
export default App;


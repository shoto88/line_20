import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const Header = () => {
  const navigate = useNavigate();

  return (
  <>
 {/**ヘッダー */}
 <div className="fixed flex justify-between px-8 w-screen h-16 bg-teal-400 items-center drop-shadow-2xl border-b border-gray-300 shadow-md">
            <h1 className="font-bold text-2xl">opc_manage</h1>
            <div className="flex gap-3">
                <Button variant="outline">
                <Link to="/" className="text-2xl">
              Home
            </Link>
                </Button>
                <Button>    <Link to="/patient" className="text-2xl">
              Patient
            </Link></Button>
            </div>
        </div>
  </>
  );
};

export default Header;
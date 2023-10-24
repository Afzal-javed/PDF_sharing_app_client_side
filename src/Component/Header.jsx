import React, { useState } from 'react'
import logo from "../assets/pdf.png";
import profile from "../assets/profile.gif";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const Header = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const [isShow, setIsShow] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        const id = userData?.user?.id
        const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/user/logout/${id}`)
        if (res.status === 200) {
            localStorage.removeItem("user");
            navigate("/login");
        }
    }

    return (
        <div className='sticky top-0 flex items-center bg-white shadow-lg cursor-default z-10'>
            <div className='ml-3 p-1 flex items-center cursor-pointer'>
                <img src={logo} width={50} height={50} alt='logo' onClick={() => navigate("/")} />
                <p className='text-3xl ml-2 font-bold text-red-800'>PDF<span className='text-black ml-2 font-serif'>Hub</span></p>
            </div>
            <div className=' relative flex items-center ml-auto p-1 mr-1'>
                <p className='text-lg font-semibold mr-2'>{userData?.user?.name}</p>
                <img src={profile} className='cursor-pointer' width={50} height={50} alt='profile' onClick={() => setIsShow(prev => !prev)} />
                {isShow &&
                    <div className='absolute right-2 top-14 w-[7rem] rounded-md bg-red-800 z-10 cursor-pointer'>
                        <p className='p-1  w-full text-lg text-white font-semibold text-center' onClick={handleLogout}>Logout</p>
                    </div>
                }
            </div>
        </div>
    )
}

export default Header
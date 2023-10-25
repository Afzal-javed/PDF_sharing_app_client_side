import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { loginRedux } from "../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import toast from 'react-hot-toast';

const Login = () => {
    const userData = useSelector((state) => state.user);
    const [data, setData] = useState({
        email: userData?.user?.email || "",
        password: ""
    })
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/login`, data);

            if (res?.status === 200) {
                dispatch(loginRedux({ user: { id: res?.data?.user?.id, email: res?.data?.user?.email, name: res?.data?.user?.name }, token: res?.data?.token }));
                navigate("/");
            }
        } catch (error) {
            if (error?.res?.status === 404) {
                toast(error?.res?.data?.msg)
            }
            if (error?.res?.status === 400) {
                toast(error?.res?.data?.msg)
            }
            if (error?.res?.status === 500) {
                toast(error?.res?.data?.msg)
            }
        }
    }
    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => {
            return {
                ...prev,
                [name]: value
            }
        })
    }
    return (
        <div className='p-3 md:p-6  '>
            <div className='bg-slate-700 max-w-2xl m-auto flex flex-col items-center  rounded-3xl shadow-lg'>
                <div className='mt-5'>
                    <h1 className='text-4xl font-semibold text-white'>Welcome Again</h1>
                </div>
                <form className='flex flex-col w-full items-center' onSubmit={handleSubmit}>
                    <div className='flex flex-col items-start w-[60%]'>
                        <label htmlFor='email' className='text-white text-lg my-2'>Email</label>
                        <input type='email' id='email' name='email' value={data.email} onChange={handleChange} className='w-full p-1.5 outline-none border-none rounded-md mb-3' placeholder='Enter your name ' />
                    </div>
                    <div className='flex flex-col items-start w-[60%]'>
                        <label htmlFor='password' className='text-white text-lg my-2'>Password</label>
                        <input type='password' id='password' name='password' value={data.password} onChange={handleChange} className='w-full p-1.5 outline-none border-none rounded-md mb-3' placeholder='Enter your name ' />
                    </div>
                    <div>
                        <button type='submit' className='w-[10rem] my-3 hover:bg-red-900 p-1.5 rounded-full bg-red-600 text-white text-lg'>Login</button>
                    </div>
                    <p className='text-lg  mb-5 text-white'>Do not have an accout ? <span className='text-xl text-blue-500 cursor-pointer' onClick={() => navigate("/register")}>Sign Up</span></p>
                </form>
            </div>
        </div>
    )
}

export default Login
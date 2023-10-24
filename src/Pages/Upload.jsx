import React, { useState } from 'react'
import axios from "axios";
import Header from '../Component/Header';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

const Upload = () => {
    const [file, setFile] = useState(null);
    const userData = useSelector((state) => state.user)
    const dispatch = useDispatch();
    const [name, setName] = useState("");
    const [base64String, setBase64String] = useState('');
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile instanceof Blob) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setBase64String(reader.result.split(',')[1]);
            };
            reader.readAsDataURL(selectedFile);
        }
    };
    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            const userId = userData.id
            const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/pdf/upload`, {
                id: userId,
                name: name,
                pdf: base64String,
            })
            if (res?.status === 200) {
                toast("PDF uploaded Successfully")
                setName("");
                setFile(null);
            }
        } catch (error) {
            if (error?.res?.statue === 404) {
                toast(error?.res?.data?.msg)
            }
            if (error?.res?.statue === 500) {
                toast(error?.res?.data?.msg)
            }
        }
    }
    return (
        <div>
            <Header />
            <div className='w-full p-4 flex bg-slate-300 min-h-[calc(90vh)] items-center justify-center'>
                <div className='w-[30rem] m-auto rounded-2xl shadow-lg bg-white flex flex-col items-center '>
                    <h1 className='text-2xl font-semibold my-4'>Choose your PDF </h1>
                    <form className='flex flex-col items-center' onSubmit={handleUpload} >
                        <div className='flex flex-col items-start gap-2 w-[20rem] my-3'>
                            <label htmlFor='name'>Name</label>
                            <input type='text' id='name' name='name' value={name} onChange={(e) => setName(e.target.value)} className='w-full outline-none border-none bg-slate-200 p-1 rounded-md' placeholder='Enter the PDF name..' />
                        </div>
                        <input className='my-3' type='file' accept='.pdf' onChange={handleFileChange} />
                        <div className='w-[6rem]  flex items-center justify-center my-4 rounded-full bg-red-800'>
                            <button className='text-xl p-1 cursor-pointer text-white' type='submit'>Upload</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Upload
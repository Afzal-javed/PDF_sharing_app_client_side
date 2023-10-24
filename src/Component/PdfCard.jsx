import React from 'react'
import logo from "../assets/pdf-uploader.png";
const PdfCard = ({ name }) => {
    return (
        <div className={`p-3 bg-white my-3 rounded-xl cursor-pointer`}>
            <div className='w-[10rem]  flex flex-col items-center'>
                <img src={logo} alt='pdf' />
                <p className='text-lg font-semibold mt-3'>{name}</p>
            </div>
        </div>
    )
}

export default PdfCard
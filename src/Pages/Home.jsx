import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PdfCard from '../Component/PdfCard';
import Header from '../Component/Header';
import { setPdfData, removeDeletedPdf } from "../redux/pdfSlice";
import { useDispatch, useSelector } from 'react-redux';
import { Document, Page, pdfjs } from 'react-pdf';
import { BsFillArrowLeftCircleFill } from "react-icons/bs";
import { AiFillDelete } from "react-icons/ai";
import { PDFDocument } from 'pdf-lib'
import "pdfjs-dist/build/pdf.worker.entry";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'pdfjs-dist/web/pdf_viewer.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

class ErrorBoundary extends React.Component {
    componentDidCatch(error, errorInfo) {
        console.error('Error in PDF copying:', error);
        console.error('Error info:', errorInfo);
    }

    render() {
        return this.props.children;
    }
}
const Home = () => {
    const userData = useSelector((state) => state.user);
    console.log(userData);
    const dispatch = useDispatch();
    const allData = useSelector((state) => state.pdf);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [selectedAllPdf, setSelectedAllPdf] = useState(null);
    const [selectedPages, setSelectedPages] = useState([]);
    const navigate = useNavigate();
    const [numPages, setNumPages] = useState(null);
    const myFilterData = allData?.pdfList.filter((doc) => doc?.allDocuments?.id === userData?.id);
    const allPdfFilterData = allData?.pdfList.filter((doc) => doc?.allDocuments?.id !== userData?.id);
    const handleUpload = () => {
        navigate("/upload");
    }
    useEffect(() => {
        const fetchData = async () => {
            try {
                const allData = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/pdf/fetch`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (allData?.status === 200) {
                    const data = await allData.json();
                    dispatch(setPdfData(data));
                }
            } catch (error) {
                if (error?.allData?.status === 500) {
                    toast(error?.allData?.data?.msg)
                }
            }
        }
        fetchData()
    }, [])
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const togglePageSelection = (pageNumber) => {
        setSelectedPages((prevSelectedPages) =>
            prevSelectedPages.includes(pageNumber)
                ? prevSelectedPages.filter((page) => page !== pageNumber)
                : [...prevSelectedPages, pageNumber]
        );
    };
    const renderPages = () => {
        return Array.from(new Array(numPages), (el, index) => (
            <div key={`page_${index + 1}`} className='flex flex-col items-center gap-2'>
                <ErrorBoundary key={`error_boundary_${index + 1}`}>
                    <Page pageNumber={index + 1} />
                </ErrorBoundary>
                <label>
                    <input
                        type='checkbox'
                        checked={selectedPages.includes(index + 1)}
                        onChange={() => togglePageSelection(index + 1)}
                    />
                    Page {index + 1}
                </label>
            </div>
        ));
    };

    const handleGenerateNewPdf = async () => {
        const id = userData?.id
        let arrayBuffer
        if (id === selectedPdf?.allDocuments?.id) {
            arrayBuffer = selectedPdf?.allDocuments?.pdf?.data;
        } else {
            arrayBuffer = selectedAllPdf?.allDocuments?.pdf?.data
        }
        const existingPdfBytes = new Uint8Array(arrayBuffer);
        if (!existingPdfBytes || !(existingPdfBytes instanceof Uint8Array)) {
            console.error('Error: Invalid PDF byte data');
            return;
        }
        try {
            const existingPdfDoc = await PDFDocument.load(existingPdfBytes);
            const newPdfDoc = await PDFDocument.create();
            const adjustedPages = selectedPages.map(pageIndex => pageIndex - 1);
            for (const pageIndex of adjustedPages) {
                const [copiedPage] = await newPdfDoc.copyPages(existingPdfDoc, [pageIndex]);
                newPdfDoc.insertPage(newPdfDoc.getPageCount(), copiedPage);
            }
            const newPdfBytes = await newPdfDoc.save();
            const base64Data = btoa(String.fromCharCode.apply(null, newPdfBytes));
            const pdfName = prompt('Enter a name for the new PDF:');
            const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/generated-pdf`, {
                id: id,
                name: pdfName,
                data: base64Data
            })
            if (response?.status === 200) {
                toast("PDF created successfully");
                dispatch(setPdfData(response.data));
                setSelectedAllPdf(null)
                setSelectedPdf(null);
            }
        } catch (error) {
            console.error('Error creating or copying PDF pages:', error);
        }
    };
    const handlePdfCardClick = (pdfData) => {
        setSelectedPdf(pdfData);
    }
    const handleAllPdfCardClick = (pdfData) => {
        setSelectedAllPdf(pdfData);
    }
    const handleDeletePdf = async () => {
        const id = selectedPdf?.allDocuments?.pdfId
        try {
            const res = await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/pdf/delete/${id}`)
            if (res.status === 200) {
                dispatch(removeDeletedPdf(id));
                setSelectedPdf(null);
                toast("PDF deleted successfully");
            }
        } catch (error) {
            if (error?.res?.status === 500) {
                toast(error?.res?.data?.msg);
            }
        }
    }
    const handleDownload = () => {
        if (selectedPdf) {
            const byteArray = new Uint8Array(selectedPdf.allDocuments.pdf.data)
            const base64Data = btoa(String.fromCharCode.apply(null, byteArray));
            const blob = b64toBlob(base64Data, 'application/pdf');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedPdf.allDocuments.name}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            const byteArray = new Uint8Array(selectedAllPdf.allDocuments.pdf.data)
            const base64Data = btoa(String.fromCharCode.apply(null, byteArray));
            const blob = b64toBlob(base64Data, 'application/pdf');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedAllPdf.allDocuments.name}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
    const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    };

    return (
        <div className=' w-full  '>
            <Header />
            <ErrorBoundary>
                <div className='w-full flex flex-col  bg-slate-300'>
                    <div className='my-3 '>
                        <h1 className='text-2xl p-3 font-sans font-bold'>My <span className='text-red-800'>PDF</span></h1>
                        <div className={`w-screen p-3  flex ${selectedPdf ? 'flex-col' : 'overflow-hidden overflow-x-scroll'}  md:flex-row gap-3 items-center`}>
                            {selectedPdf ?
                                <>
                                    <div className='w-full md:w-[50%] p-3 overflow-hidden overflow-x-scroll flex gap-3 items-center'>
                                        {
                                            myFilterData?.map((doc, index) => (
                                                <div key={index} onClick={() => handlePdfCardClick(doc)}>
                                                    <PdfCard
                                                        name={doc?.allDocuments?.name}

                                                    />
                                                </div>
                                            ))
                                        }
                                    </div>
                                    <div className='w-full md:w-[50%]'>
                                        <div className='flex items-center justify-between mb-2'>
                                            <span className='text-3xl cursor-pointer' onClick={() => setSelectedPdf(null)}><BsFillArrowLeftCircleFill /></span>
                                            <p className='text-lg font-semibold text-center mr-6'>{selectedPdf?.allDocuments?.name}</p>
                                            <button className='text-lg font-semibold text-white bg-red-800 w-1/2 rounded-full hover:bg-red-900 p-1.5 ' onClick={handleDownload}>Download Now</button>
                                            <span className='text-4xl cursor-pointer hover:text-red-800' onClick={handleDeletePdf}><AiFillDelete /></span>
                                        </div>
                                        <Document className='overflow-hidden overflow-x-scroll flex gap-3'
                                            file={{ data: selectedPdf?.allDocuments?.pdf?.data }}
                                            onLoadSuccess={onDocumentLoadSuccess}
                                        >
                                            {renderPages()}
                                        </Document>
                                        <div className='w-full flex items-center justify-center'>
                                            <button disabled={selectedPages.length === 0} className='w-[10rem] my-3 bg-red-800 p-1 rounded-full hover:bg-red-950 text-white text-lg text-center' onClick={handleGenerateNewPdf}>Generate PDF</button>
                                        </div>
                                    </div>
                                </>
                                :
                                (
                                    myFilterData.length !== 0 ?
                                        (myFilterData?.map((doc, index) => (
                                            <div key={index} onClick={() => handlePdfCardClick(doc)}>
                                                <PdfCard
                                                    name={doc?.allDocuments?.name}
                                                />
                                            </div>
                                        ))
                                        ) : (
                                            <div className='flex items-center m-auto gap-4'>
                                                <p className='text-2xl font-bold'>Plz Add PDF...</p>
                                            </div>
                                        )
                                )
                            }
                        </div>
                    </div>
                    <div className=' bg-red-800  w-[3rem] ml-auto mr-6 h-[3rem] cursor-pointer rounded-full text-center' onClick={handleUpload}>
                        <button className=' text-white  text-4xl font-bold ' >+</button>
                    </div>
                    <div className='my-3 '>
                        <h1 className='text-2xl p-3 font-sans font-bold'>All <span className='text-red-800'>PDF</span></h1>
                        <div className={`w-screen p-3  flex ${selectedAllPdf ? 'flex-col' : 'overflow-hidden overflow-x-scroll'}  md:flex-row gap-3 items-center`}>
                            {selectedAllPdf ?
                                <>
                                    <div className='w-full md:w-[50%] p-3 overflow-hidden overflow-x-scroll  flex gap-3 items-center'>
                                        {
                                            allPdfFilterData?.map((doc, index) => (
                                                <div key={index} onClick={() => handleAllPdfCardClick(doc)}>
                                                    <PdfCard
                                                        name={doc?.allDocuments?.name}
                                                    />
                                                </div>
                                            ))
                                        }
                                    </div>
                                    <div className='w-full md:w-[50%]'>
                                        <div className='flex items-center justify-between mb-2'>
                                            <span className='text-3xl cursor-pointer' onClick={() => setSelectedAllPdf(null)}><BsFillArrowLeftCircleFill /></span>
                                            <button className='text-lg font-semibold text-white bg-red-800 w-1/2 rounded-full hover:bg-red-900 p-1.5 ' onClick={handleDownload}>Download Now</button>
                                            <p className='text-lg font-semibold text-center mr-6'>{selectedAllPdf?.allDocuments?.name}</p>
                                        </div>
                                        <Document className='w-full overflow-hidden overflow-x-scroll flex gap-3'
                                            file={{ data: selectedAllPdf?.allDocuments?.pdf?.data }}
                                            onLoadSuccess={onDocumentLoadSuccess}
                                        >
                                            {renderPages()}
                                        </Document>
                                        <div className='flex items-center justify-center'>
                                            <button disabled={selectedPages.length === 0} className='w-[10rem] my-3 bg-red-800 p-1 rounded-full hover:bg-red-950 text-white text-lg text-center' onClick={handleGenerateNewPdf}>Generate PDF</button>
                                        </div>
                                    </div>
                                </>
                                :
                                (
                                    allPdfFilterData.length !== 0 ?
                                        (allPdfFilterData?.map((doc, index) => (
                                            <div key={index} onClick={() => handlePdfCardClick(doc)}>
                                                <PdfCard
                                                    name={doc?.allDocuments?.name}
                                                />
                                            </div>
                                        ))
                                        ) : (
                                            <div className='flex items-center m-auto gap-4'>
                                                <p className='text-2xl font-bold'>Plz Add PDF...</p>
                                            </div>
                                        )
                                )
                            }
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        </div>
    )
}

export default Home
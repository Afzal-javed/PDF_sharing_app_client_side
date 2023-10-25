import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    pdfList: []
}

export const pdfSlice = createSlice({
    name: "pdf",
    initialState,
    reducers: {
        setPdfData: (state, action) => {
            const newDataArray = action.payload;

            if (Array.isArray(newDataArray)) {
                newDataArray.forEach(newData => {
                    if (Array.isArray(newData)) {
                        newData.forEach(innerData => {
                            const existingPdfIndex = state.pdfList.findIndex(pdf => pdf.pdfId === innerData.pdfId);
                            if (existingPdfIndex !== -1) {
                                state.pdfList[existingPdfIndex] = innerData;
                            } else {
                                state.pdfList.push(innerData);
                            }
                        });
                    } else {
                        const existingPdfIndex = state.pdfList.findIndex(pdf => pdf.pdfId === newData.pdfId);
                        if (existingPdfIndex !== -1) {
                            state.pdfList[existingPdfIndex] = newData;
                        } else {
                            state.pdfList.push(newData);
                        }
                    }
                });
            } else {
                console.error('Error: Invalid data format for setPdfData. Expected an array.');
            }
        },




        removeDeletedPdf: (state, action) => {
            const deletedPdfId = action.payload;
            state.pdfList = state.pdfList.filter(pdf => pdf.pdfId !== deletedPdfId);
        }
    }
})
export const { setPdfData, removeDeletedPdf } = pdfSlice.actions

export const pdfSliceReducer = pdfSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    pdfList: []
}

export const pdfSlice = createSlice({
    name: "pdf",
    initialState,
    reducers: {
        setPdfData: (state, action) => {
            const newData = action.payload;
            // Check if the PDF already exists in the state
            const existingPdfIndex = state.pdfList.findIndex(pdf => pdf.allDocuments.pdfId === newData.allDocuments.pdfId);
            if (existingPdfIndex !== -1) {
                // If it exists, update it
                state.pdfList[existingPdfIndex] = newData;
            } else {
                // If it doesn't exist, add it
                state.pdfList.push(newData);
            }
        },
        removeDeletedPdf: (state, action) => {
            const deletedPdfId = action.payload;
            state.pdfList = state.pdfList.filter(pdf => pdf.allDocuments.pdfId !== deletedPdfId);
        }
    }
})
export const { setPdfData, removeDeletedPdf } = pdfSlice.actions

export const pdfSliceReducer = pdfSlice.reducer;
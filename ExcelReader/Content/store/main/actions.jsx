export const mainActionsTypes = {
    UPDATE_DATA_TABLE: "MAIN/UPDATE_DATA_TABLE",
    UPDATE_CONTAIN_HEADERS: "MAIN/UPDATE_CONTAIN_HEADERS",
    UPDATE_SELECTED_FILE_NAME: "MAIN/UPDATE_SELECTED_FILE_NAME",
    UPDATE_SEPARATOR: "MAIN/UPDATE_SEPARATOR"
}

export const mainActions = {
    updateTable: dataTable => ({
        type: mainActionsTypes.UPDATE_DATA_TABLE,
        payload: dataTable
    }),
    updateContainHeaders: isContainHeaders => ({
        type: mainActionsTypes.UPDATE_CONTAIN_HEADERS,
        payload: isContainHeaders
    }),
    updateSelectedFileName: selectedFileName => ({
        type: mainActionsTypes.UPDATE_SELECTED_FILE_NAME,
        payload: selectedFileName
    }),
    updateSeparator: separator => ({
        type: mainActionsTypes.UPDATE_SEPARATOR,
        payload: separator
    })
}
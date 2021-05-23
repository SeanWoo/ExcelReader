import { mainActionsTypes } from "./actions"

const initialState = {
    pathToServer: "",
    selectedFileName: "",
    isContainHeaders: false,
    separator: ",",
    currentTable: {
        headers: [],
        data: [[]],
    }
}

export const mainReducer = (state = initialState, action) => {
    let newState;
    switch(action.type){
        case mainActionsTypes.UPDATE_DATA_TABLE:
            newState = {...state}
            newState.currentTable.data = action.payload
            return newState
        case mainActionsTypes.UPDATE_CONTAIN_HEADERS:
            return {...state, isContainHeaders: action.payload}
        case mainActionsTypes.UPDATE_SELECTED_FILE_NAME:
            return {...state, selectedFileName: action.payload}
        case mainActionsTypes.UPDATE_SEPARATOR:
            return {...state, separator: action.payload}
        default:
            return state
    }
}
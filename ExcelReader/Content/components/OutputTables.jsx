import React, { useEffect, useState } from 'react';
import { Button, Container, Form, Table } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { mainActions } from '../store/main/actions';

//Компонента таблицы с названиями
function HeaderTable(props) {
    const dispatch = useDispatch()
    const table = useSelector(x => x.main.currentTable)

    //Обработчик изменения заголовка таблицы, в качестве аргументов передаётся изменное значение и индекс в таблицы по оси X
    const handleChangeHeader = (value, i) => {
        let currentTable = [...table.data]
        currentTable[0][i] = value
        dispatch(mainActions.updateTable(currentTable))
    }
    return (
        <Table>
            <thead>
                <tr>
                    <th>Имя столбца: </th>
                </tr>
            </thead>
            <tbody>
                {props.headers.map((x, i) =>
                    <tr>
                        <td>
                            <Form.Control type="text" value={x} onChange={(event) => handleChangeHeader(event.target.value, i)} />
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    );
}

//Компонента которая выводит таблицу
function CsvTable(props) {
    const dispatch = useDispatch()
    const table = useSelector(x => ({
        data: x.main.currentTable.data,
        isContainHeaders: x.main.isContainHeaders,
        separator: x.main.separator,
        selectedFileName: x.main.selectedFileName
    }))

    //Обработчик кнопки "+" добавляющий новую строку в таблицу
    const handleAddRow = (event) => {
        let currentTable = [...table.data]
        currentTable.push(new Array(currentTable[0].length).fill(""))
        dispatch(mainActions.updateTable(currentTable))
    }
    //Обработчик кнопки "Сохранить"
    const handleSave = (event) => {
        //Функция которая сохраняет таблицу на сервере
        async function saveTable(blob){
            let data = new FormData()
            data.append("file", blob, table.selectedFileName)

            await fetch("api/files", {
                method: "POST",
                body: data
            })
        }

        //Превращаем файл из двумерного массив в текстовое представление
        let fileResult = ""
        for(let y = 0; y < table.data.length; y++){
            for(let x =0; x < table.data[0].length; x++){
                fileResult += table.data[y][x] + table.separator
            }
            fileResult = fileResult.slice(0, -1)
            fileResult += "\n"
        }
        
        var blob = new Blob([fileResult], {
            type: 'text/plain'
        });

        saveTable(blob)
    }

    //Обработчик изменения ячейки
    const handleChangeCell = (value, x, y) => {
        let currentTable = [...table.data]
        currentTable[x + 1][y] = value
        dispatch(mainActions.updateTable(currentTable))
    }
    return (
        <Container fluid>
            <Table>
                <thead>
                    <tr>
                        {props.headers.map(x => <th>{x}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {props.data.map((x, i) =>
                        <tr>
                            {x.map((y, j) => <td><Form.Control type="text" value={y} onChange={(event) => handleChangeCell(event.target.value, i, j)} /></td>)}
                        </tr>
                    )}
                </tbody>
            </Table>
            <Button className="btn-block" variant="outline-secondary" onClick={handleAddRow}>+</Button>
            <Button className="btn-block" variant="outline-secondary" onClick={handleSave}>Сохранить</Button>
        </Container>
    );
}

//Компонента которая выводит таблицы
export function OutputTable() {
    const dispatch = useDispatch()
    const state = useSelector(x => ({
        data: x.main.currentTable.data,
        isContainHeaders: x.main.isContainHeaders,
        selectedFileName: x.main.selectedFileName,
        separator: x.main.separator
    }))

    let [headers, setHeaders] = useState([])
    let [data, setData] = useState([[]])

    useEffect(() => {
        //Вытаскивает с сервера выбранный файл и десерилизирует его
        async function getData() {
            if (state.selectedFileName === "")
                return;

            let result = await fetch("api/files/" + state.selectedFileName);
            let rawData = await result.text()
            let data = rawData.split('\n').map(x => x.split(state.separator)).slice(0, -1)

            if (!state.isContainHeaders){
                let headers = []
                for(let i = 0; i < data[0].length; i++)
                    headers.push("col_" + i)
                    
                data.unshift(headers)
            }

            setData(data)
            dispatch(mainActions.updateTable(data))
        }
        getData()
    }, [state.selectedFileName])

    //Эффект который разрезает таблицу на хейдеры и данные
    useEffect(() => {
        setHeaders(state.data.slice(0, 1)[0])
        setData(state.data.slice(1))
    }, [state.data, state.selectedFileName])

    return (
        <Container fluid>
            <HeaderTable headers={headers} data={data} />
            <CsvTable headers={headers} data={data} />
        </Container>
    );
}
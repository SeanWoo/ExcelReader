import React, { useState } from 'react';
import { Container, Form, Button, ToggleButtonGroup, ToggleButton, Row, Col, ListGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { mainActions } from '../store/main/actions';
import NotifyPanel from './NotifyPanel';

//Компонента выводящая панель управления
export function ManagePanel() {
    let dispatch = useDispatch()

    const main = useSelector(x => x.main)

    let [pathToServer, setPathToServer] = useState("Не выбран файл")
    let [selectedFile, setSelectedFile] = useState(null)
    let [isContainHeaders, setIsContainHeaders] = useState(false)
    let [showSelectionPanel, setShowSelectionPanel] = useState(false)
    let [showSelectionPanelFromServer, setShowSelectionPanelFromServer] = useState(false)
    let [filesOnServer, setFilesOnServer] = useState([])
    let [fileFetchedFromServer, setFileFetchedFromServer] = useState(false)

    //Обработчик кнопки "Прочитать данные"
    //Если файл был выбран с сервера, то обновляет в глобал стейте выбранный файл
    //Если файл был выбран с компьютера, то загружаем данный файл на сервер и обновляем в глобал стейте выбранный файл
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (fileFetchedFromServer) {
            dispatch(mainActions.updateSelectedFileName(pathToServer))
        } else {
            let data = new FormData()
            data.append("file", selectedFile)

            let result = await fetch("api/files", {
                method: "PUT",
                body: data
            })

            if (result.ok) {
                dispatch(mainActions.updateSelectedFileName(selectedFile.name))
            }
            else {
                alert("Такой файл уже сущетсвует на сервере")
            }
        }
    }

    //Обработчик изменения чекбокса который указывает на то, содержит ли таблица в качестве первой строки заголовки
    const handleChangeContainHeaders = (event) => {
        setIsContainHeaders(event.target.checked)
        dispatch(mainActions.updateContainHeaders(event.target.checked))
    }

    //Обработчик выбора разделителя для таблицы
    const handleChangeSeparator = (value) => {
        dispatch(mainActions.updateSeparator(value))
    }

    //Обработчик кнопки "Выбрать файл", указывает что нужно показать всплывающее окно с выбором файла
    const handleFileSelection = (value) => {
        setShowSelectionPanel(true)
    }

    //Обработчик выбора файла с сервера
    const handleFileSelectionFromServer = (value) => {
        //Функция получает все файлы с сервера и сохраняет в filesOnServer в качестве массива с объектами формата {id: 0, fileName: ""}
        async function getAllFiles() {
            let result = await fetch("api/files")

            if (result.ok) {
                setFilesOnServer(await result.json())
            }
        }
        getAllFiles()
        setShowSelectionPanelFromServer(true)
    }

    //Обработчик который выбирает файл с клиента и сохраняет его в локал стейт
    const handleSelectFileFromClient = (event) => {
        setSelectedFile(event.target.files[0])
        setPathToServer(event.target.files[0].name)
        setFileFetchedFromServer(false)
        setShowSelectionPanel(false)
    }

    //Обработчик который выбирает файл с сервера и сохраняет его в локал стейт
    const handleSelectFileFromServer = (fileName) => {
        setSelectedFile(fileName)
        setPathToServer(fileName)
        setFileFetchedFromServer(true)
        setShowSelectionPanelFromServer(false)
        setShowSelectionPanel(false)
    }

    return (
        <Container fluid>

            <NotifyPanel
                show={showSelectionPanelFromServer}
                onHide={() => setShowSelectionPanelFromServer(false)}
                title="Выберите файл с сервера"
                body={
                    <ListGroup>
                        {filesOnServer.map(x =>
                            <ListGroup.Item action onClick={() => handleSelectFileFromServer(x.fileName)}>
                                {x.fileName}
                            </ListGroup.Item>
                        )}
                    </ListGroup>
                }
            />

            <Form encType="multipart/form-data" onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label>Путь файла на сервере: </Form.Label>
                    <Form.Label>{pathToServer}</Form.Label>
                </Form.Group>
                <Form.Group>
                    <Button onClick={handleFileSelection}>Выбрать файл</Button>
                    <NotifyPanel
                        show={showSelectionPanel}
                        onHide={() => setShowSelectionPanel(false)}
                        title="Выбор файла"
                        body={
                            <Container fluid>
                                <Row>
                                    <Col>
                                        <Form.File id="fileSelector" label="Выберите файл у себя с компьютера"
                                            onChange={handleSelectFileFromClient} />
                                    </Col>
                                    <Col className="text-center">
                                        <h3>или</h3>
                                    </Col>
                                    <Col >
                                        <Button onClick={handleFileSelectionFromServer}>Выбор с сервера</Button>
                                    </Col>
                                </Row>
                            </Container>
                        }
                    />

                </Form.Group>
                <Form.Group>
                    <Form.Check type="checkbox" checked={isContainHeaders} onChange={handleChangeContainHeaders} label="Первая строка содержит заголовки" id="containsHeadersCheck" />
                </Form.Group>
                <Row>
                <Col className="col-auto">
                    <ToggleButtonGroup vertical type="radio" name="options" value={main.separator} onChange={handleChangeSeparator} defaultValue=",">
                        <ToggleButton value="\t">Знак табуляции</ToggleButton>
                        <ToggleButton value=" ">Пробел</ToggleButton>
                        <ToggleButton value=";">Точка с запятой</ToggleButton>
                        <ToggleButton value=",">Запятая</ToggleButton>
                        <ToggleButton value="">Свой выбор</ToggleButton>
                    </ToggleButtonGroup>
                </Col>
                <Col className="align-self-end">
                    <Form.Control type="text" maxLength="1" onChange={(e) => dispatch(mainActions.updateSeparator(e.target.value))}/>
                </Col>
                </Row>
                <Button className="mt-5" variant="primary" type="submit" onSubmit={handleSubmit}>
                    Прочитать данные
                </Button>
            </Form>
        </Container>
    );
}
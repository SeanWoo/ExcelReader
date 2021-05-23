import React from 'react';
import { BrowserRouter, StaticRouter } from 'react-router-dom';
import { Container, Row, Col} from 'react-bootstrap';
import { createStore } from 'redux';
import { connect, Provider } from 'react-redux';

import { OutputTable } from './components/OutputTables'
import rootReducer from './store/reducers'
import { composeWithDevTools, devToolsEnhancer } from 'redux-devtools-extension';
import { ManagePanel } from './components/ManagePanel';

let store = createStore(rootReducer, devToolsEnhancer())

//Компонента приложения
export default class App extends React.Component {
    render() {
        const app = (
            <Provider store={store}>
                <Container>
                    <Row>
                        <Col className="col">
                            <ManagePanel/>
                        </Col>
                        <Col className="col">
                            <OutputTable/>
                        </Col>
                    </Row>
                </Container>
            </Provider>
        );

        if (typeof window === 'undefined') {
            return (
                <StaticRouter
                    context={this.props.context}
                    location={this.props.location}
                >
                    {app}
                </StaticRouter>
            );
        }
        return <BrowserRouter>{app}</BrowserRouter>;
    }
}
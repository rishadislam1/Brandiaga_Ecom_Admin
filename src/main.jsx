import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Loader from './Components/Loader';
import { router } from './Routes/router';
import {ToastContainerComponent} from "./Components/ToasterComponent.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <Loader />
            <ToastContainerComponent />
            <RouterProvider router={router} />
        </Provider>
    </StrictMode>,
);
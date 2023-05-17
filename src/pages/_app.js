import '@/styles/globals.scss';
import { Provider } from 'react-redux';
import { wrapper } from '../store/index';

const wrapIntoProvider = function (page, store, pageProps) {
    return (
        <Provider store={store} {...pageProps}>
            {page}
        </Provider>
    );
};

export default function App({ Component, pageProps }) {
    const { store } = wrapper.useWrappedStore(pageProps);
    const getLayout = Component.getLayout || ((page) => page);
    const component = <Component {...pageProps}/>;

    return wrapIntoProvider(getLayout(component), store, pageProps);
}

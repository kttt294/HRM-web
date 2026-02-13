import { Providers } from './providers';
import { AppRouter } from './router';
import { Snackbar } from '../components/ui/Snackbar';

function App() {
    return (
        <Providers>
            <AppRouter />
            <Snackbar />
        </Providers>
    );
}

export default App;

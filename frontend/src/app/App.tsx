import { Providers } from './providers';
import { AppRouter } from './router';
import { Snackbar } from '../components/ui/Snackbar';
import { ChatWidget } from '../features/ai/components/ChatWidget'; // Import ChatWidget

function App() {
    return (
        <Providers>
            <AppRouter />
            <Snackbar />
            <ChatWidget /> {/* Add ChatWidget */}
        </Providers>
    );
}

export default App;

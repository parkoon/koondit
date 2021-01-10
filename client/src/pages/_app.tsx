import '../styles/tailwind.css'
import '../styles/icon.css'
import { AppProps } from 'next/app'
import Axios from 'axios'
import { useRouter } from 'next/router'

import Navbar from '../components/Navbar'
import { AutoProvider } from '../context/auth'

Axios.defaults.baseURL = 'http://localhost:5000/api'
Axios.defaults.withCredentials = true

function App({ Component, pageProps }: AppProps) {
    const { pathname } = useRouter()
    const authRoutes = ['/register', '/login']
    const authRoute = pathname === '/register' || pathname === '/login'
    return (
        <AutoProvider>
            {!authRoute && <Navbar />}
            <Component {...pageProps} />
        </AutoProvider>
    )
}

export default App

import '../styles/tailwind.css'
import { AppProps } from 'next/app'
import Axios from 'axios'

import Navbar from '../components/Navbar'
import { useRouter } from 'next/router'

Axios.defaults.baseURL = 'http://localhost:5000/api'
Axios.defaults.withCredentials = true

function App({ Component, pageProps }: AppProps) {
    const { pathname } = useRouter()
    const authRoutes = ['/register', '/login']
    const authRoute = pathname === '/register' || pathname === '/login'
    return (
        <>
            {!authRoute && <Navbar />}
            <Component {...pageProps} />
        </>
    )
}

export default App

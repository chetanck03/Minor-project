import { RouterProvider } from 'react-router-dom'
import { routes } from './routes/routes'
import ThemeProvider from './context/ThemeContext'
import Web3Provider from './context/Web3Provider'

function App() {
  return (
    <ThemeProvider>
      <Web3Provider>
        <RouterProvider router={routes} />
      </Web3Provider>
    </ThemeProvider>
  )
}

export default App
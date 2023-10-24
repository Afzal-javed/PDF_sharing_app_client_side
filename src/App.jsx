
import { Route, Routes, Outlet, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import Home from './Pages/Home'
import Upload from './Pages/Upload'
import Login from './Pages/Login';
import Signin from './Pages/Signin';
import PageNotFound from './Pages/PageNotFound';
import { Toaster } from "react-hot-toast";
function Layout() {
  const userData = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  return userData?.token ? (
    <Outlet />
  ) : (
    <Navigate to={"/login"} state={{ form: location }} replace />
  )
}

function App() {

  return (
    <div className='w-full min-h-[calc(100vh)] bg-slate-300'>
      <Toaster />
      <Routes>
        <Route element={<Layout />}>
          <Route path={"/"} element={<Home />} />
          <Route path={"/upload"} element={<Upload />} />
        </Route>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Signin />} />
        <Route path='*' element={<PageNotFound />} />
      </Routes>
    </div>
  )
}

export default App

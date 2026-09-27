import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Backdrop } from './components/Backdrop';
import { Loader } from './components/Loader';
import { Nav } from './components/Nav';
import { RouteEffects, SmoothScroll } from './lib/motion';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { ProjectPage } from './pages/ProjectPage';

export function App() {
  return (
    <BrowserRouter>
      <a href="#main" className="skip">
        Saltar al contenido
      </a>
      <Backdrop />
      <SmoothScroll />
      <RouteEffects />
      <Loader />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/proyectos/:slug" element={<ProjectPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

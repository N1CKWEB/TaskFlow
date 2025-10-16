import '../../src/styles/App.css';
import React from 'react';

export function Home() {
  return (
    <div className="App">

      <header className="App-header">
        <h1 className='title'>TaskFlow</h1>
        <div>
        <img src="" alt=""  className='img-logo-principal'/>
        </div>
        {/* Logo de Perfil */}
        <div className='container-logo-perfil'>
          <a href="" className='link-perfil'>
        <img src="" alt="" className='img-logo-perfil' />
        </a>
        </div>
      </header>

      <section className='App-section'>

        <div className='container-home'>
          <h2 className='name-home'>Hola Nicolás</h2>
          <h4 className='subtitle-home'>Bienvenido de vuelta a tu espacio de tareas para administrar</h4>

         {/* Buscador de proyecto */}
          <input placeholder='Introduce el nombre del proyecto' className='container-search' type="text" />

         <div className='container-principal-project'>
          <h3 className='name-project'>Proyectos</h3>
          
          {/* Boton crear un nuevo proyecto */}
          <button className='button-project'>+ Nuevo Proyecto</button>

          {/* Este sera el div de los proyectos*/}
          <div className='container-projects-1'>
          </div>


         </div>
        </div>
      </section>
    </div>
  );
}

export default Home;


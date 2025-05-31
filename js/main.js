// js/main.js - Club Atlético Villa Canto (Versión Final Corregida y Sincronizada con data.json)

let allData = {}; // Contendrá toda la información de data.json

document.addEventListener('DOMContentLoaded', cargarDatosYRenderizar);

async function cargarDatosYRenderizar() {
    try {
        // La ruta de data.json es absoluta desde la raíz del dominio
        const response = await fetch('/data.json'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allData = await response.json();

        // Determinar si estamos en una página de categoría para ajustar rutas relativas
        const path = window.location.pathname;
        // Asume que las páginas de categoría están en una carpeta 'categorias/'
        const isCategoryPage = path.includes('/categorias/'); 

        // Renderiza el encabezado y el pie de página siempre, ajustando las rutas
        renderHeaderNav(isCategoryPage);
        renderFooter(isCategoryPage);

        // Renderiza las secciones del INDEX.HTML solo si estamos en la página principal
        // o si es la raíz (ej. dominio.com/)
        if (!isCategoryPage || path.endsWith('index.html') || path === '/') {
            renderHeroSection(); // Renderiza el contenido dinámico si se define en data.json
            renderNuestroClub();
            renderNoticias();
            renderGaleria();
            renderContacto();
            renderDescuentos(); // Asegúrate de tener una sección 'descuentos' en data.json si la usas
        }

        // Si estamos en una página de categoría, renderizamos solo esa categoría
        if (isCategoryPage) {
            const categoryFileName = path.split('/').pop(); // Ej: "2013.html"
            const categoryId = categoryFileName.replace('.html', ''); // Ej: "2013"
            renderCategoryPage(categoryId);
        }

    } catch (error) {
        console.error('Error al cargar o renderizar los datos:', error);
        // Muestra un mensaje de error amigable al usuario en caso de fallo crítico
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.innerHTML = `<section class="error-message content-section container">
                                        <h2>¡Oops!</h2>
                                        <p>No pudimos cargar la información del club. Por favor, inténtalo de nuevo más tarde.</p>
                                        <p>Detalles: ${error.message}</p>
                                    </section>`;
        }
    }
}

// --- Funciones de Renderizado ---

// Función para renderizar el encabezado y la navegación
function renderHeaderNav(isCategoryPage) {
    const header = document.querySelector('header');
    if (!header) return;

    // Determinar la ruta base para imágenes y enlaces de navegación
    const imagePathPrefix = isCategoryPage ? '../images/' : 'images/';
    const basePath = isCategoryPage ? '../' : ''; // Para enlaces como index.html, contacto.html

    // Acceder a la información del club desde allData.club
    const clubName = allData.club?.name || 'Club Atlético'; // Usa el operador ?. para acceso seguro
    const clubLogo = allData.club?.logo || `${imagePathPrefix}logo.png`; // Usa logo del JSON si existe

    header.innerHTML = `
        <div class="logo">
            <img src="${clubLogo}" alt="Logo de ${clubName}">
            <h1>${clubName}</h1>
        </div>
        <nav>
            <ul class="nav-links">
                <li><a href="${basePath}index.html">Inicio</a></li>
                <li><a href="${basePath}index.html#nuestro-club">Nuestro Club</a></li>
                <li class="dropdown">
                    <a href="#">Categorías <i class="fas fa-chevron-down dropdown-arrow"></i></a>
                    <div class="dropdown-content" id="categorias-dropdown">
                    </div>
                </li>
                <li><a href="${basePath}index.html#noticias">Noticias</a></li>
                <li><a href="${basePath}index.html#galeria">Galería</a></li>
                <li><a href="${basePath}index.html#contacto">Contacto</a></li>
            </ul>
            <div class="burger">
                <div class="line1"></div>
                <div class="line2"></div>
                <div class="line3"></div>
            </div>
        </nav>
    `;

    // Llenar el dropdown de categorías (si hay datos y el elemento existe)
    const categoriasDropdown = document.getElementById('categorias-dropdown');
    if (categoriasDropdown && allData.categories) { // Cambiado a allData.categories
        allData.categories.forEach(categoria => { // Cambiado a allData.categories
            const link = document.createElement('a');
            // La ruta de las categorías ahora usa el ID directo del JSON (ej. "2013")
            link.href = `${basePath}categorias/${categoria.id}.html`; 
            link.textContent = categoria.name; // Cambiado a categoria.name
            categoriasDropdown.appendChild(link);
        });
    }

    // Lógica para el menú hamburguesa
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');

    if (burger && nav) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            burger.classList.toggle('toggle');
        });
    }
}

function renderHeroSection() {
    const heroSection = document.getElementById('hero');
    // Asumo que tu 'hero' está en el nivel raíz de data.json, si no lo tienes, esta función no hará nada
    if (!heroSection || !allData.hero) return; 

    heroSection.innerHTML = `
        <div class="hero-content">
            <h2>${allData.hero.titulo || 'Bienvenido al Club'}</h2>
            <p>${allData.hero.subtitulo || 'Pasión por el Baby Fútbol'}</p>
            <a href="${allData.hero.botonLink || '#nuestro-club'}" class="btn">${allData.hero.botonTexto || 'Saber más'}</a>
        </div>
    `;
    // Si quieres que la imagen de fondo sea dinámica:
    // heroSection.style.backgroundImage = `url('${allData.hero.fondoImagen}')`;
}

function renderNuestroClub() {
    const nuestroClubSection = document.getElementById('nuestro-club');
    // Acceso a allData.club
    if (!nuestroClubSection || !allData.club) return; 

    nuestroClubSection.innerHTML = `
        <div class="container">
            <h2>Nuestro Club</h2>
            <div class="club-info-grid">
                <div class="info-item">
                    <h3>Historia</h3>
                    <p>${allData.club.history || 'No hay historia disponible.'}</p>
                </div>
                <div class="info-item">
                    <h3>Valores</h3>
                    <ul>
                        ${(allData.club.values || []).map(valor => `<li><i class="fas fa-check-circle"></i> ${valor}</li>`).join('')}
                    </ul>
                </div>
                <div class="info-item">
                    <h3>Instalaciones</h3>
                    <p>${allData.club.facilities || 'No hay información de instalaciones disponible.'}</p>
                </div>
            </div>
        </div>
    `;
}

function renderNoticias() {
    const noticiasSection = document.getElementById('noticias');
    // Acceso a allData.news
    if (!noticiasSection || !allData.news) return;

    const noticiasGrid = document.createElement('div');
    noticiasGrid.classList.add('noticias-grid');

    if (allData.news.length === 0) {
        noticiasGrid.innerHTML = '<p class="no-data-message">No hay noticias disponibles en este momento.</p>';
    } else {
        allData.news.slice(0, 3).forEach(noticia => { // Mostrar solo las primeras 3
            const newsCard = document.createElement('article');
            newsCard.classList.add('noticia-card');
            // Formatear la fecha
            const fechaNoticia = new Date(noticia.fecha).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
            newsCard.innerHTML = `
                <img src="${noticia.imagen}" alt="${noticia.titulo}" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=Noticia';">
                <div class="card-content">
                    <h3>${noticia.titulo}</h3>
                    <p class="news-date">Publicado: ${fechaNoticia}</p>
                    <p>${noticia.contenido.substring(0, 150)}...</p>
                    <a href="#" class="read-more">Leer más</a> </div>
            `;
            noticiasGrid.appendChild(newsCard);
        });
    }
    
    noticiasSection.innerHTML = `
        <div class="container">
            <h2>Últimas Noticias</h2>
            ${noticiasGrid.outerHTML}
            <div class="text-center mt-4">
                <a href="#" class="btn">Ver todas las noticias</a> </div>
        </div>
    `;
}

function renderGaleria() {
    const galeriaSection = document.getElementById('galeria');
    // Acceso a allData.gallery
    if (!galeriaSection || !allData.gallery) return;

    const galleryGrid = document.createElement('div');
    galleryGrid.classList.add('gallery-grid');

    if (allData.gallery.length === 0) {
        galleryGrid.innerHTML = '<p class="no-data-message">No hay imágenes en la galería.</p>';
    } else {
        allData.gallery.slice(0, 6).forEach(item => { // Mostrar solo las primeras 6
            const galeriaItem = document.createElement('div');
            galeriaItem.classList.add('galeria-item');
            galeriaItem.innerHTML = `
                <img src="${item.imagen}" alt="${item.titulo}" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=Imagen';">
                <div class="overlay">
                    <p>${item.titulo}</p>
                </div>
            `;
            galleryGrid.appendChild(galeriaItem);
        });
    }

    galeriaSection.innerHTML = `
        <div class="container">
            <h2>Galería Multimedia</h2>
            ${galleryGrid.outerHTML}
            <div class="text-center mt-4">
                <a href="#" class="btn">Ver más fotos y videos</a> </div>
        </div>
    `;
}

function renderContacto() {
    const contactoSection = document.getElementById('contacto');
    // Acceso a allData.club y sus sub-propiedades
    if (!contactoSection || !allData.club) return; 

    contactoSection.innerHTML = `
        <div class="container">
            <h2>Contacto</h2>
            <div class="contact-info">
                <p><i class="fas fa-map-marker-alt"></i> Dirección: ${allData.club.contact?.address || 'No disponible'}</p>
                <p><i class="fas fa-phone"></i> Teléfono: ${allData.club.contact?.phone || 'No disponible'}</p>
                <p><i class="fas fa-envelope"></i> Email: <a href="mailto:${allData.club.contact?.email}">${allData.club.contact?.email || 'No disponible'}</a></p>
                <div class="social-links-contact">
                    ${allData.club.socialLinks?.facebook ? `<a href="${allData.club.socialLinks.facebook}" target="_blank"><i class="fab fa-facebook-f"></i></a>` : ''}
                    ${allData.club.socialLinks?.instagram ? `<a href="${allData.club.socialLinks.instagram}" target="_blank"><i class="fab fa-instagram"></i></a>` : ''}
                    ${allData.club.socialLinks?.youtube ? `<a href="${allData.club.socialLinks.youtube}" target="_blank"><i class="fab fa-youtube"></i></a>` : ''}
                </div>
                <div class="map-container">
                    ${allData.club.contact?.mapIframe || '<p>Mapa no disponible.</p>'}
                </div>
            </div>
        </div>
    `;
}

// Nueva función para renderizar la sección de descuentos (si existe)
function renderDescuentos() {
    const descuentosSection = document.getElementById('descuentos'); 
    // Acceso a allData.discounts
    if (!descuentosSection || !allData.discounts || allData.discounts.length === 0) return;

    const descuentosGrid = document.createElement('div');
    descuentosGrid.classList.add('descuentos-grid');

    allData.discounts.forEach(descuento => {
        const descuentoCard = document.createElement('div');
        descuentoCard.classList.add('descuento-card');
        descuentoCard.innerHTML = `
            <img src="${descuento.imagen}" alt="${descuento.titulo}" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=Descuento';">
            <div class="card-content">
                <h3>${descuento.titulo}</h3>
                <p>${descuento.descripcion}</p>
                <p class="descuento-code">Código: <strong>${descuento.codigo}</strong></p>
                <p class="descuento-validez">Válido hasta: ${descuento.validez}</p>
            </div>
        `;
        descuentosGrid.appendChild(descuentoCard);
    });

    descuentosSection.innerHTML = `
        <div class="container">
            <h2>Descuentos Exclusivos</h2>
            ${descuentosGrid.outerHTML}
        </div>
    `;
}

// Función para renderizar la página de una categoría específica
function renderCategoryPage(categoryId) {
    const categoryDetailSection = document.getElementById('category-detail'); 
    if (!categoryDetailSection) {
        console.error('El elemento #category-detail no se encuentra en la página de categoría.');
        document.querySelector('main').innerHTML = `<p style="text-align: center; color: red;">Error: Estructura de página de categoría incorrecta.</p>`;
        return;
    }

    // Busca en allData.categories y usa 'id' y 'name'
    const category = allData.categories.find(cat => cat.id === categoryId);

    if (!category) {
        categoryDetailSection.innerHTML = `
            <div class="container text-center">
                <h2>¡Categoría no encontrada!</h2>
                <p>Lo sentimos, no pudimos encontrar la información para la categoría ${categoryId.toUpperCase()}.</p>
                <a href="../index.html" class="btn mt-4">Volver al Inicio</a>
            </div>
        `;
        console.error(`Categoría con ID ${categoryId} no encontrada.`);
        return;
    }

    // Actualiza el título de la pestaña del navegador
    document.title = `${category.name} - Club Atlético Villa Canto`; // category.name

    // Inyectar el nombre y descripción en los elementos correspondientes
    const categoryNameElement = categoryDetailSection.querySelector('#category-name');
    const categoryGroupPhotoElement = categoryDetailSection.querySelector('#category-group-photo');
    const categoryDescriptionElement = categoryDetailSection.querySelector('#category-description');
    const playersGridElement = categoryDetailSection.querySelector('#players-grid');
    const fixtureTableElement = categoryDetailSection.querySelector('#fixture-table');

    if (categoryNameElement) {
        categoryNameElement.textContent = category.name; // category.name
    }
    if (categoryGroupPhotoElement) {
        categoryGroupPhotoElement.src = category.photo; // category.photo
        categoryGroupPhotoElement.alt = `Foto grupal de ${category.name}`; // category.name
        categoryGroupPhotoElement.onerror = function() {
            this.onerror = null; 
            this.src = 'https://via.placeholder.com/600x400?text=Foto+de+equipo+no+disponible';
        };
    }
    if (categoryDescriptionElement) {
        categoryDescriptionElement.textContent = category.description; // category.description
    }

    // Renderizar jugadores
    if (playersGridElement) {
        if (category.players && category.players.length > 0) {
            playersGridElement.innerHTML = ''; 
            category.players.forEach(jugador => {
                const playerCard = document.createElement('div');
                playerCard.classList.add('player-card'); 
                playerCard.innerHTML = `
                    <img src="${jugador.imagen}" alt="Foto de ${jugador.nombre}" class="player-photo" onerror="this.onerror=null;this.src='https://via.placeholder.com/250x250?text=Jugador';">
                    <div class="player-info">
                        <h4>${jugador.nombre}</h4>
                        <p class="player-nickname">"${jugador.apodo || 'Sin apodo'}"</p>
                    </div>
                `;
                playersGridElement.appendChild(playerCard);
            });
        } else {
            playersGridElement.innerHTML = `<p class="no-data-message">No hay jugadores registrados para esta categoría aún.</p>`;
        }
    }

    // Renderizar fixture
    if (fixtureTableElement) {
        if (category.fixture && category.fixture.length > 0) {
            fixtureTableElement.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Local</th>
                            <th>Visitante</th>
                            <th>Resultado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${category.fixture.map(partido => `
                            <tr>
                                <td>${partido.fecha}</td>
                                <td>${partido.local}</td>
                                <td>Vs. ${partido.visitante}</td>
                                <td>${partido.resultado || 'Pendiente'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            fixtureTableElement.innerHTML = `<p class="no-data-message">El fixture no está disponible para esta categoría aún.</p>`;
        }
    }
}

// Función para renderizar el footer (también ajusta las rutas si es necesario)
function renderFooter(isCategoryPage) {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const basePath = isCategoryPage ? '../' : ''; 

    // Acceso a allData.club y sus sub-propiedades
    const clubAddress = allData.club?.contact?.address || 'Dirección no disponible';
    const clubPhone = allData.club?.contact?.phone || 'Teléfono no disponible';
    const clubEmail = allData.club?.contact?.email || 'Email no disponible';

    footer.innerHTML = `
        <div class="container">
            <div class="footer-content">
                <div class="footer-section about">
                    <h3>Club Atlético Villa Canto</h3>
                    <p>Fomentando el amor por el fútbol en los más pequeños, con desarrollo personal y valores.</p>
                    <div class="contact-links">
                        <p><i class="fas fa-map-marker-alt"></i> ${clubAddress}</p>
                        <p><i class="fas fa-phone"></i> ${clubPhone}</p>
                        <p><i class="fas fa-envelope"></i> <a href="mailto:${clubEmail}">${clubEmail}</a></p>
                    </div>
                </div>
                <div class="footer-section links">
                    <h3>Enlaces Rápidos</h3>
                    <ul>
                        <li><a href="${basePath}index.html">Inicio</a></li>
                        <li><a href="${basePath}index.html#nuestro-club">Nuestro Club</a></li>
                        <li><a href="${basePath}index.html#noticias">Noticias</a></li>
                        <li><a href="${basePath}index.html#galeria">Galería</a></li>
                        <li><a href="${basePath}index.html#contacto">Contacto</a></li>
                        <li><a href="${basePath}editor.html" target="_blank">Editor (Admin)</a></li>
                    </ul>
                </div>
                <div class="footer-section categories">
                    <h3>Categorías</h3>
                    <ul>
                        ${(allData.categories || []).map(cat => `
                            <li><a href="${basePath}categorias/${cat.id}.html">${cat.name}</a></li>
                        `).join('')}
                    </ul>
                </div>
                <div class="footer-section social">
                    <h3>Síguenos</h3>
                    ${allData.club?.socialLinks?.instagram ? `<a href="${allData.club.socialLinks.instagram}" target="_blank"><i class="fab fa-instagram"></i> Instagram</a>` : ''}
                    ${allData.club?.socialLinks?.facebook ? `<a href="${allData.club.socialLinks.facebook}" target="_blank"><i class="fab fa-facebook-f"></i> Facebook</a>` : ''}
                    ${allData.club?.socialLinks?.youtube ? `<a href="${allData.club.socialLinks.youtube}" target="_blank"><i class="fab fa-youtube"></i> YouTube</a>` : ''}
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Club Atlético Villa Canto. Todos los derechos reservados.</p>
            </div>
        </div>
    `;
}
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
        if (!isCategoryPage && (path.endsWith('index.html') || path === '/' || path === '/index.html')) {
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
                                            <p>Asegúrate de que 'data.json' existe en la raíz del sitio y no tiene errores de sintaxis.</p>
                                        </section>`;
        }
    }
}

// --- Funciones de Renderizado ---

// Función para renderizar el encabezado y la navegación
function renderHeaderNav(isCategoryPage) {
    const header = document.querySelector('header');
    if (!header) return;

    // Determinar la ruta base para enlaces de navegación (ej. para index.html, contacto.html)
    // Esto es necesario porque las páginas de categoría están en una subcarpeta
    const basePath = isCategoryPage ? '../' : '';

    // Acceder a la información del club desde allData.club
    const clubName = allData.club?.name || 'Club Atlético';
    let clubLogoSrc = allData.club?.logo;

    // Lógica mejorada para la ruta del logo:
    // Si el logo no está definido en data.json, o si la ruta es relativa (no empieza con '/' o 'http'),
    // forzamos la ruta a ser absoluta desde la raíz del sitio (/images/logo.png).
    // Esto asegura que el logo se cargue correctamente en todas las páginas.
    if (!clubLogoSrc || (!clubLogoSrc.startsWith('http://') && !clubLogoSrc.startsWith('https://') && !clubLogoSrc.startsWith('/'))) {
        clubLogoSrc = '/images/logo.png';
    }

    header.innerHTML = `
        <div class="logo">
            <img src="${clubLogoSrc}" alt="Logo de ${clubName}" onerror="this.onerror=null;this.src='/images/logo.png';">
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
    if (categoriasDropdown && allData.categories) {
        allData.categories.forEach(categoria => {
            const link = document.createElement('a');
            link.href = `${basePath}categorias/${categoria.id}.html`;
            link.textContent = categoria.name;
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
    // Si no hay sección hero en el HTML O no hay datos de hero en data.json, salimos.
    // Esto es crucial para que si no hay 'hero' en data.json, la sección no se intente renderizar.
    if (!heroSection || !allData.hero) return;

    // Usamos la imagen del banner desde data.json, con un fallback robusto
    const bannerImageUrl = allData.hero.bannerImage || '/images/banner_default.jpg'; // Usar una imagen por defecto si no se especifica

    heroSection.innerHTML = `
        <img src="${bannerImageUrl}"
             alt="${allData.hero.titulo || 'Banner del Club'}"
             class="hero-banner"
             onerror="this.onerror=null; this.src='/images/banner_default.jpg';"> <div class="hero-content">
            <h2>${allData.hero.titulo || 'Bienvenido al Club'}</h2>
            <p>${allData.hero.subtitulo || 'Pasión por el Baby Fútbol'}</p>
            <a href="${allData.hero.botonLink || '#nuestro-club'}" class="btn-hero">${allData.hero.botonTexto || 'Saber más'}</a>
        </div>
    `;
}

function renderNuestroClub() {
    const nuestroClubSection = document.getElementById('nuestro-club');
    // Acceso a allData.club
    if (!nuestroClubSection || !allData.club) return;

    // Limpiar el contenido existente para evitar duplicados si se llama varias veces
    nuestroClubSection.innerHTML = '';

    // Modificamos la estructura para los valores
    const clubInfoGrid = `
        <div class="club-info-grid">
            <div class="info-item">
                <h3>Historia</h3>
                <p>${allData.club.history || 'No hay historia disponible.'}</p>
            </div>
            <div class="info-item values-section-container">
                <h3>Valores</h3>
                <div class="values-grid">
                    ${(allData.club.values || []).map(valor => `
                        <div class="value-card">
                            <i class="${getIconForValue(valor)}"></i>
                            <p>${valor}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="info-item">
                <h3>Instalaciones</h3>
                <p>${allData.club.facilities || 'No hay información de instalaciones disponible.'}</p>
            </div>
        </div>
    `;

    nuestroClubSection.innerHTML = `
        <div class="container">
            <h2>Nuestro Club</h2>
            ${clubInfoGrid}
        </div>
    `;
}

// Nueva función auxiliar para obtener un icono basado en el valor
function getIconForValue(valueText) {
    const lowerCaseValue = valueText.toLowerCase();
    if (lowerCaseValue.includes('juego limpio') || lowerCaseValue.includes('respeto')) {
        return 'fas fa-handshake'; // Un icono de apretón de manos para juego limpio/respeto
    } else if (lowerCaseValue.includes('compañerismo') || lowerCaseValue.includes('equipo')) {
        return 'fas fa-users'; // Icono de grupo de personas
    } else if (lowerCaseValue.includes('esfuerzo') || lowerCaseValue.includes('perseverancia')) {
        return 'fas fa-running'; // Icono de una persona corriendo
    } else if (lowerCaseValue.includes('alegría') || lowerCaseValue.includes('diversión')) {
        return 'fas fa-grin-beam'; // Icono de cara sonriente
    }
    // Icono por defecto si no coincide con ninguno
    return 'fas fa-star';
}

function renderNoticias() {
    const noticiasSection = document.getElementById('noticias');
    if (!noticiasSection) return; // Salir si la sección no existe

    // Limpiar el contenido existente para evitar duplicados si se llama varias veces
    noticiasSection.innerHTML = '';

    const containerDiv = document.createElement('div');
    containerDiv.classList.add('container');

    const h2Title = document.createElement('h2');
    h2Title.textContent = 'ÚLTIMAS NOTICIAS';
    containerDiv.appendChild(h2Title);

    const newsGridDiv = document.createElement('div');
    newsGridDiv.classList.add('news-grid');

    if (allData.news && allData.news.length > 0) {
        // Ordenar noticias por fecha, la más reciente primero (opcional, pero buena práctica)
        const sortedNews = [...allData.news].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        // Mostrar solo las primeras 3 noticias, o menos si hay menos de 3
        sortedNews.slice(0, 3).forEach(noticia => {
            const newsCard = document.createElement('div');
            newsCard.classList.add('news-card');

            // Contenedor del contenido (texto y botón) para mejor control con flexbox
            const cardContent = document.createElement('div');
            cardContent.classList.add('card-content');

            const h3Title = document.createElement('h3');
            h3Title.textContent = noticia.titulo;
            cardContent.appendChild(h3Title); // Añadir título al cardContent

            const newsDate = document.createElement('p');
            newsDate.classList.add('news-date');
            // Formatear la fecha
            newsDate.textContent = `Publicado: ${new Date(noticia.fecha).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}`;
            cardContent.appendChild(newsDate); // Añadir fecha al cardContent

            // Aquí se añade la imagen DESPUÉS del título y la fecha, pero ANTES del párrafo
            if (noticia.imagen) {
                const img = document.createElement('img');
                img.src = noticia.imagen;
                img.alt = noticia.titulo;
                img.onerror = function() { // Fallback para imágenes de noticias
                    this.onerror = null;
                    this.src = 'https://via.placeholder.com/300x200?text=Noticia';
                };
                cardContent.appendChild(img); // Ahora la imagen va DENTRO del cardContent
            }

            const pContent = document.createElement('p');
            pContent.textContent = noticia.contenido.substring(0, 150) + '...'; // Mostrar solo una parte del contenido
            cardContent.appendChild(pContent); // Añadir contenido al cardContent

            const readMoreLink = document.createElement('a');
            readMoreLink.href = `#`; // Puedes enlazar a una página de detalle de noticia si la creas
            readMoreLink.classList.add('read-more');
            readMoreLink.textContent = 'Leer más';
            cardContent.appendChild(readMoreLink); // Añadir botón al cardContent

            newsCard.appendChild(cardContent); // Añadir el cardContent completo a newsCard
            newsGridDiv.appendChild(newsCard);
        });
    } else {
        newsGridDiv.innerHTML = '<p class="no-data-message">No hay noticias disponibles en este momento.</p>';
    }

    const viewAllButtonDiv = document.createElement('div');
    viewAllButtonDiv.classList.add('text-center', 'mt-4'); // Centra el botón
    const viewAllLink = document.createElement('a');
    viewAllLink.href = '#'; // Cambia esto si tienes una página de todas las noticias
    viewAllLink.classList.add('btn');
    viewAllLink.textContent = 'Ver todas las noticias';
    viewAllButtonDiv.appendChild(viewAllLink);

    containerDiv.appendChild(newsGridDiv);
    containerDiv.appendChild(viewAllButtonDiv);
    noticiasSection.appendChild(containerDiv);
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
                <img src="${item.imagen}" alt="${item.titulo}" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible';">
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
                    ${allData.club.socialLinks?.facebook && allData.club.socialLinks.facebook !== '#' ? `<a href="${allData.club.socialLinks.facebook}" target="_blank"><i class="fab fa-facebook-f"></i></a>` : ''}
                    ${allData.club.socialLinks?.instagram && allData.club.socialLinks.instagram !== '#' ? `<a href="${allData.club.socialLinks.instagram}" target="_blank"><i class="fab fa-instagram"></i></a>` : ''}
                    ${allData.club.socialLinks?.youtube && allData.club.socialLinks.youtube !== '#' ? `<a href="${allData.club.socialLinks.youtube}" target="_blank"><i class="fab fa-youtube"></i></a>` : ''}
                </div>
                <div class="map-container">
                    ${allData.club.contact?.mapIframe || '<p>Mapa no disponible.</p>'}
                </div>
            </div>
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
    document.title = `${category.name} - Club Atlético Villa Canto`;

    // Inyectar el nombre y descripción en los elementos correspondientes
    const categoryNameElement = categoryDetailSection.querySelector('#category-name');
    const categoryGroupPhotoElement = categoryDetailSection.querySelector('#category-group-photo');
    const categoryDescriptionElement = categoryDetailSection.querySelector('#category-description');
    const playersGridElement = categoryDetailSection.querySelector('#players-grid');
    const fixtureTableElement = categoryDetailSection.querySelector('#fixture-table');

    if (categoryNameElement) {
        categoryNameElement.textContent = category.name;
    }
    if (categoryGroupPhotoElement) {
        categoryGroupPhotoElement.src = category.photo;
        categoryGroupPhotoElement.alt = `Foto grupal de ${category.name}`;
        categoryGroupPhotoElement.onerror = function() {
            this.onerror = null;
            this.src = 'https://via.placeholder.com/600x400?text=Foto+de+equipo+no+disponible';
        };
    }
    if (categoryDescriptionElement) {
        categoryDescriptionElement.textContent = category.description;
    }

    // Renderizar jugadores
    if (playersGridElement) {
        if (category.players && category.players.length > 0) {
            playersGridElement.innerHTML = '';
            category.players.forEach(jugador => {
                const playerCard = document.createElement('div');
                playerCard.classList.add('player-card');
                playerCard.innerHTML = `
                    <img src="${jugador.imagen}" alt="Foto de ${jugador.nombre}" class="player-photo" onerror="this.onerror=null;this.src='https://via.placeholder.com/250x250?text=Jugador+no+disponible';">
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
                    ${allData.club?.socialLinks?.instagram && allData.club.socialLinks.instagram !== '#' ? `<a href="${allData.club.socialLinks.instagram}" target="_blank"><i class="fab fa-instagram"></i> Instagram</a>` : ''}
                    ${allData.club?.socialLinks?.facebook && allData.club.socialLinks.facebook !== '#' ? `<a href="${allData.club.socialLinks.facebook}" target="_blank"><i class="fab fa-facebook-f"></i> Facebook</a>` : ''}
                    ${allData.club?.socialLinks?.youtube && allData.club.socialLinks.youtube !== '#' ? `<a href="${allData.club.socialLinks.youtube}" target="_blank"><i class="fab fa-youtube"></i> YouTube</a>` : ''}
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Club Atlético Villa Canto. Todos los derechos reservados.</p>
            </div>
        </div>
    `;
}

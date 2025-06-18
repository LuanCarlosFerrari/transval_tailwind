// Função para injetar estilos CSS dinamicamente
function injectStyles(css, id) {
    // Verifica se o estilo já foi injetado
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
}

// Injetar estilos específicos para animações de fadeIn
injectStyles(`
    @keyframes fadeIn {
        0% {
            opacity: 0;
            transform: translateY(20px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-fadeIn {
        animation: fadeIn 1s ease-out forwards;
    }
`, 'fadeIn-styles');

const baseUrl = window.location.hostname === 'luancarlosferrari.github.io'
    ? '/transval-intranet-New'
    : '';

// Conteúdo sobre a empresa
const aboutContent = {
    _eventsData: [
        { year: "1987", title: "Fundação", details: "Criação da empresa familiar por Onevaldo e Valmir, em Rinópolis – SP.", bgColor: "bg-white", textColor: "text-blue-950", yearColor: "text-blue-600", dotColor: "bg-blue-600", contentAbove: true, detailsColor: "text-blue-950", icon: "fas fa-flag", iconColor: "text-blue-950" },
        { year: "2000", title: "Unidade Rondonópolis", details: "Abertura da unidade em Rondonópolis – MT para apoiar nossa operação no Centro-Oeste.", bgColor: "bg-blue-200", textColor: "text-blue-950", yearColor: "text-blue-700", dotColor: "bg-blue-400", titleColor: "text-blue-950", contentAbove: false, detailsColor: "text-blue-950", icon: "fas fa-map-marker-alt", iconColor: "text-blue-950" },
        { year: "2005", title: "Expansão da Frota própria", details: "Consolidação de frota própria, garantindo agilidade, controle e segurança.", bgColor: "bg-white", textColor: "text-blue-950", yearColor: "text-blue-600", dotColor: "bg-blue-600", contentAbove: true, detailsColor: "text-blue-950", icon: "fas fa-truck", iconColor: "text-blue-950" },
        { year: "2014", title: "Agenciamento de Cargas", details: "Início do serviço de agenciamento, conectando soluções logísticas em todo o Brasil.", bgColor: "bg-blue-200", textColor: "text-blue-950", yearColor: "text-blue-700", dotColor: "bg-blue-400", titleColor: "text-blue-950", contentAbove: false, detailsColor: "text-blue-950", icon: "fas fa-handshake", iconColor: "text-blue-950" },
        { year: "2017", title: "Unidade Sumaré", details: "Implantação da unidade em Sumaré – SP, reforçando a presença no Sudeste.", bgColor: "bg-white", textColor: "text-blue-950", yearColor: "text-blue-600", dotColor: "bg-blue-600", contentAbove: true, detailsColor: "text-blue-950", icon: "fas fa-map-marker-alt", iconColor: "text-blue-950" },
        { year: "Hoje", title: "Excelência Contínua", details: "Seguimos evoluindo para oferecer as melhores soluções em transporte e logística.", bgColor: "bg-blue-200", textColor: "text-blue-950", yearColor: "text-blue-700", dotColor: "bg-blue-400", titleColor: "text-blue-950", contentAbove: false, detailsColor: "text-blue-950", icon: "fas fa-star", iconColor: "text-blue-950" }
    ],
    generateTimelineEventsHtml(isCarousel = true) {
        return this._eventsData.map((event, idx) => {
            const eventDetailsOuterClass = `${event.bgColor} p-3 rounded-lg shadow-lg mx-auto min-h-[160px]`;
            const eventDetailsInnerClass = isCarousel
                ? 'w-full'
                : 'sm:w-44 md:w-48';
            const titleClass = `text-md sm:text-lg font-semibold ${event.titleColor || event.textColor}`;
            const detailsPClass = `text-xs ${event.detailsColor || event.textColor} mt-1`;
            const yearPClass = `text-xl font-bold ${event.yearColor}`;
            const iconColorClass = event.iconColor || event.textColor;
            const iconHtml = event.icon ? `<i class="${event.icon} ${iconColorClass} text-2xl mb-2"></i><br>` : '';
            if (isCarousel) {
                return `
                    <div class="flex-shrink-0 w-full p-2 timeline-event-carousel-item">
                        <div class="${eventDetailsOuterClass} ${eventDetailsInnerClass} ${event.textColor} text-center">
                            ${iconHtml}
                            <h3 class="${titleClass}">${event.title}</h3>
                            <p class="${detailsPClass}">${event.details}</p>
                        </div>
                        <div class="mt-2 text-center">
                            <p class="${yearPClass}">${event.year}</p>
                        </div>
                    </div>
                `;
            } else {
                const dotHtml = `<div class="hidden sm:block w-4 h-4 ${event.dotColor} rounded-full mx-auto relative z-10 border-2 border-white my-2"></div>`;
                const yearHtml = `<div class="year-label ${event.contentAbove ? 'sm:mt-2' : 'sm:mb-2'}"><p class="${yearPClass}">${event.year}</p></div>`;
                const contentWrapper = `
                    <div class="sm:event-content-wrapper sm:relative ${event.contentAbove ? 'sm:mb-2 sm:pt-4' : 'sm:mt-2 sm:pb-4'}">
                        ${!event.contentAbove ? '<div class="hidden sm:block absolute top-0 left-1/2 w-px h-4 bg-blue-500 transform -translate-x-1/2 -translate-y-full"></div>' : ''}
                        <div class="${eventDetailsOuterClass} ${eventDetailsInnerClass} ${event.textColor} text-center">
                            ${iconHtml}
                            <h3 class="${titleClass}">${event.title}</h3>
                            <p class="${detailsPClass}">${event.details}</p>
                        </div>
                        ${event.contentAbove ? '<div class="hidden sm:block absolute bottom-0 left-1/2 w-px h-4 bg-blue-500 transform -translate-x-1/2 translate-y-full"></div>' : ''}
                    </div>
                `;
                const yearAndDot = idx % 2 === 0
                    ? dotHtml + yearHtml
                    : yearHtml + dotHtml;
                return `
                    <div class="flex-1 timeline-event-horizontal group sm:text-center">
                        ${event.contentAbove ? contentWrapper + yearAndDot : yearAndDot + contentWrapper}
                    </div>
                `;
            }
        }).join('');
    },
    get timelineHtml() {
        return `
        <div class="text-lg font-bold mb-8 text-center text-white">LINHA DO TEMPO:</div>
        <div class="container mx-auto px-2 py-4 sm:px-4">
            <div class="relative">
                <div class="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-blue-500 transform -translate-y-1/2"></div>
                <div id="timeline-carousel-container" class="sm:hidden relative overflow-hidden w-full group">
                    <div id="timeline-carousel-track" class="flex">
                        ${this.generateTimelineEventsHtml(true)}
                    </div>
                    <button id="prev-slide" aria-label="Anterior" class="absolute top-1/2 left-1 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full z-20 hover:bg-opacity-50 transition-opacity opacity-0 group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    </button>
                    <button id="next-slide" aria-label="Próximo" class="absolute top-1/2 right-1 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full z-20 hover:bg-opacity-50 transition-opacity opacity-0 group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </button>
                </div>
                <div id="desktop-timeline-events" class="hidden sm:flex sm:flex-row sm:justify-center items-stretch text-center relative sm:space-x-6 md:space-x-8">
                    ${this.generateTimelineEventsHtml(false)}
                </div>
            </div>
        </div>
        `;
    },
    get presentation() {
        return `
    <div class="flex flex-col items-center text-center">
        <p class="text-lg font-bold mb-2 text-white">NOSSA HISTÓRIA:</p>
        <p class="text-gray-300 mb-6 text-center">
            Desde 1987, construímos uma trajetória pautada na solidez e na evolução contínua.<br> Sediados em Rinópolis (SP), expandimos de forma estruturada, incorporando unidades operacionais em Rondonópolis (MT) e Sumaré (SP) <br> para aprimorar a cobertura nacional e otimizar o fluxo de cargas.<br><br> A constituição de frota própria e a oferta de serviços de agenciamento reforçam nosso controle sobre os processos logísticos, <br> assegurando maior agilidade, segurança e eficiência. <br> Guiados pelos valores que originaram a companhia, mantemos o propósito de oferecer soluções completas e personalizadas, <br> preservando a confiança de nossos clientes e o comprometimento com a excelência que norteia cada etapa de nossas operações.
        </p>
        <p class="text-lg font-bold mb-2 mt-8 text-white">NOSSO PROPÓSITO:</p>
        <p class="text-gray-300 mb-6 text-center">Ser um parceiro estratégico dos nossos clientes e transformar a logística nacional com soluções eficientes, transparentes e seguras. <br> Nosso compromisso é entregar qualidade, pontualidade e inovação, <br> atender às necessidades específicas de cada cliente e promover a sustentabilidade, <br> contribuindo ativamente para o avanço do agronegócio e da indústria.</p>
        <p class="text-lg font-bold mb-4 mt-10 text-center text-white">NOSSOS PRINCÍPIOS:</p>
        <div class="w-full max-w-5xl mx-auto px-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                <div class="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
                    <i class="fas fa-bullseye text-blue-500 text-3xl mb-3"></i>
                    <strong class="block text-lg font-semibold text-blue-600 mb-2">FOCO NO CLIENTE E NOS RESULTADOS</strong>
                    <span class="block text-gray-700 text-sm">Priorizar as necessidades dos clientes, buscando sempre entregar soluções ágeis, eficazes e com resultados positivos.</span>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
                    <i class="fas fa-shipping-fast text-blue-500 text-3xl mb-3"></i>
                    <strong class="block text-lg font-semibold text-blue-600 mb-2">AGILIDADE E RAPIDEZ</strong>
                    <span class="block text-gray-700 text-sm">Responder de forma célere e eficiente, reconhecendo a importância do tempo na construção de relações de sucesso.</span>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
                    <i class="fas fa-medal text-blue-500 text-3xl mb-3"></i>
                    <strong class="block text-lg font-semibold text-blue-600 mb-2">QUALIDADE E EXCELÊNCIA</strong>
                    <span class="block text-gray-700 text-sm">Garantir processos e entregas de alta qualidade, desenvolvendo com precisão o que foi proposto.</span>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
                    <i class="fas fa-shield-alt text-blue-500 text-3xl mb-3"></i>
                    <strong class="block text-lg font-semibold text-blue-600 mb-2">RESPONSABILIDADE E COMPROMISSO</strong>
                    <span class="block text-gray-700 text-sm">Assumir responsabilidades, agir com ética, transparência e dedicação em todas as ações e decisões.</span>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
                    <i class="fas fa-comments text-blue-500 text-3xl mb-3"></i>
                    <strong class="block text-lg font-semibold text-blue-600 mb-2">COMUNICAÇÃO E COLABORAÇÃO</strong>
                    <span class="block text-gray-700 text-sm">Promover integração entre as áreas, garantindo uma comunicação clara e eficaz para alcançar objetivos comuns.</span>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
                    <i class="fas fa-lock text-blue-500 text-3xl mb-3"></i>
                    <strong class="block text-lg font-semibold text-blue-600 mb-2">SEGURANÇA E CONFIABILIDADE</strong>
                    <span class="block text-gray-700 text-sm">Assegurar a execução segura de todas as atividades, conectando pessoas e negócios com confiança.</span>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center text-center sm:col-span-2 lg:col-span-1 lg:col-start-2 hover:shadow-xl transition-shadow duration-300">
                    <i class="fas fa-users text-blue-500 text-3xl mb-3"></i>
                    <strong class="block text-lg font-semibold text-blue-600 mb-2">TRABALHO EM EQUIPE E INTEGRAÇÃO</strong>
                    <span class="block text-gray-700 text-sm">Valorizar o espírito colaborativo, unindo esforços para superar desafios e alcançar metas com eficiência.</span>
                </div>
            </div>
        </div>
    </div>
    `;
    }
};

// Função para inicializar a apresentação
function initPresentation() {
    const timelineContainer = document.getElementById('timeline-container');
    if (timelineContainer) {
        timelineContainer.innerHTML = aboutContent.timelineHtml;
        // After inserting HTML, add event listeners for carousel
        const prevButton = document.getElementById('prev-slide');
        const nextButton = document.getElementById('next-slide');
        const track = document.getElementById('timeline-carousel-track');

        if (prevButton && nextButton && track) {
            let currentIndex = 0;

            const updateCarouselPosition = () => {
                const slides = Array.from(track.children);
                if (slides.length === 0) return;
                const slideWidth = slides[0].getBoundingClientRect().width;
                if (slideWidth === 0) return; // Or some other fallback
                track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
            };

            nextButton.addEventListener('click', () => {
                const slides = Array.from(track.children);
                const totalSlides = slides.length;
                if (totalSlides === 0) return;
                currentIndex = (currentIndex + 1) % totalSlides;
                updateCarouselPosition();
            });

            prevButton.addEventListener('click', () => {
                const slides = Array.from(track.children);
                const totalSlides = slides.length;
                if (totalSlides === 0) return;
                currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                updateCarouselPosition();
            });

            window.addEventListener('resize', updateCarouselPosition);
            // Initial call
            setTimeout(updateCarouselPosition, 100);
        }
    }

    const expandableContent = document.getElementById('expandable-transval-content');
    if (expandableContent) {
        expandableContent.innerHTML = aboutContent.presentation;
    }

    const toggleButton = document.getElementById('toggle-sobre-content');
    if (toggleButton && expandableContent) {
        toggleButton.addEventListener('click', () => {
            const isHidden = expandableContent.classList.contains('hidden');
            expandableContent.classList.toggle('hidden');
            toggleButton.textContent = isHidden ? 'Mostrar menos' : 'Leia mais sobre a Transval';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    function setupEventListeners() {
        const timelineCarouselContainer = document.getElementById('timeline-carousel-container');
        const timelineCarouselTrack = document.getElementById('timeline-carousel-track');
        const prevButton = document.getElementById('prev-slide');
        const nextButton = document.getElementById('next-slide');
        const desktopTimeline = document.getElementById('desktop-timeline-events');
        if (!timelineCarouselContainer || !timelineCarouselTrack || !prevButton || !nextButton || !desktopTimeline) {
            setTimeout(setupEventListeners, 200);
            return;
        }
        let currentIndex = 0;
        let items = [];
        let itemWidth = 0;
        let originalItemCount = 0;
        let totalVisibleItems = 0;
        let isCarouselActive = false;
        function setupCarouselSizingAndClones() {
            if (!timelineCarouselTrack || !timelineCarouselContainer) return false;
            if (originalItemCount > 0 && timelineCarouselTrack.children.length > originalItemCount) {
                while (timelineCarouselTrack.children.length > originalItemCount) {
                    timelineCarouselTrack.removeChild(timelineCarouselTrack.lastChild);
                }
            }
            items = Array.from(timelineCarouselTrack.children).filter(item => item.classList.contains('timeline-event-carousel-item'));
            originalItemCount = items.length;
            if (originalItemCount === 0) return false;
            items.forEach(item => {
                timelineCarouselTrack.appendChild(item.cloneNode(true));
            });
            items = Array.from(timelineCarouselTrack.children).filter(item => item.classList.contains('timeline-event-carousel-item'));
            totalVisibleItems = items.length;
            const containerWidth = timelineCarouselContainer.offsetWidth;
            if (containerWidth === 0) return false;
            itemWidth = containerWidth;
            items.forEach(item => {
                item.style.width = itemWidth + 'px';
            });
            return true;
        }
        function updateCarouselTransform(animate = true) {
            if (!timelineCarouselTrack) return;
            timelineCarouselTrack.style.transition = animate ? 'transform 0.5s ease-in-out' : 'none';
            timelineCarouselTrack.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
        }
        function initCarousel() {
            if (!timelineCarouselContainer || !prevButton || !nextButton || !timelineCarouselTrack) return;
            if (!setupCarouselSizingAndClones()) {
                setTimeout(initCarousel, 100);
                return;
            }
            currentIndex = 0;
            updateCarouselTransform(false);
            nextButton.onclick = () => {
                currentIndex++;
                updateCarouselTransform();
                if (currentIndex >= originalItemCount) {
                    setTimeout(() => {
                        currentIndex = currentIndex % originalItemCount;
                        updateCarouselTransform(false);
                    }, 500);
                }
            };
            prevButton.onclick = () => {
                if (currentIndex === 0) {
                    currentIndex = originalItemCount;
                    updateCarouselTransform(false);
                }
                requestAnimationFrame(() => {
                    currentIndex--;
                    updateCarouselTransform();
                });
            };
            isCarouselActive = true;
            if (timelineCarouselContainer) timelineCarouselContainer.classList.add('carousel-active');
        }
        function destroyCarousel() {
            if (!timelineCarouselContainer || !prevButton || !nextButton || !timelineCarouselTrack) return;
            prevButton.onclick = null;
            nextButton.onclick = null;
            if (originalItemCount > 0 && timelineCarouselTrack.children.length > originalItemCount) {
                while (timelineCarouselTrack.children.length > originalItemCount) {
                    timelineCarouselTrack.removeChild(timelineCarouselTrack.lastChild);
                }
            }
            items = Array.from(timelineCarouselTrack.children).filter(item => item.classList.contains('timeline-event-carousel-item'));
            items.forEach(item => item.style.width = '');
            timelineCarouselTrack.style.transform = 'translateX(0px)';
            timelineCarouselTrack.style.transition = 'none';
            originalItemCount = 0;
            isCarouselActive = false;
            if (timelineCarouselContainer) timelineCarouselContainer.classList.remove('carousel-active');
        }
        function handleCarouselLayout() {
            const isSmallScreen = window.innerWidth < 640;
            if (isSmallScreen) {
                if (timelineCarouselContainer) timelineCarouselContainer.style.display = 'block';
                if (desktopTimeline) desktopTimeline.style.display = 'none';
                if (!isCarouselActive) {
                    initCarousel();
                } else {
                    if (setupCarouselSizingAndClones()) {
                        currentIndex = currentIndex % originalItemCount;
                        updateCarouselTransform(false);
                    }
                }
            } else {
                if (timelineCarouselContainer) timelineCarouselContainer.style.display = 'none';
                if (desktopTimeline) desktopTimeline.style.display = 'flex';
                if (isCarouselActive) {
                    destroyCarousel();
                }
            }
        }
        handleCarouselLayout();
        window.addEventListener('resize', handleCarouselLayout);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupEventListeners);
    } else {
        setupEventListeners();
    }
});

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initPresentation);

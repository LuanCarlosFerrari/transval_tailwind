// Função para injetar estilos CSS dinamicamente
function injectStyles(css, id) {
    // Verifica se o estilo já foi injetado
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
}

// Injetar estilos específicos para animação de marquee
injectStyles(`
    @keyframes marquee {
        0% {
            transform: translateX(-5%);
        }
        100% {
            transform: translateX(-50%);
        }
    }

    .animate-marquee {
        animation: marquee 60s linear infinite;
        display: flex;
    }
`, 'marquee-styles');

const clientLogos = [
    'adufertil.png',
    'araguaia.png',
    'biosev.png',
    'caramuru.png',
    'cargill.png',
    'castrolanda.png',
    'cibra.png',
    'cofco.png',
    'copersucar.png',
    'cutrale.png',
    'fertipar.png',
    'heringer.png',
    'inpasa.png',
    'LDC.png',
    'lhgmining.png',
    'mosaic.png',
    'nutrien.png',
    'piracanjuba.png',
    'raizen.png',
    'Rumo-logistica-logo-clipart.png',
    'seara.png',
    'syngenta.png',
    'viterra.png',
    'yara.png',
    'ype.png'
];

// Função para gerar os cartões de clientes
function generateClientCards() {
    const marqueeContent = document.getElementById('marquee-content');
    if (!marqueeContent) {
        console.error('Marquee content element not found!');
        return;
    }

    marqueeContent.innerHTML = '';

    const createCard = (logo) => {
        const card = document.createElement('div');
        card.className = 'bg-white p-8 shadow rounded mx-2 inline-block min-w-[300px] min-h-[120px] flex items-center justify-center';
        const img = document.createElement('img');
        img.src = `Assets/clients/${logo}`;
        img.alt = `${logo.split('.')[0]} Logo`;
        img.className = 'max-h-24 max-w-[230px]';
        card.appendChild(img);
        return card;
    };

    clientLogos.forEach(logo => {
        marqueeContent.appendChild(createCard(logo));
    });    clientLogos.forEach(logo => {
        marqueeContent.appendChild(createCard(logo));
    });
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', generateClientCards);

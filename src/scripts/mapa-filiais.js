// Função para injetar estilos CSS dinamicamente
function injectStyles(css, id) {
    // Verifica se o estilo já foi injetado
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
}

// Injetar estilos específicos para controles do Leaflet
injectStyles(`
    .leaflet-control-container {
        z-index: 700 !important;
    }

    .leaflet-control-zoom {
        z-index: 700 !important;
    }
`, 'leaflet-styles');

// Função para inicializar o mapa de filiais
function initFiliaisMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || mapContainer._leaflet_id) return;

    const coverageFilters = document.querySelector('.coverage-filters');
    if (!coverageFilters) {
        const controls = document.createElement('div');
        controls.className = 'coverage-filters flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 mb-4 w-full sm:w-auto justify-center items-center px-4 sm:px-0';
        controls.setAttribute('role', 'group');
        controls.setAttribute('aria-label', 'Filtros de cobertura');
        const selectsConfig = [
            { id: 'regiao', label: 'Selecione a região', placeholder: 'Região' },
            { id: 'estado', label: 'Selecione o estado', placeholder: 'Estado' },
            { id: 'unidade', label: 'Selecione a unidade', placeholder: 'Unidade' }
        ];
        selectsConfig.forEach(config => {
            const select = document.createElement('select');
            select.id = config.id;
            select.className = 'w-full sm:w-auto p-2 border rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
            select.setAttribute('aria-label', config.label);
            select.innerHTML = `<option value="">${config.placeholder}</option>`;
            controls.appendChild(select);
        });
        mapContainer.parentNode.insertBefore(controls, mapContainer);
    }

    var filiais = [
        { lat: -23.1066, lng: -55.2250, title: 'Amambai-MS' },
        { lat: -16.3266, lng: -48.9534, title: 'Anápolis-GO' },
        { lat: -21.2088, lng: -50.4278, title: 'Araçatuba-SP' },
        { lat: -19.5908, lng: -46.9408, title: 'Araxá-MG' },
        { lat: -20.2836, lng: -45.5419, title: 'Arcos-MG' },
        { lat: -18.6464, lng: -48.1933, title: 'Araguari-MG' },
        { lat: -24.1458, lng: -49.9458, title: 'Arapoti-PR' },
        { lat: -14.0497, lng: -52.1597, title: 'Água Boa-MT' },
        { lat: -23.9380, lng: -54.1680, title: 'Mundo Novo-MS' },
        { lat: -14.4088, lng: -56.4388, title: 'Diamantino-MT' },
        { lat: -22.2208, lng: -54.8058, title: 'Dourados-MS' },
        { lat: -15.5399, lng: -47.3333, title: 'Formosa-GO' },
        { lat: -16.6868, lng: -49.2647, title: 'Goiânia-GO' },
        { lat: -10.6438, lng: -51.5694, title: 'Confresa-MT' },
        { lat: -15.6013, lng: -56.0983, title: 'Cuiabá-MT' },
        { lat: -23.8911, lng: -46.4175, title: 'Cubatão-SP' },
        { lat: -13.6788, lng: -57.8902, title: 'Campo Novo do Parecis-MT' },
        { lat: -20.4697, lng: -54.6208, title: 'Campo Grande-MS' },
        { lat: -15.5458, lng: -55.1666, title: 'Campo Verde-MT' },
        { lat: -13.5505, lng: -52.2705, title: 'Canarana-MT' },
        { lat: -18.1661, lng: -47.9445, title: 'Catalão-GO' },
        { lat: -18.4072, lng: -52.5999, title: 'Chapadão do Céu-GO' },
        { lat: -18.7908, lng: -52.5908, title: 'Chapadão do Sul-MS' },
        { lat: -8.0586, lng: -48.4783, title: 'Colinas do Tocantins-TO' },
        { lat: -7.5322, lng: -46.0369, title: 'Balsas-MA' },
        { lat: -22.2944, lng: -54.1822, title: 'Batayporã-MS' },
        { lat: -1.5147, lng: -48.6197, title: 'Barcarena-PA' },
        { lat: -15.8905, lng: -52.2643, title: 'Barra do Garças-MT' },
        { lat: -16.3566, lng: -46.9083, title: 'Unaí-MG' },
        { lat: -14.7194, lng: -56.3291, title: 'Nobres-MT' },
        { lat: -13.8319, lng: -56.0752, title: 'Nova Mutum-MT' },
        { lat: -13.8300, lng: -56.0741, title: 'Nova Mutum Transbordo-MT' },
        { lat: -22.9788, lng: -49.8708, title: 'Ourinhos-SP' },
        { lat: -21.1311, lng: -48.9163, title: 'Catanduva-SP' },
        { lat: -17.4436, lng: -51.1036, title: 'Montividiu-GO' },
        { lat: -21.6138, lng: -55.1688, title: 'Maracaju-MS' },
        { lat: -23.4250, lng: -51.9386, title: 'Maringá-PR' },
        { lat: -10.1558, lng: -54.9467, title: 'Matupá-MT' },
        { lat: -4.2905, lng: -55.9527, title: 'Miritituba-PA' },
        { lat: -2.9980, lng: -47.3533, title: 'Paragominas-PA' },
        { lat: -17.2252, lng: -46.8744, title: 'Paracatu-MG' },
        { lat: -25.5177, lng: -48.5094, title: 'Paranaguá-PR' },
        { lat: -18.5793, lng: -46.5180, title: 'Patos de Minas-MG' },
        { lat: -22.7555, lng: -47.1247, title: 'Paulínia-SP' },
        { lat: -22.5361, lng: -55.7252, title: 'Ponta Porã-MS' },
        { lat: -15.5583, lng: -54.2819, title: 'Primavera do Leste-MT' },
        { lat: -12.5883, lng: -52.1827, title: 'Querência-MT' },
        { lat: -21.7147, lng: -50.7233, title: 'Rinópolis-SP' },
        { lat: -21.1766, lng: -47.8208, title: 'Ribeirão Preto-SP' },
        { lat: -16.4677, lng: -54.6355, title: 'Rondonópolis-MT' },
        { lat: -17.7988, lng: -50.9219, title: 'Rio Verde-GO' },
        { lat: -13.5402, lng: -58.8147, title: 'Sapezal-MT' },
        { lat: -2.4427, lng: -54.7093, title: 'Santarém-PA' },
        { lat: -2.5297, lng: -44.2966, title: 'São Luís-MA' },
        { lat: -19.3938, lng: -54.1880, title: 'São Gabriel do Oeste-MS' },
        { lat: -26.2427, lng: -48.6383, title: 'São Francisco do Sul-SC' },
        { lat: -20.4830, lng: -54.6147, title: 'Sidrolândia-MS' },
        { lat: -11.8605, lng: -55.5097, title: 'Sinop-MT' },
        { lat: -11.8583, lng: -55.5083, title: 'Sinop Transbordo-MT' },
        { lat: -11.8605, lng: -55.5097, title: 'Sinop Fertilizante-MT' },
        { lat: -12.5458, lng: -55.7208, title: 'Sorriso-MT' },
        { lat: -12.5458, lng: -55.7208, title: 'Sorriso Transbordo-MT' },
        { lat: -14.6230, lng: -57.4855, title: 'Tangará da Serra-MT' },
        { lat: -18.9166, lng: -48.2833, title: 'Uberlândia-MG' },
        { lat: -19.7488, lng: -47.9369, title: 'Uberaba-MG' },
        { lat: -14.5252, lng: -49.1453, title: 'Uruaçu-GO' },
        { lat: -21.7977, lng: -50.8816, title: 'Osvaldo Cruz-SP' },
        { lat: -12.7461, lng: -60.1297, title: 'Vilhena-RO' },
        { lat: -16.7405, lng: -48.5155, title: 'Vianópolis-GO' }
    ];

    const regioes = {
        'Norte': ['RO', 'AC', 'AM', 'RR', 'PA', 'AP', 'TO'],
        'Nordeste': ['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'],
        'Centro-Oeste': ['MT', 'MS', 'GO', 'DF'],
        'Sudeste': ['SP', 'RJ', 'MG', 'ES'],
        'Sul': ['PR', 'SC', 'RS']
    };
    function getEstadoFromTitle(title) {
        const match = title.match(/-([A-Z]{2})$/);
        return match ? match[1] : '';
    }
    function getRegiaoFromEstado(uf) {
        for (const reg in regioes) {
            if (regioes[reg].includes(uf)) return reg;
        }
        return '';
    }

    const estadosSet = new Set();
    const regioesSet = new Set();
    filiais.forEach(f => {
        const uf = getEstadoFromTitle(f.title);
        estadosSet.add(uf);
        regioesSet.add(getRegiaoFromEstado(uf));
    }); const filtroRegiao = document.getElementById('regiao');
    const filtroEstado = document.getElementById('estado');
    const filtroUnidade = document.getElementById('unidade');
    regioesSet.forEach(r => {
        if (r) filtroRegiao.innerHTML += `<option value="${r}">${r}</option>`;
    });
    Array.from(estadosSet).sort().forEach(uf => {
        if (uf) filtroEstado.innerHTML += `<option value="${uf}">${uf}</option>`;
    });
    filiais.forEach(f => {
        filtroUnidade.innerHTML += `<option value="${f.title}">${f.title}</option>`;
    });

    var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([-15.793889, -47.882778], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    }).addTo(map);

    var markerClusterGroup = window.L && L.markerClusterGroup ? L.markerClusterGroup() : null;
    var markers = [];

    function createPopupContent(filial) {
        return `<div class="p-2 bg-white rounded shadow-lg">
                    <strong class="text-lg font-semibold text-gray-800">${filial.title}</strong><br>
                    <span class="text-sm text-gray-600">Lat: ${filial.lat.toFixed(4)}, Lng: ${filial.lng.toFixed(4)}</span>
                </div>`;
    }

    function renderMarkers(filiaisFiltradas) {
        if (markerClusterGroup) markerClusterGroup.clearLayers();
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        (markerClusterGroup ? markerClusterGroup : map).eachLayer(function (layer) {
            if (layer instanceof L.Marker) map.removeLayer(layer);
        });
        filiaisFiltradas.forEach(f => {
            const marker = L.marker([f.lat, f.lng]);
            marker.bindPopup(createPopupContent(f));
            marker.on('click', function () {
                map.setView([f.lat, f.lng], 12);
            });
            if (markerClusterGroup) markerClusterGroup.addLayer(marker);
            else marker.addTo(map);
            markers.push(marker);
        });
        if (markerClusterGroup && !map.hasLayer(markerClusterGroup)) map.addLayer(markerClusterGroup);
    }

    function filtrar() {
        const regiao = filtroRegiao.value;
        const estado = filtroEstado.value;
        const unidade = filtroUnidade.value;
        let filtradas = filiais;
        if (regiao) {
            filtradas = filtradas.filter(f => getRegiaoFromEstado(getEstadoFromTitle(f.title)) === regiao);
        }
        if (estado) {
            filtradas = filtradas.filter(f => getEstadoFromTitle(f.title) === estado);
        }
        if (unidade) {
            filtradas = filtradas.filter(f => f.title === unidade);
        }
        renderMarkers(filtradas);
        if (unidade && filtradas.length === 1) {
            const f = filtradas[0];
            map.setView([f.lat, f.lng], 10);
            setTimeout(() => {
                markers[0].openPopup();
            }, 300);
        } else {
            ajustarVisualizacaoParaTodosMarcadores();
        }
    }
    filtroRegiao.addEventListener('change', function () {
        filtroEstado.value = '';
        filtroUnidade.value = '';
        filtrar();
    });
    filtroEstado.addEventListener('change', function () {
        filtroRegiao.value = '';
        filtroUnidade.value = '';
        filtrar();
    });
    filtroUnidade.addEventListener('change', function () {
        filtroRegiao.value = '';
        filtroEstado.value = '';
        filtrar();
    });
    function ajustarVisualizacaoParaTodosMarcadores() {
        if (filiais.length === 0) return;
        var bounds = L.latLngBounds();
        filiais.forEach(function (filial) {
            bounds.extend([filial.lat, filial.lng]);
        });
        map.fitBounds(bounds, {
            padding: [30, 30],
            maxZoom: 12
        });
    }
    renderMarkers(filiais);
    setTimeout(function () {
        ajustarVisualizacaoParaTodosMarcadores();
    }, 300);
}

document.addEventListener('DOMContentLoaded', function () {
    if (typeof initFiliaisMap === 'function') {
        initFiliaisMap();
    }
});

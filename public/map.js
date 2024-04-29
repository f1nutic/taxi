ymaps.ready(init);
function init(){
    let myMap = new ymaps.Map("map", {
        center: [48.480205, 135.071913], // Координаты центра карты
        zoom: 15,
        controls: []
    });

    // Создадим элемент управления "Пробки".
    let trafficControl = new ymaps.control.TrafficControl({ state: {
            // Отображаются пробки "Сейчас".
            providerKey: 'traffic#actual',
            // Начинаем сразу показывать пробки на карте.
            trafficShown: false
        }});
    // Добавим контрол на карту.
    myMap.controls.add(trafficControl);
    // Получим ссылку на провайдер пробок "Сейчас" и включим показ инфоточек.
    trafficControl.getProvider('traffic#actual').state.set('infoLayerShown', true);

    let suggestBounds = [
        [48.316666, 134.892578], // Юго-западный угол области Хабаровска
        [48.633333, 135.186767]  // Северо-восточный угол области Хабаровска
    ];

    let suggestOptions = {
        boundedBy: suggestBounds,  // Ограничение области поиска
        strictBounds: true,        // Не показывать результаты вне ограниченной области
        provider: {
            searchCoordOrder: "latlong"
        }
    };

    let suggestStart = new ymaps.SuggestView('startPoint');
    let suggestEnd = new ymaps.SuggestView('endPoint');

    document.getElementById('startPoint').addEventListener('input', function() {
        geocode(this.value, 'start');
    });

    document.getElementById('endPoint').addEventListener('input', function() {
        geocode(this.value, 'end');
    });

    function geocode(address, type) {
        ymaps.geocode(address).then(function(res) {
            let obj = res.geoObjects.get(0);
            if (obj) {
                showResult(obj, type);
            } else {
                showError("Адрес не найден", type);
            }
        });
    }

    function showResult(obj, type) {
        let mapContainer = $('#map'),
            bounds = obj.properties.get('boundedBy'),
            mapState = ymaps.util.bounds.getCenterAndZoom(bounds, [mapContainer.width(), mapContainer.height()]),
            address = obj.getAddressLine();

        if (type === 'start') {
            // Действия для начальной точки
            createOrUpdatePlacemark(mapState, address, 'start');
        } else {
            // Действия для конечной точки
            createOrUpdatePlacemark(mapState, address, 'end');
        }

    }

    function showError(message, type) {
        if (type === 'start') {
            $('#startPoint').addClass('input_error');
        } else {
            $('#endPoint').addClass('input_error');
        }
        console.error(message);
    }

    function createOrUpdatePlacemark(state, caption, type) {
        if (type === 'start') {
            if (!window.startPlacemark) {
                window.startPlacemark = new ymaps.Placemark(state.center, {
                    balloonContent: caption
                }, {
                    preset: 'islands#greenDotIconWithCaption'
                });
                myMap.geoObjects.add(window.startPlacemark);
            } else {
                window.startPlacemark.geometry.setCoordinates(state.center);
                window.startPlacemark.properties.set('balloonContent', caption);
            }
        } else {
            if (!window.endPlacemark) {
                window.endPlacemark = new ymaps.Placemark(state.center, {
                    balloonContent: caption
                }, {
                    preset: 'islands#redDotIconWithCaption'
                });
                myMap.geoObjects.add(window.endPlacemark);
            } else {
                window.endPlacemark.geometry.setCoordinates(state.center);
                window.endPlacemark.properties.set('balloonContent', caption);
            }
        }
        myMap.setCenter(state.center, state.zoom);
    }
}
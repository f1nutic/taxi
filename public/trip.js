ymaps.ready(init);

function init() {
    let myMap = new ymaps.Map('map', {
        center: [48.480205, 135.071913],
        zoom: 15,
        controls: [],
    },{
        yandexMapDisablePoiInteractivity: true
    });

    routeData = JSON.parse(routeData);

    console.log(routeData);
    console.log(routeData.path);

    if (routeData && routeData.path) {
        let polyline = new ymaps.Polyline(routeData.path[0], {}, {
            strokeColor: "#0000FF",
            strokeWidth: 4,
            strokeOpacity: 0.5
        });

        myMap.geoObjects.add(polyline);
        myMap.setBounds(polyline.geometry.getBounds());

        // Добавление меток на начало и конец маршрута
        if (routeData.points && routeData.points.length > 1) {
            let startPlacemark = new ymaps.Placemark(routeData.path[0][0], {
                balloonContent: 'Начальная точка маршрута'
            }, {
                preset: 'islands#greenDotIcon'
            });

            let endPlacemark = new ymaps.Placemark(routeData.path[0][(routeData.path[0].length)-1], {
                balloonContent: 'Конечная точка маршрута'
            }, {
                preset: 'islands#redDotIcon'
            });

            myMap.geoObjects.add(startPlacemark);
            myMap.geoObjects.add(endPlacemark);
        }
    } else {
        console.error('Ошибка: Данные маршрута не загружены или path не определен.');
    }
}

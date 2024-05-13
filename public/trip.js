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

    if (routeData && routeData.path) {
        let polyline = new ymaps.Polyline(routeData.path[0], {}, {
            strokeColor: "#9333ea",
            strokeWidth: 4,
            strokeOpacity: 0.8
        });

        myMap.geoObjects.add(polyline);
        myMap.setBounds(polyline.geometry.getBounds());

        // Добавление меток на начало и конец маршрута
        if (routeData.points && routeData.points.length > 1) {
            let startPlacemark = new ymaps.Placemark(routeData.path[0][0], {
                balloonContent: startPoint,
                iconContent: '1'
            }, {
                preset: 'islands#violetIcon'
            });

            let endPlacemark = new ymaps.Placemark(routeData.path[0][(routeData.path[0].length)-1], {
                balloonContent: endPoint,
                iconContent: '2'
            }, {
                preset: 'islands#orangeIcon',
            });

            myMap.geoObjects.add(startPlacemark);
            myMap.geoObjects.add(endPlacemark);
        }
    } else {
        window.showNotification('Данные о маршруте не найдены.', 'fail');
    }
}

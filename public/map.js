ymaps.ready(init);

function init() {
    let myMap = new ymaps.Map('map', {
        center: [48.480205, 135.071913],
        zoom: 15,
        controls: [],
    })

    let startPlacemark;
    let endPlacemark;
    let currentRoute;

    clearAllControls();

    // Границы ХБК
    let boundsKHV = [
        [48.316666, 134.892578],
        [48.633333, 135.186767]
    ];

    // Выпадающий список для адресов
    let suggestViewPointStart = new ymaps.SuggestView('startPoint', {
        results: 3,
        boundedBy: boundsKHV,
    });

    let suggestViewPointEnd = new ymaps.SuggestView('endPoint', {
        results: 3,
        boundedBy: boundsKHV,
    });


    // Обраюотчик catch
    // document.querySelector('#startPoint').addEventListener('change', function (e) {
    //     geocode(document.querySelector('#startPoint').value, true).then(function(coords) {
    //         console.log("Координаты (н):", coords);
    //         // startPoint = [...coords];
    //     }).catch(function(error) {
    //         console.error("Произошла ошибка при геокодировании:", error);
    //     })
    // });

    document.querySelector('#startPoint').addEventListener('blur', function (e) {
        setTimeout(() => {
                geocode(document.querySelector('#startPoint').value, true);
        }, 300);
    });

    document.querySelector('#endPoint').addEventListener('blur', function (e) {
        setTimeout(() => {
                geocode(document.querySelector('#endPoint').value, false);
        }, 300);
    });

    document.querySelector('#route').addEventListener('click', function (e) {
        console.log('click');
        route();
    });

    document.querySelector('#removeControls').addEventListener('click', function (e) {
        clearAllControls();
    });


    function route() {
        removeRouteOnMap();

        ymaps.route([
            startPlacemark._geoObjectComponent._geometry._coordinates,
            endPlacemark._geoObjectComponent._geometry._coordinates
        ] , {
            reverseGeocoding: true,
            routingMode: 'auto',
            boundedBy: boundsKHV,
            mapStateAutoApply: true,
        }).done(function (route) {
            currentRoute = route;
            route.options.set("mapStateAutoApply", true);
            myMap.geoObjects.add(route);
            document.querySelector('#duration').innerText = getTimeRoute(route.getHumanTime());
            document.querySelector('#distance').innerText = getDistanceRoute(route.getHumanLength());
        }, function (err) {
            throw err;
        }, this);
    }


    function geocode(address, isStart) {
        // Возвращаем промис напрямую из вызова ymaps.geocode
        return ymaps.geocode(address, {
            results: 1
        }).then(function (res) {
            // Выбор первого результата
            let firstGeoObject = res.geoObjects.get(0);
            let coords = firstGeoObject.geometry.getCoordinates(); // массив координат
            let bounds = firstGeoObject.properties.get('boundedBy'); // границы объекта для центрирования карты

            // Создание плейсмарка
            newPlacemark = new ymaps.Placemark(coords, {
                balloonContent: 'Адрес: ' + address,
            }, {
                preset: isStart ? 'islands#redDotIcon' : 'islands#blueDotIcon'
            });

            // Добавление метки на карту
            myMap.geoObjects.add(newPlacemark);

            // Удаление старой метки
            if (isStart) {
                if (startPlacemark) {
                    myMap.geoObjects.remove(startPlacemark);
                }
                startPlacemark = newPlacemark;
            }
            else if (!isStart) {
                if (endPlacemark) {
                    myMap.geoObjects.remove(endPlacemark);
                }
                endPlacemark = newPlacemark;
            }

            // Центрирование карты
            myMap.setBounds(bounds, {
                checkZoomRange: true
            });
        });
    }

    function removePlacemarkOnMap () {
        if (startPlacemark) {
            myMap.geoObjects.remove(startPlacemark);
        }
        if  (endPlacemark) {
            myMap.geoObjects.remove(endPlacemark);
        }
    }

    function removeRouteOnMap () {
        if (currentRoute) {
            myMap.geoObjects.remove(currentRoute);
        }
    }

    function getTimeRoute (time) {
        const minutes = parseInt(time);
        let label = 'минут';
        if (minutes % 10 === 1 && minutes % 100 !== 11) {
            label = 'минута';
        } else if ([2, 3, 4].includes(minutes % 10) && ![12, 13, 14].includes(minutes % 100)) {
            label = 'минуты';
        }

        return `${minutes} ${label}`;
    }

    function getDistanceRoute(distance) {
        const normalizedDistance = distance.replace(/&#160;/g, '\u00A0');
        const parts = normalizedDistance.split('\u00A0');
        const number = parseInt(parts[0], 10);
        const unit = parts[1];

        // Определяем правильное склонение
        let label = '';

        if (unit.startsWith('км')) { // Для километров
            if (number % 10 === 1 && number % 100 !== 11) {
                label = 'километр';
            } else if ([2, 3, 4].includes(number % 10) && ![12, 13, 14].includes(number % 100)) {
                label = 'километра';
            } else {
                label = 'километров';
            }
        } else if (unit.startsWith('м')) { // Для метров
            if (number % 10 === 1 && number % 100 !== 11) {
                label = 'метр';
            } else if ([2, 3, 4].includes(number % 10) && ![12, 13, 14].includes(number % 100)) {
                label = 'метра';
            } else {
                label = 'метров';
            }
        }

        return `${number} ${label}`;
    }

    function clearAllControls() {
        removeRouteOnMap();
        currentRoute = null;
        removePlacemarkOnMap();
        startPlacemark = null;
        endPlacemark = null;
        document.querySelector('#startPoint').value = '';
        document.querySelector('#endPoint').value = '';
        document.querySelector('#duration').innerText = '';
        document.querySelector('#distance').innerText = '';
    }
}


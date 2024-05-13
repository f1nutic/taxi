ymaps.ready(init);

function init() {
    let myMap = new ymaps.Map('map', {
        center: [48.480205, 135.071913],
        zoom: 15,
        controls: [],
    },{
        yandexMapDisablePoiInteractivity: true
    });

    let actualProvider = new ymaps.traffic.provider.Actual();
    actualProvider.setMap(myMap);

    let startPlacemark;
    let startPoint;
    let endPlacemark;
    let endPoint;
    let currentRoute;
    let timeInMIN;
    let distanceInKM;
    let distanceRoute;
    let costRoute;
    let trafficScore;
    let startPointSelected = false;
    let endPointSelected = false;

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
        strictBounds: true,
    });
    let suggestViewPointEnd = new ymaps.SuggestView('endPoint', {
        results: 3,
        boundedBy: boundsKHV,
        strictBounds: true,
    });

    suggestViewPointStart.events.add('select',function () {
        geocode(document.querySelector('#startPoint').value, true);
        startPointSelected = true;
    });

    suggestViewPointEnd.events.add('select', function () {
        geocode(document.querySelector('#endPoint').value, false);
        endPointSelected = true;
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

    document.querySelector('#startPoint').addEventListener('input', function() {
        startPointSelected = false;
    });

    document.querySelector('#endPoint').addEventListener('input', function() {
        endPointSelected = false;
    });

    document.querySelector('#route').addEventListener('click', function (e) {
        if (!(placeMarksHasData() && placeMarksSelected())) {
            window.showNotification('Неккоректно выбран адрес', 'fail');
        }
        const routeData = extractRouteData(currentRoute); // данные маршрута для хранения в БД

        fetch('/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                point_start: startPoint,
                point_final: endPoint,
                cost: costRoute,
                route_data: routeData
            })
        })
            .then(response => response.json())
            .then(data => {
                window.showNotification(data.message, data.status);

                if (data.status === 'success') {
                    // Если заказ успешно создан, редирект на страницу заказа через вреся
                    setTimeout(() => {
                        window.location.href = `/trip/${data.tripId}`;
                    }, 4000);
                }
            })
            .catch(error => {
                console.error(error);
                window.showNotification('Ошибка при создании заказа', 'fail');
            });
    });

    document.querySelector('#removeControls').addEventListener('click', function (e) {
        clearAllControls();
    });

    function extractRouteData(route) {
        return {
            points: route.getWayPoints().toArray().map(point => point.geometry.getCoordinates()),
            path: route.getPaths().toArray().map(path => path.geometry.getCoordinates()),
            distance: route.getLength(),
            duration: route.getJamsTime()
        };
    }

    function route() {
        if (!placeMarksSelected()) {
            window.showNotification('Необходимо выбрать адрес из выпадающего списка', 'fail')
            return;
        }
        removeRouteOnMap();
        ymaps.route([
            startPlacemark._geoObjectComponent._geometry._coordinates,
            endPlacemark._geoObjectComponent._geometry._coordinates
        ] , {
            reverseGeocoding: true,
            routingMode: 'auto',
            boundedBy: boundsKHV,
            mapStateAutoApply: true,
            avoidTrafficJams: true,
        }).done(function (route) {
            currentRoute = route;
            route.options.set("mapStateAutoApply", true);
            myMap.geoObjects.add(route);
            document.querySelector('#duration').innerText = getTimeRoute(route.getHumanTime());
            document.querySelector('#distance').innerText = getDistanceRoute(route.getHumanLength());
            trafficScore = getTrafficScore();
            calculateCost();
        }, function (err) {
            throw err;
        }, this);
    }


    function geocode(address, isStart) {
        return ymaps.geocode(address, { results: 1 }).then(function (res) {
            let firstGeoObject = res.geoObjects.get(0);
            let coords = firstGeoObject.geometry.getCoordinates();
            let bounds = firstGeoObject.properties.get('boundedBy');

            let newPlacemark = new ymaps.Placemark(coords, {
                balloonContent: 'Адрес: ' + address,
            }, {
                preset: isStart ? 'islands#violetDotIcon' : 'islands#orangeDotIcon'
            });

            myMap.geoObjects.add(newPlacemark);

            if (isStart) {
                if (startPlacemark) {
                    myMap.geoObjects.remove(startPlacemark);
                }
                startPlacemark = newPlacemark;
                startPoint = address;
            } else {
                if (endPlacemark) {
                    myMap.geoObjects.remove(endPlacemark);
                }
                endPlacemark = newPlacemark;
                endPoint = address;
            }

            myMap.setBounds(bounds, { checkZoomRange: true });

            // Проверка, установлены ли обе точки
            if (placeMarksHasData()) {
                route(); // Автоматическое построение маршрута
            }
        });
    }

    function placeMarksHasData () {
        return (startPlacemark && endPlacemark);
    }

    function placeMarksSelected () {
        return (startPointSelected && endPointSelected);
    }

    function removePlacemarkOnMap () {
        if (startPlacemark) {
            myMap.geoObjects.remove(startPlacemark);
        }
        if (endPlacemark) {
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
        timeInMIN = minutes;
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

        distanceInKM = (unit === 'км');
        distanceRoute = number;

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

    function getTrafficScore () {
        return actualProvider.state._data.level;
    }

    function clearAllControls() {
        removeRouteOnMap();
        currentRoute = null;
        removePlacemarkOnMap();
        startPlacemark = null;
        startPoint = null;
        endPlacemark = null;
        endPoint = null;
        timeInMIN = null;
        distanceRoute = null;
        distanceInKM = null;
        costRoute = null;
        startPointSelected = false;
        endPointSelected = false;
        document.querySelector('#startPoint').value = '';
        document.querySelector('#endPoint').value = '';
        document.querySelector('#duration').innerText = '';
        document.querySelector('#distance').innerText = '';
        document.querySelector('#cost').innerText = '';
    }

    function calculateCost() {
        $.ajax({
            url: '/calculate-cost',
            method: 'POST',
            data: { distance: distanceRoute, distanceInKM: distanceInKM, duration: timeInMIN, trafficScore: trafficScore },
            success: function(response) {
                $('#cost').text(response.cost + ' руб.'); // Обновление поля стоимости на странице
                costRoute = response.cost
            },

            error: function() {
                console.error("Ошибка при расчете стоимости");
            }
        });
    }
}


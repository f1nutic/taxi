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
    let endPlacemark;
    let currentRoute;
    let timeInMIN;
    let distanceInKM;
    let distanceRoute;
    let costRoute;
    let trafficScore;

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


    // И так далее, в зависимости от того, какую информацию вы хотите отобразить

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
        const startPoint = document.querySelector('#startPoint').value;
        const endPoint = document.querySelector('#endPoint').value;
        const duration = document.querySelector('#duration').innerText;
        const distance = document.querySelector('#distance').innerText;
        const cost = document.querySelector('#cost').innerText;
        const userId = '#{userId}'; // Получение идентификатора текущего пользователя из сессии
        fetch('/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ point_start: startPoint, point_final: endPoint, duration, distance, cost: cost, customer:userId })

        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Возможно, здесь вы захотите что-то сделать с ответом от сервера
        })
        .catch(error => console.error(error));
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
                preset: isStart ? 'islands#redDotIcon' : 'islands#blueDotIcon'
            });

            myMap.geoObjects.add(newPlacemark);

            if (isStart) {
                if (startPlacemark) {
                    myMap.geoObjects.remove(startPlacemark);
                }
                startPlacemark = newPlacemark;
            } else {
                if (endPlacemark) {
                    myMap.geoObjects.remove(endPlacemark);
                }
                endPlacemark = newPlacemark;
            }

            myMap.setBounds(bounds, { checkZoomRange: true });

            // Проверка, установлены ли обе точки
            if (startPlacemark && endPlacemark) {
                route(); // Автоматическое построение маршрута
            }
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
        endPlacemark = null;
        timeInMIN = null;
        distanceRoute = null;
        distanceInKM = null;
        costRoute = null;
        document.querySelector('#startPoint').value = '';
        document.querySelector('#endPoint').value = '';
        document.querySelector('#duration').innerText = '';
        document.querySelector('#distance').innerText = '';
        document.querySelector('#cost').innerText = '';
    }

    function calculateCost() {
        $.ajax({
            url: '/calculate-cost', // Путь к вашему серверному API
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


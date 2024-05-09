window.addEventListener('DOMContentLoaded', (event) => {
    const notification = document.getElementById('notification');
    const params = new URLSearchParams(window.location.search);
    const message = params.get('message');
    const status = params.get('status');

    if (message) {
        document.getElementById('notificationMessage').textContent = message;
        notification.classList.remove('opacity-0');
        notification.className = `fixed right-4 top-28 text-white px-4 py-2 rounded-md z-50 transition-opacity duration-500`;
        if (status === 'success') {
            notification.style.backgroundColor = 'green';
        }
        else {
            notification.style.backgroundColor = 'red';
        }

        // Установите timeout, чтобы показать уведомление и скрыть его через 5 секунд
        setTimeout(() => {
            notification.style.transition = 'opacity 0.5s';
            notification.style.opacity = '1';
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.classList.add('opacity-0');
                }, 500); // Подождите пока анимация исчезновения завершится
            }, 4500); // 4500 мс показа + 500 мс исчезновения
        }, 10); // Небольшая задержка перед началом анимации
    }
});

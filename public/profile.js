function formatDate(date, includeTime = false) {
    const d = new Date(date);
    let day = ('0' + d.getDate()).slice(-2);
    let month = ('0' + (d.getMonth() + 1)).slice(-2);
    let year = d.getFullYear();

    if (includeTime) {
        let hours = ('0' + d.getHours()).slice(-2);
        let minutes = ('0' + d.getMinutes()).slice(-2);
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    } else {
        return `${day}.${month}.${year}`;
    }
}

module.exports = { formatDate };
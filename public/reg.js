document.getElementById('birthday').addEventListener('change', function () {
    const dob = new Date(this.value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    const hint = document.getElementById('birthdateHint');
    if (age < 18) {
        hint.textContent = 'Вам должно быть не менее 18 лет на момент регистрации.';
        hint.classList.remove('hidden');
        this.value = '';
    } else {
        hint.classList.add('hidden');
    }
});

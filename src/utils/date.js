function capitalize(str) {
  const words = str.split(' ');
  words[2] = words[2].charAt(0).toUpperCase() + words[2].slice(1);
  return words.join(' ');
}

function formatTimeUntilBirthday(birthday) {
  const now = new Date();
  const parsedBirthday = new Date(birthday);
  const birthdayDate = new Date(now.getFullYear(), parsedBirthday.getMonth(), parsedBirthday.getDate());

  // Check if the birthday has already occurred this year
  if (
    now.getMonth() > birthdayDate.getMonth() ||
    (now.getMonth() === birthdayDate.getMonth() && now.getDate() > birthdayDate.getDate())
  ) {
    birthdayDate.setFullYear(now.getFullYear() + 1);
  }

  // Check if the birthday is today
  if (
    now.getDate() === birthdayDate.getDate() &&
    now.getMonth() === birthdayDate.getMonth()
  ) {
    return 'hoje';
  }

  // For birthdays that will occur in the future
  const msDiff = birthdayDate.getTime() - now.getTime();
  const totalDays = Math.floor(msDiff / (1000 * 60 * 60 * 24));
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;
  const hours = Math.floor((msDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const parts = [];

  if (months > 0) {
    parts.push(`${months} mês${months > 1 ? 'es' : ''}`);
  }
  if (days > 0) {
    parts.push(`${days} dia${days > 1 ? 's' : ''}`);
  }
  if (hours > 0 && months === 0) {
    parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
  }

  if (parts.length === 0) return 'em breve';
  if (parts.length === 1) return parts[0];
  return parts.slice(0, -1).join(', ') + ' e ' + parts.slice(-1);
}

function formatBirthdayMessage(birthdayData) {
  const formattedDate = capitalize(birthdayData.birthdate.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  }));

  const time = formatTimeUntilBirthday(birthdayData.birthdate);

  if (time === 'hoje') {
    if (birthdayData.show_age) {
      return {
        message: `De acordo com a minha memória, hoje é seu aniversário e você está completando ${birthdayData.age} anos! Parabéns! 🎉`,
        isToday: true,
      };
    }
    return {
      message: 'De acordo com a minha memória, hoje é seu aniversário! Parabéns! 🎉',
      isToday: true,
    };
  }

  let message = `De acordo com a minha memória, seu aniversário é em ${time}, no dia ${formattedDate}`;
  if (birthdayData.show_age) {
    message += `, e você estará completando ${birthdayData.age + 1} anos`;
  }
  message += '! Tá logo aí! 🎉';

  return {
    message,
    isToday: false,
  };
}

module.exports = {
  formatBirthdayMessage,
};

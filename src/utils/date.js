function capitalize(str) {
  const words = str.split(' ');
  words[2] = words[2].charAt(0).toUpperCase() + words[2].slice(1);
  return words.join(' ');
}

function formatTimeUntilBirthday(birthday) {
  const now = new Date();
  const birthDate = new Date(birthday);

  // Generate a new date object for the birthday this year
  const nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());

  // If the birthday has already occurred this year, set the next birthday to next year
  if (
    now > nextBirthday &&
    !(now.getDate() === birthDate.getDate() && now.getMonth() === birthDate.getMonth())
  ) {
    nextBirthday.setFullYear(now.getFullYear() + 1);
  }

  // If the birthday is today, return 'hoje'
  if (
    now.getDate() === nextBirthday.getDate() &&
    now.getMonth() === nextBirthday.getMonth()
  ) {
    return 'hoje';
  }

  // Calculate the difference in months and days
  let months = nextBirthday.getMonth() - now.getMonth();
  let days = nextBirthday.getDate() - now.getDate();

  if (months < 0 || (months === 0 && days < 0)) {
    months += 12;
  }

  if (days < 0) {
    const prevMonth = new Date(nextBirthday.getFullYear(), nextBirthday.getMonth(), 0).getDate();
    days += prevMonth;
    months = (months - 1 + 12) % 12;
  }

  const parts = [];
  if (months > 0) parts.push(`${months} ${months > 1 ? 'meses' : 'mês'}`);
  if (days > 0) parts.push(`${days} dia${days > 1 ? 's' : ''}`);

  return parts.length > 0 ? parts.join(' e ') : 'em breve';
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

function formatBirthdayLine(userBirthday) {
  const birthDateObj = new Date(userBirthday.birthdate);
  const date = capitalize(birthDateObj.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  }));
  const inText = formatTimeUntilBirthday(userBirthday.birthdate);

  if (userBirthday.show_age) {
    return `🎂 <@${userBirthday.user_id}> - ${date} (${inText}) — fará ${userBirthday.age + 1} anos`;
  }
  return `🎉 <@${userBirthday.user_id}> - ${date} (${inText})`;
}

module.exports = {
  formatBirthdayMessage,
  formatBirthdayLine,
};
